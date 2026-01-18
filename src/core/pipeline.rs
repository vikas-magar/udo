use crate::core::error::{Result, UdoError};
use crate::core::schema::infer_schema;
use crate::utils::json::json_rows_to_batch;
use arrow::datatypes::Schema;
use arrow::record_batch::RecordBatch;
use async_trait::async_trait;
use futures::StreamExt;
use simd_json::OwnedValue;
use std::sync::Arc;
use tracing::{debug, error, info};

#[async_trait]
pub trait InputSource: Send + Sync {
    async fn next_record(&mut self) -> Result<Option<OwnedValue>>;
}

#[async_trait]
pub trait DataProcessor: Send + Sync {
    async fn process(&self, record: OwnedValue) -> Result<Option<OwnedValue>>;
    fn update_schema(&self, _schema: &Arc<Schema>) -> Result<Arc<Schema>> {
        Ok(_schema.clone())
    }
}

#[async_trait]
pub trait OutputSink: Send + Sync {
    async fn write_batch(&mut self, batch: RecordBatch) -> Result<()>;
    async fn close(&mut self) -> Result<()>;
}

#[async_trait]
pub trait DlqSink: Send + Sync {
    async fn write_dead_letter(&mut self, record: OwnedValue, reason: String) -> Result<()>;
}

pub struct PipelineRunner {
    source: Box<dyn InputSource>,
    processors: Vec<Box<dyn DataProcessor>>,
    sink_factory: Option<Box<dyn Fn(Arc<Schema>) -> Result<Box<dyn OutputSink>> + Send + Sync>>,
    sink: Option<Box<dyn OutputSink>>,
    dlq: Option<Box<dyn DlqSink>>,
    batch_size: usize,
    warmup_rows: usize,
}

impl PipelineRunner {
    pub fn new(source: Box<dyn InputSource>, batch_size: usize) -> Self {
        Self {
            source,
            processors: Vec::new(),
            sink_factory: None,
            sink: None,
            dlq: None,
            batch_size,
            warmup_rows: 100,
        }
    }

    pub fn set_dlq(&mut self, dlq: Box<dyn DlqSink>) {
        self.dlq = Some(dlq);
    }

    pub fn set_warmup_rows(&mut self, rows: usize) {
        self.warmup_rows = rows;
    }

    pub fn add_processor(&mut self, processor: Box<dyn DataProcessor>) {
        self.processors.push(processor);
    }

    pub fn set_sink_factory<F>(&mut self, factory: F)
    where
        F: Fn(Arc<Schema>) -> Result<Box<dyn OutputSink>> + Send + Sync + 'static,
    {
        self.sink_factory = Some(Box::new(factory));
    }

    pub async fn run(&mut self, mut initial_schema: Option<Arc<Schema>>) -> Result<()> {
        let mut total_rows = 0;

        if initial_schema.is_none() {
            info!(warmup_limit = %self.warmup_rows, "Starting adaptive warm-up phase");
            let mut warmup_records = Vec::new();
            while warmup_records.len() < self.warmup_rows {
                match self.source.next_record().await {
                    Ok(Some(record)) => warmup_records.push(record),
                    Ok(None) => break,
                    Err(e) => {
                        error!(error = %e, "Source error during warm-up");
                        return Err(e);
                    }
                }
            }

            if warmup_records.is_empty() {
                return Err(UdoError::Pipeline(
                    "Source yielded no records during warm-up".to_string(),
                ));
            }

            let schema_array = OwnedValue::Array(warmup_records.clone());
            initial_schema = Some(Arc::new(infer_schema(&schema_array, None)?));

            let mut current_schema = initial_schema.unwrap();
            for proc in &self.processors {
                current_schema = proc.update_schema(&current_schema)?;
            }

            if let Some(factory) = &self.sink_factory {
                self.sink = Some(factory(current_schema.clone())?);
            }

            let mut processed_warmup = Vec::new();
            for record in warmup_records {
                if let Some(rec) = self.process_record_sequential(record).await? {
                    processed_warmup.push(rec);
                }
            }
            if !processed_warmup.is_empty() {
                self.flush_to_sink(&processed_warmup, &current_schema)
                    .await?;
                total_rows += processed_warmup.len();
            }

            self.run_main_loop(current_schema, total_rows).await
        } else {
            let mut current_schema = initial_schema.unwrap();
            for proc in &self.processors {
                current_schema = proc.update_schema(&current_schema)?;
            }
            if let Some(factory) = &self.sink_factory {
                self.sink = Some(factory(current_schema.clone())?);
            }
            self.run_main_loop(current_schema, 0).await
        }
    }

