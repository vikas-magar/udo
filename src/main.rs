use anyhow::{bail, Context, Result};
use clap::Parser;
use simd_json::OwnedValue;
use std::path::PathBuf;
use std::sync::Arc;
use std::time::Instant;
#[cfg(feature = "db")]
use tracing::error;
use tracing::info;

use udo::core::pipeline::{InputSource, SinkFactory};

use clap::Subcommand;
#[cfg(feature = "db")]
use udo::api::metrics::MetricsDb;
#[cfg(feature = "server")]
use udo::api::server::start_server;
#[cfg(feature = "semantic")]
use udo::processors::semantic::{IntentAnalyzer, SemanticProcessor};

#[derive(Parser, Debug)]
#[command(version, about, long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Option<Commands>,

    #[clap(flatten)]
    run_args: RunArgs,
}

#[derive(Subcommand, Debug)]
enum Commands {
    /// Start the Metrics API Server
    #[cfg(feature = "server")]
    Server,
}

#[derive(Parser, Debug)]
struct RunArgs {
    /// Path to a pipeline configuration file (YAML)
    #[arg(short, long)]
    config: Option<PathBuf>,

    /// Input file (NDJSON/JSONL) or Kafka URL
    #[arg(short, long)]
    input: Option<String>,

    /// Output Parquet file or S3/GCS URL
    #[arg(short, long)]
    output: Option<PathBuf>,

    /// Number of rows to scan for schema inference (default: 1000). Set to 0 to scan all.
    #[arg(long, default_value_t = 1000)]
    scan_rows: usize,

    /// Batch size for writing to Parquet (default: 10000)
    #[arg(long, default_value_t = 10000)]
    batch_size: usize,

    /// Natural language query to filter columns (Semantic Slicing)
    #[arg(short, long)]
    query: Option<String>,

    /// Similarity threshold for semantic filtering (default: 0.85)
    #[arg(long, default_value_t = 0.85)]
    sim_threshold: f32,

    /// PII masking mode (none, mask, hash)
    #[arg(long, default_value = "none")]
    pii_mode: String,

    /// Use NER for advanced PII detection (Name, Loc, Org)
    #[arg(long, default_value_t = false)]
    pii_ner: bool,

    /// Local path to NER model directory (contains config.json, tokenizer.json, model.safetensors)
    #[arg(long)]
    ner_model_path: Option<PathBuf>,

