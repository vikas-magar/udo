use async_trait::async_trait;
use std::path::PathBuf;
use tokio::fs::File;
use tokio::io::{AsyncBufReadExt, BufReader};
use simd_json::OwnedValue;
use crate::core::error::{Result, UdoError};
use crate::core::pipeline::InputSource;
use crate::utils::json::parse_json;

#[cfg(feature = "kafka")]
use rdkafka::consumer::{StreamConsumer, Consumer};
#[cfg(feature = "kafka")]
use rdkafka::config::ClientConfig;
#[cfg(feature = "kafka")]
use rdkafka::message::Message;

pub struct FileSource {
    reader: BufReader<File>,
    line_buffer: String,
}

impl FileSource {
    pub async fn new(path: PathBuf) -> Result<Self> {
        let file = File::open(path).await.map_err(UdoError::Io)?;
        Ok(Self {
            reader: BufReader::new(file),
            line_buffer: String::new(),
        })
    }
}

#[async_trait]
impl InputSource for FileSource {
    async fn next_record(&mut self) -> Result<Option<OwnedValue>> {
        self.line_buffer.clear();
        let bytes_read = self.reader.read_line(&mut self.line_buffer).await.map_err(UdoError::Io)?;
        if bytes_read == 0 {
            return Ok(None);
        }
        
        match parse_json(self.line_buffer.as_bytes()) {
            Ok(val) => Ok(Some(val)),
            Err(_) => {
                eprintln!("Warning: Skipping corrupted JSON record");
                Box::pin(self.next_record()).await
            }
        }
    }
}

#[cfg(feature = "kafka")]
pub struct KafkaSource {
    consumer: StreamConsumer,
}

#[cfg(feature = "kafka")]
impl KafkaSource {
    pub fn new(brokers: &str, group_id: &str, topic: &str) -> Result<Self> {
        let consumer: StreamConsumer = ClientConfig::new()
            .set("bootstrap.servers", brokers)
            .set("group.id", group_id)
            .set("auto.offset.reset", "earliest")
            .create()?;

        consumer.subscribe(&[topic])?;
        Ok(Self { consumer })
    }
}

#[cfg(feature = "kafka")]
#[async_trait]
impl InputSource for KafkaSource {
    async fn next_record(&mut self) -> Result<Option<OwnedValue>> {
        match self.consumer.recv().await {
            Ok(msg) => {
                let payload = msg.payload().unwrap_or_default();
                match parse_json(payload) {
                    Ok(val) => Ok(Some(val)),
                    Err(_) => {
                        eprintln!("Warning: Skipping corrupted JSON record from Kafka");
                        Box::pin(self.next_record()).await
                    }
                }
            }
            Err(e) => {
                // Return None on fatal kafka error, or log and continue?
                // For now, let's treat it as end of stream or fatal
                Err(UdoError::Kafka(e))
            }
        }
    }
}