    async fn process_record_sequential(
        &self,
        mut record: OwnedValue,
    ) -> Result<Option<OwnedValue>> {
        for proc in &self.processors {
            if let Some(processed) = proc.process(record).await? {
                record = processed;
            } else {
                return Ok(None);
            }
        }
        Ok(Some(record))
    }

    async fn run_main_loop(&mut self, schema: Arc<Schema>, mut total_rows: usize) -> Result<()> {
        let mut row_buffer = Vec::with_capacity(self.batch_size);
        let processors = Arc::new(self.processors.drain(..).collect::<Vec<_>>());

        let source = std::mem::replace(&mut self.source, Box::new(EmptySource));
        let mut sink = self.sink.take();
        let mut dlq = self.dlq.take();

        let stream =
            futures::stream::unfold(source, |mut source: Box<dyn InputSource>| async move {
                match source.next_record().await {
                    Ok(Some(record)) => Some((record, source)),
                    _ => None,
                }
            });

        let processed_stream = stream
            .map(|record| {
                let procs = processors.clone();
                tokio::spawn(async move {
                    let mut current_record = Some(record);
                    let num_procs = procs.len();
                    for i in 0..num_procs {
                        if let Some(rec) = current_record.take() {
                            let rec_clone = rec.clone();
                            match procs[i].process(rec).await {
                                Ok(res) => current_record = res,
                                Err(e) => {
                                    return Err((rec_clone, e.to_string()));
                                }
                            }
                        } else {
                            break;
                        }
                    }
                    Ok(current_record)
                })
            })
            .buffer_unordered(num_cpus::get() * 2);

        tokio::pin!(processed_stream);

        while let Some(join_result) = processed_stream.next().await {
            match join_result {
                Ok(Ok(Some(record))) => {
                    row_buffer.push(record);
                    if row_buffer.len() >= self.batch_size {
                        if let Some(s) = sink.as_mut() {
                            let batch = json_rows_to_batch(&row_buffer, schema.clone())?;
                            s.write_batch(batch).await?;
                        }
                        total_rows += row_buffer.len();
                        row_buffer.clear();
                        debug!(total = %total_rows, "Batch flushed to sink");
                    }
                }
                Ok(Ok(None)) => {} // Record filtered out
                Ok(Err((failed_record, reason))) => {
                    error!(reason = %reason, "Processing failed, sending to DLQ");
                    if let Some(d) = dlq.as_mut() {
                        d.write_dead_letter(failed_record, reason).await?;
                    }
                }
                Err(e) => {
                    error!(error = %e, "Task join error");
                }
            }
        }

        if !row_buffer.is_empty() {
            if let Some(s) = sink.as_mut() {
                let batch = json_rows_to_batch(&row_buffer, schema.clone())?;
                s.write_batch(batch).await?;
            }
            total_rows += row_buffer.len();
        }

        if let Some(s) = sink.as_mut() {
            s.close().await?;
        }

        info!(total_rows = %total_rows, "Pipeline execution completed successfully");
        Ok(())
    }

    async fn flush_to_sink(&mut self, records: &[OwnedValue], schema: &Arc<Schema>) -> Result<()> {
        if let Some(sink) = self.sink.as_mut() {
            let batch = json_rows_to_batch(records, schema.clone())?;
            sink.write_batch(batch).await?;
        }
        Ok(())
    }
}

struct EmptySource;
#[async_trait]
impl InputSource for EmptySource {
    async fn next_record(&mut self) -> Result<Option<OwnedValue>> {
        Ok(None)
    }
}
