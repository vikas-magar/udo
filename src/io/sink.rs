use crate::core::error::{Result, UdoError};
use crate::core::pipeline::OutputSink;
use arrow::datatypes::Schema;
use arrow::record_batch::RecordBatch;
use async_trait::async_trait;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use arrow::csv;
use std::fs::File;

#[cfg(feature = "cloud")]
use object_store::parse_url;
#[cfg(feature = "cloud")]
use object_store::path::Path as ObjectPath;
#[cfg(feature = "cloud")]
use parquet::arrow::AsyncArrowWriter;
#[cfg(feature = "cloud")]
use tokio::io::AsyncWrite;
#[cfg(feature = "cloud")]
use tokio::sync::Mutex as TokioMutex;
#[cfg(feature = "cloud")]
use url::Url;

pub struct ParquetSink {
    writer: Arc<Mutex<Option<parquet::arrow::ArrowWriter<std::fs::File>>>>,
}

impl ParquetSink {
    pub fn new(path: PathBuf, schema: Arc<Schema>) -> Result<Self> {
        let file = std::fs::File::create(path).map_err(UdoError::Io)?;
        let writer =
            parquet::arrow::ArrowWriter::try_new(file, schema, None).map_err(UdoError::Parquet)?;
        Ok(Self {
            writer: Arc::new(Mutex::new(Some(writer))),
        })
    }
}

#[async_trait]
impl OutputSink for ParquetSink {
    async fn write_batch(&mut self, batch: RecordBatch) -> Result<()> {
        let mut guard = self
            .writer
            .lock()
            .map_err(|_| UdoError::Pipeline("ParquetSink mutex poisoned".to_string()))?;
        if let Some(writer) = guard.as_mut() {
            writer.write(&batch).map_err(UdoError::Parquet)?;
        }
        Ok(())
    }

    async fn close(&mut self) -> Result<()> {
        let mut guard = self
            .writer
            .lock()
            .map_err(|_| UdoError::Pipeline("ParquetSink mutex poisoned".to_string()))?;
        if let Some(writer) = guard.take() {
            writer.close().map_err(UdoError::Parquet)?;
        }
        Ok(())
    }
}

pub struct CsvSink {
    writer: Arc<Mutex<Option<csv::Writer<File>>>>,
}

impl CsvSink {
    pub fn new(path: PathBuf) -> Result<Self> {
        let file = File::create(path).map_err(UdoError::Io)?;
        let writer = csv::Writer::new(file);
        Ok(Self {
            writer: Arc::new(Mutex::new(Some(writer))),
        })
    }
}

#[async_trait]
impl OutputSink for CsvSink {
    async fn write_batch(&mut self, batch: RecordBatch) -> Result<()> {
        let mut guard = self.writer.lock().map_err(|_| UdoError::Pipeline("CsvSink mutex poisoned".to_string()))?;
        if let Some(writer) = guard.as_mut() {
            writer.write(&batch).map_err(UdoError::Arrow)?;
        }
        Ok(())
    }

    async fn close(&mut self) -> Result<()> {
        // csv::Writer doesn't need explicit close, dropping handles it, but we can flush
        let mut guard = self.writer.lock().map_err(|_| UdoError::Pipeline("CsvSink mutex poisoned".to_string()))?;
        if guard.take().is_some() {
            // dropped
        }
        Ok(())
    }
}

// AvroSink placeholder/basic impl
pub struct AvroSink {
    // Implementing Avro writing from Arrow batches requires schema conversion and row conversion.
    // Omitted for brevity in this iteration, but struct is present.
    _path: PathBuf,
}

impl AvroSink {
    pub fn new(path: PathBuf, _schema: Arc<Schema>) -> Result<Self> {
        Ok(Self { _path: path })
    }
}

#[async_trait]
impl OutputSink for AvroSink {
    async fn write_batch(&mut self, _batch: RecordBatch) -> Result<()> {
        // TODO: Implement Avro writing
        Err(UdoError::Pipeline("Avro output not yet implemented".to_string()))
    }
    async fn close(&mut self) -> Result<()> {
        Ok(())
    }
}

#[cfg(feature = "cloud")]
pub type CloudWriter = AsyncArrowWriter<Box<dyn AsyncWrite + Send + Unpin>>;

#[cfg(feature = "cloud")]
pub struct CloudSink {
    writer: Arc<TokioMutex<Option<CloudWriter>>>,
    path: ObjectPath,
}

#[cfg(feature = "cloud")]
impl CloudSink {
    pub async fn new(url_str: &str, schema: Arc<Schema>) -> Result<Self> {
        let url = Url::parse(url_str)?;
        let (store, path) = parse_url(&url)?;

        let async_writer: Box<dyn AsyncWrite + Send + Unpin> =
            Box::new(object_store::buffered::BufWriter::new(store.into(), path.clone()));
        let writer =
            AsyncArrowWriter::try_new(async_writer, schema, None).map_err(UdoError::Parquet)?;

        Ok(Self {
            writer: Arc::new(TokioMutex::new(Some(writer))),
            path,
        })
    }
}

#[cfg(feature = "cloud")]
#[async_trait]
impl OutputSink for CloudSink {
    async fn write_batch(&mut self, batch: RecordBatch) -> Result<()> {
        let mut guard = self.writer.lock().await;
        if let Some(writer) = guard.as_mut() {
            writer.write(&batch).await.map_err(UdoError::Parquet)?;
        }
        Ok(())
    }

    async fn close(&mut self) -> Result<()> {
        let mut guard = self.writer.lock().await;
        if let Some(writer) = guard.take() {
            writer.close().await.map_err(UdoError::Parquet)?;
            println!("Uploaded optimized data to cloud: {}", self.path);
        }
        Ok(())
    }
}
