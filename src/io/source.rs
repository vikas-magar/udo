use crate::core::error::{Result, UdoError};
use crate::core::pipeline::InputSource;
use crate::utils::json::parse_json;
use apache_avro::Reader as AvroReader;
use arrow::csv;
use arrow::json::LineDelimitedWriter;
use async_trait::async_trait;
use simd_json::OwnedValue;
use std::collections::VecDeque;
use std::fs::File as StdFile;
use std::path::PathBuf;
use tokio::fs::File;
use tokio::io::{AsyncBufReadExt, BufReader};

#[cfg(feature = "kafka")]
use rdkafka::config::ClientConfig;
#[cfg(feature = "kafka")]
use rdkafka::consumer::{Consumer, StreamConsumer};
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
        let bytes_read = self
            .reader
            .read_line(&mut self.line_buffer)
            .await
            .map_err(UdoError::Io)?;
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

pub struct CsvSource {
    reader: csv::Reader<StdFile>,
    buffer: VecDeque<OwnedValue>,
}

impl CsvSource {
    pub fn new(path: PathBuf) -> Result<Self> {
        let file = StdFile::open(path).map_err(UdoError::Io)?;
        let reader = csv::ReaderBuilder::new(std::sync::Arc::new(arrow::datatypes::Schema::empty())) // Schema will be inferred
            .with_header(true)
            .build(file)
            .map_err(UdoError::Arrow)?;
        
        Ok(Self {
            reader,
            buffer: VecDeque::new(),
        })
    }
}

#[async_trait]
impl InputSource for CsvSource {
    async fn next_record(&mut self) -> Result<Option<OwnedValue>> {
        if let Some(record) = self.buffer.pop_front() {
            return Ok(Some(record));
        }

        match self.reader.next() {
            Some(Ok(batch)) => {
                let mut buf = Vec::new();
                let mut writer = LineDelimitedWriter::new(&mut buf);
                writer.write(&batch).map_err(UdoError::Arrow)?;
                writer.finish().map_err(UdoError::Arrow)?;
                drop(writer);

                let s = String::from_utf8(buf).map_err(|e| UdoError::Unknown(e.to_string()))?;
                for line in s.lines() {
                    let mut line_bytes = line.as_bytes().to_vec();
                    let owned = simd_json::to_owned_value(&mut line_bytes).map_err(UdoError::JsonParse)?;
                    self.buffer.push_back(owned);
                }
                
                self.buffer.pop_front().map(|r| Ok(Some(r))).unwrap_or(Ok(None))
            }
            Some(Err(e)) => Err(UdoError::Arrow(e)),
            None => Ok(None),
        }
    }
}

pub struct AvroSource {
    reader: AvroReader<'static, StdFile>,
}

impl AvroSource {
    pub fn new(path: PathBuf) -> Result<Self> {
        let file = StdFile::open(path).map_err(UdoError::Io)?;
        let reader = AvroReader::new(file).map_err(|e| UdoError::Unknown(e.to_string()))?;
        Ok(Self { reader })
    }
}

#[async_trait]
impl InputSource for AvroSource {
    async fn next_record(&mut self) -> Result<Option<OwnedValue>> {
        match self.reader.next() {
            Some(Ok(value)) => {
                let json_val: serde_json::Value = apache_avro::from_value(&value).map_err(|e| UdoError::Unknown(e.to_string()))?;
                let s = serde_json::to_string(&json_val).map_err(|e| UdoError::Unknown(e.to_string()))?;
                let mut bytes = s.into_bytes();
                let owned = simd_json::to_owned_value(&mut bytes).map_err(UdoError::JsonParse)?;
                Ok(Some(owned))
            }
            Some(Err(e)) => Err(UdoError::Unknown(e.to_string())),
            None => Ok(None),
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
        loop {
            match self.consumer.recv().await {
                Ok(msg) => {
                    let payload = msg.payload().unwrap_or_default();
                    match parse_json(payload) {
                        Ok(val) => return Ok(Some(val)),
                        Err(e) => {
                            eprintln!("Warning: Skipping corrupted JSON record from Kafka: {}", e);
                            continue;
                        }
                    }
                }
                Err(e) => {
                    eprintln!("Error receiving from Kafka: {}", e);
                    // For now, continue on error. In prod, maybe check if error is fatal.
                    continue;
                }
            }
        }
    }
}
