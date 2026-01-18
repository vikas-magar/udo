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
use object_store::{ObjectStore, parse_url, ObjectStoreExt};
#[cfg(feature = "cloud")]
use url::Url;

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
    store: Arc<dyn ObjectStore>,
    path: ObjectPath,
    schema: Arc<Schema>,
    buffer: Vec<RecordBatch>,
}

#[cfg(feature = "cloud")]
impl CloudSink {
    pub fn new(url_str: &str, schema: Arc<Schema>) -> Result<Self> {
        let url = Url::parse(url_str)?;
        let (store, path) = parse_url(&url)?;
        
        Ok(Self {
            store: Arc::from(store),
            path,
            schema,
            buffer: Vec::new(),
        })
    }
}

#[cfg(feature = "cloud")]
#[async_trait]
impl OutputSink for CloudSink {
    async fn write_batch(&mut self, batch: RecordBatch) -> Result<()> {
        self.buffer.push(batch);
        Ok(())
    }

    async fn close(&mut self) -> Result<()> {
        if self.buffer.is_empty() {
            return Ok(());
        }

        let mut out_buffer = Vec::new();
        {
            let mut writer = parquet::arrow::ArrowWriter::try_new(&mut out_buffer, self.schema.clone(), None)?;
            for batch in &self.buffer {
                writer.write(batch)?;
            }
            writer.close()?;
        }

        self.store.put(&self.path, out_buffer.into()).await?;
        println!("Uploaded optimized data to cloud: {}", self.path);
        Ok(())
    }
}
