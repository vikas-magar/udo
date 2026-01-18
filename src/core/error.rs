use thiserror::Error;

#[derive(Error, Debug)]
pub enum UdoError {
    #[error("IO Error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Arrow Error: {0}")]
    Arrow(#[from] arrow::error::ArrowError),

    #[error("Parquet Error: {0}")]
    Parquet(#[from] parquet::errors::ParquetError),

    #[error("JSON Parsing Error: {0}")]
    JsonParse(#[from] simd_json::Error),

    #[error("Configuration Error: {0}")]
    Config(String),

    #[error("Pipeline Error: {0}")]
    Pipeline(String),

    #[cfg(feature = "kafka")]
    #[error("Kafka Error: {0}")]
    Kafka(#[from] rdkafka::error::KafkaError),

    #[cfg(feature = "cloud")]
    #[error("Object Store Error: {0}")]
    ObjectStore(#[from] object_store::Error),

    #[cfg(feature = "cloud")]
    #[error("URL Parse Error: {0}")]
    UrlParse(#[from] url::ParseError),

    #[error("AI Model Error: {0}")]
    AiModel(String),

    #[error("Unknown Error: {0}")]
    Unknown(String),
}

pub type Result<T> = std::result::Result<T, UdoError>;
