use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize)]
pub struct PipelineConfig {
    pub source: SourceConfig,
    pub processors: Vec<ProcessorConfig>,
    pub sink: SinkConfig,
    #[serde(default)]
    pub dlq: Option<SinkConfig>,
    #[serde(default = "default_batch_size")]
    pub batch_size: usize,
}

fn default_batch_size() -> usize {
    10000
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum SourceConfig {
    File { path: PathBuf },
    #[cfg(feature = "kafka")]
    Kafka { brokers: String, group_id: String, topic: String },
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ProcessorConfig {
    PiiMasker { 
        mode: String,
        #[serde(default)]
        use_ner: bool 
    },
    #[cfg(feature = "semantic")]
    SemanticPruner { 
        query: String, 
        #[serde(default = "default_threshold")]
        threshold: f32 
    },
}

#[cfg(feature = "semantic")]
fn default_threshold() -> f32 {
    0.85
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum SinkConfig {
    File { path: PathBuf },
    #[cfg(feature = "cloud")]
    Cloud { url: String },
}
