use async_trait::async_trait;
use std::sync::{Arc, Mutex};
use std::path::PathBuf;
use arrow::datatypes::Schema;
use arrow::record_batch::RecordBatch;
use crate::core::error::{Result, UdoError};
use crate::core::pipeline::OutputSink;

#[cfg(feature = "cloud")]
use object_store::path::Path as ObjectPath;
#[cfg(feature = "cloud")]
use object_store::{ObjectStore, parse_url};
#[cfg(feature = "cloud")]
use url::Url;
#[cfg(feature = "cloud")]
use parquet::arrow::AsyncArrowWriter;
#[cfg(feature = "cloud")]
use tokio::io::AsyncWrite;

pub struct ParquetSink {
    writer: Arc<Mutex<Option<parquet::arrow::ArrowWriter<std::fs::File>>>>,
}

impl ParquetSink {
    pub fn new(path: PathBuf, schema: Arc<Schema>) -> Result<Self> {
        let file = std::fs::File::create(path).map_err(UdoError::Io)?;
        let writer = parquet::arrow::ArrowWriter::try_new(file, schema, None).map_err(UdoError::Parquet)?;
        Ok(Self { 
            writer: Arc::new(Mutex::new(Some(writer))) 
        })
    }
}

#[async_trait]
impl OutputSink for ParquetSink {
    async fn write_batch(&mut self, batch: RecordBatch) -> Result<()> {
        let mut guard = self.writer.lock().map_err(|_| UdoError::Pipeline("ParquetSink mutex poisoned".to_string()))?;
        if let Some(writer) = guard.as_mut() {
            writer.write(&batch).map_err(UdoError::Parquet)?;
        }
        Ok(())
    }

    async fn close(&mut self) -> Result<()> {
        let mut guard = self.writer.lock().map_err(|_| UdoError::Pipeline("ParquetSink mutex poisoned".to_string()))?;
        if let Some(writer) = guard.take() {
            writer.close().map_err(UdoError::Parquet)?;
        }
        Ok(())
    }
}

#[cfg(feature = "cloud")]
pub struct CloudSink {
    writer: AsyncArrowWriter<Box<dyn AsyncWrite + Send + Unpin>>,
    path: ObjectPath,
}

#[cfg(feature = "cloud")]
impl CloudSink {
    pub async fn new(url_str: &str, schema: Arc<Schema>) -> Result<Self> {
        let url = Url::parse(url_str)?;
        let (store, path) = parse_url(&url)?;
        
        // Initiate multipart upload
        let (_id, multipart_writer) = store.put_multipart(&path).await.map_err(|e| UdoError::Io(std::io::Error::new(std::io::ErrorKind::Other, e)))?;
        
        let writer = AsyncArrowWriter::try_new(Box::new(multipart_writer), schema, None).map_err(UdoError::Parquet)?;
        
        Ok(Self {
            writer,
            path,
        })
    }
}

#[cfg(feature = "cloud")]
#[async_trait]
impl OutputSink for CloudSink {
    async fn write_batch(&mut self, batch: RecordBatch) -> Result<()> {
        self.writer.write(&batch).await.map_err(UdoError::Parquet)?;
        Ok(())
    }

    async fn close(&mut self) -> Result<()> {
        self.writer.close().await.map_err(UdoError::Parquet)?;
        println!("Uploaded optimized data to cloud: {}", self.path);
        Ok(())
    }
}