    /// Local path to Semantic model directory
    #[arg(long)]
    semantic_model_path: Option<PathBuf>,
}

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize Tracing
    tracing_subscriber::fmt::init();

    let cli = Cli::parse();

    #[cfg(feature = "server")]
    if let Some(Commands::Server) = cli.command {
        start_server("udo_metrics.duckdb")
            .await
            .context("Failed to start server")?;
        return Ok(());
    }

    let args = cli.run_args;

    // Load config if provided, otherwise build from CLI args
    let (source, processors, sink_factory, dlq, batch_size, input_for_schema) =
        if let Some(config_path) = args.config {
            info!(path = ?config_path, "Loading pipeline configuration from YAML");
            let config_str =
                std::fs::read_to_string(&config_path).context("Failed to read config file")?;
            let config: udo::core::config::PipelineConfig =
                serde_yaml::from_str(&config_str).context("Failed to parse YAML config")?;

            let source: Box<dyn InputSource> = match config.source {
                udo::core::config::SourceConfig::File { path } => {
                    Box::new(udo::io::source::FileSource::new(path).await?)
                }
                #[cfg(feature = "kafka")]
                udo::core::config::SourceConfig::Kafka {
                    brokers,
                    group_id,
                    topic,
                } => Box::new(udo::io::source::KafkaSource::new(
                    &brokers, &group_id, &topic,
                )?),
            };

            let mut procs: Vec<Box<dyn udo::core::pipeline::DataProcessor>> = Vec::new();
            for p_cfg in config.processors {
                match p_cfg {
                    udo::core::config::ProcessorConfig::PiiMasker {
                        mode,
                        use_ner: _use_ner,
                        model_path: _model_path,
                    } => {
                        procs.push(Box::new(
                            udo::processors::pii::PiiMasker::new(&mode)
                                .map_err(|e| anyhow::anyhow!(e))?,
                        ));
                        #[cfg(feature = "ner")]
                        if _use_ner {
                            let ner_analyzer = udo::processors::ner::NerAnalyzer::new(_model_path)
                                .map_err(|e| anyhow::anyhow!(e))?;
                            procs.push(Box::new(udo::processors::pii::NerPiiMasker::new(
                                ner_analyzer,
                                &mode,
                            )));
                        }
                    }
                    #[cfg(feature = "semantic")]
                    udo::core::config::ProcessorConfig::SemanticPruner {
                        query,
                        threshold,
                        model_path,
                    } => {
                        let analyzer =
                            IntentAnalyzer::new(model_path).map_err(|e| anyhow::anyhow!(e))?;
                        procs.push(Box::new(SemanticProcessor::new(analyzer, query, threshold)));
                    }
                }
            }

            let sink_factory: SinkFactory = match config.sink {
                udo::core::config::SinkConfig::File { path } => Box::new(move |s| {
                    Ok(Box::new(
                        udo::io::sink::ParquetSink::new(path.clone(), s)
                            .map_err(|e| udo::UdoError::Pipeline(e.to_string()))?,
                    ))
                }),
                #[cfg(feature = "cloud")]
                udo::core::config::SinkConfig::Cloud { url } => {
                    Box::new(move |s| {
                        let url = url.clone();
                        // We need to block here because sink_factory is synchronous in signature,
                        // but CloudSink::new is async.
                        // In a real generic pipeline, we might make the factory async or use a handle.
                        // For CLI context, blocking is acceptable or we need to refactor factory trait.
                        tokio::task::block_in_place(|| {
                            tokio::runtime::Handle::current().block_on(async move {
                                Ok(Box::new(
                                    udo::io::sink::CloudSink::new(&url, s)
                                        .await
                                        .map_err(|e| udo::UdoError::Pipeline(e.to_string()))?,
                                )
                                    as Box<dyn udo::core::pipeline::OutputSink>)
                            })
                        })
                    })
                }
            };

            let dlq: Option<Box<dyn udo::core::pipeline::DlqSink>> =
                if let Some(dlq_cfg) = config.dlq {
                    match dlq_cfg {
                        udo::core::config::SinkConfig::File { path } => Some(Box::new(
                            udo::io::dlq::FileDlq::new(path).map_err(|e| anyhow::anyhow!(e))?,
                        )),
                        #[cfg(feature = "cloud")]
                        udo::core::config::SinkConfig::Cloud { url } => Some(Box::new(
                            udo::io::dlq::CloudDlq::new(&url).map_err(|e| anyhow::anyhow!(e))?,
                        )),
                    }
                } else {
                    None
                };

            // For YAML, we skip Pass 1 schema inference for now or implement it based on source type
            (source, procs, sink_factory, dlq, config.batch_size, None)
        } else {
            // Legacy CLI behavior
            let input_path_str = args
                .input
                .context("Input is required if no config file provided")?;
            let output_path = args
                .output
                .context("Output is required if no config file provided")?;

            let source: Box<dyn InputSource> = if input_path_str.starts_with("kafka://") {
                #[cfg(feature = "kafka")]
                {
                    let parts: Vec<&str> = input_path_str
                        .trim_start_matches("kafka://")
                        .split('/')
                        .collect();
                    if parts.len() < 3 {
                        bail!("Invalid Kafka URL");
                    }
                    Box::new(udo::io::source::KafkaSource::new(
                        parts[0], parts[1], parts[2],
                    )?)
                }
                #[cfg(not(feature = "kafka"))]
                bail!("Kafka feature not enabled")
            } else {
                Box::new(udo::io::source::FileSource::new(PathBuf::from(&input_path_str)).await?)
            };

            let mut procs: Vec<Box<dyn udo::core::pipeline::DataProcessor>> = Vec::new();
            if args.pii_mode != "none" {
                procs.push(Box::new(
                    udo::processors::pii::PiiMasker::new(&args.pii_mode)
                        .map_err(|e| anyhow::anyhow!(e))?,
                ));
                #[cfg(feature = "ner")]
                if args.pii_ner {
                    let ner_analyzer =
                        udo::processors::ner::NerAnalyzer::new(args.ner_model_path.clone())
                            .map_err(|e| anyhow::anyhow!(e))?;
                    procs.push(Box::new(udo::processors::pii::NerPiiMasker::new(
                        ner_analyzer,
                        &args.pii_mode,
                    )));
                }
            }

            #[cfg(feature = "semantic")]
            if let Some(query) = &args.query {
                let analyzer = IntentAnalyzer::new(args.semantic_model_path.clone())
                    .map_err(|e| anyhow::anyhow!(e))?;
                procs.push(Box::new(SemanticProcessor::new(
                    analyzer,
                    query.clone(),
                    args.sim_threshold,
                )));
            }

            let out_path_str = output_path.to_string_lossy().to_string();
            let out_path_clone = out_path_str.clone();
            let sink_factory: SinkFactory = Box::new(move |s| {
                #[cfg(feature = "cloud")]
                {
                    if out_path_clone.starts_with("s3://")
                        || out_path_clone.starts_with("gs://")
                        || out_path_clone.starts_with("az://")
                    {
                        let url = out_path_clone.clone();
                        return tokio::task::block_in_place(|| {
                            tokio::runtime::Handle::current().block_on(async move {
                                Ok(Box::new(
                                    udo::io::sink::CloudSink::new(&url, s)
                                        .await
                                        .map_err(|e| udo::UdoError::Pipeline(e.to_string()))?,
                                )
                                    as Box<dyn udo::core::pipeline::OutputSink>)
                            })
                        });
                    }
                }
                Ok(Box::new(
                    udo::io::sink::ParquetSink::new(PathBuf::from(&out_path_clone), s)
                        .map_err(|e| udo::UdoError::Pipeline(e.to_string()))?,
                ))
            });

            let schema_input = if !input_path_str.starts_with("kafka://") {
                Some(input_path_str)
            } else {
                None
            };
            (
                source,
                procs,
                sink_factory,
                None,
                args.batch_size,
                schema_input,
            )
        };

    let start_time = Instant::now();

    #[cfg(feature = "db")]
    let metrics_db = match MetricsDb::new("udo_metrics.duckdb") {
        Ok(db) => Some(db),
        Err(e) => {
            error!(error = %e, "Failed to initialize Metrics DB");
            None
        }
    };

    // --- Pass 1: Schema Inference ---
    let mut schema = None;
    if let Some(inp) = input_for_schema {
        if args.scan_rows > 0 {
            info!(limit = %args.scan_rows, "Inferring schema from input");
            let mut infer_source = udo::io::source::FileSource::new(PathBuf::from(&inp)).await?;
            let mut schema_rows = Vec::new();
            while schema_rows.len() < args.scan_rows {
                if let Some(record) = infer_source.next_record().await? {
                    schema_rows.push(record);
                } else {
                    break;
                }
            }
            if !schema_rows.is_empty() {
                let schema_array = OwnedValue::Array(schema_rows);
                schema = Some(Arc::new(
                    udo::core::schema::infer_schema(&schema_array, None)
                        .map_err(|e| anyhow::anyhow!(e))?,
                ));
            }
        }
    }

    let mut runner = udo::PipelineRunner::new(source, batch_size);
    if let Some(d) = dlq {
        runner.set_dlq(d);
    }
    if schema.is_none() {
        runner.set_warmup_rows(100);
    }

    for p in processors {
        runner.add_processor(p);
    }

    runner.set_sink_factory(move |s| {
        sink_factory(s).map_err(|e| udo::core::error::UdoError::Pipeline(e.to_string()))
    });

    // Run Pipeline
    runner.run(schema).await.map_err(|e| anyhow::anyhow!(e))?;

    let elapsed = start_time.elapsed();
    info!(duration = ?elapsed, "Job completed");

    #[cfg(feature = "db")]
    if let Some(db) = metrics_db {
        if let Err(e) = db.record_metric(0, elapsed.as_millis() as f64, 0, "pipeline") {
            error!(error = %e, "Failed to record metrics");
        }
    }

    Ok(())
}
