use crate::core::error::{Result, UdoError};
use crate::core::pipeline::DlqSink;
use async_trait::async_trait;
use simd_json::OwnedValue;
use std::fs::File;
use std::io::{BufWriter, Write};
use std::path::PathBuf;

#[cfg(feature = "cloud")]
use object_store::path::Path as ObjectPath;
#[cfg(feature = "cloud")]
use object_store::{parse_url, ObjectStore, ObjectStoreExt};
#[cfg(feature = "cloud")]
use std::sync::Arc;
#[cfg(feature = "cloud")]
use url::Url;

pub struct FileDlq {
    writer: BufWriter<File>,
}

impl FileDlq {
    pub fn new(path: PathBuf) -> Result<Self> {
        let file = File::create(path).map_err(UdoError::Io)?;
        Ok(Self {
            writer: BufWriter::new(file),
        })
    }
}

#[async_trait]
impl DlqSink for FileDlq {
    async fn write_dead_letter(&mut self, record: OwnedValue, reason: String) -> Result<()> {
        let json_str = simd_json::to_string(&record).map_err(UdoError::JsonParse)?;
        let log_line = format!(r#"{{"error": "{}", "record": {}}}"#, reason, json_str);
        writeln!(self.writer, "{}", log_line).map_err(UdoError::Io)?;
        Ok(())
    }
}

#[cfg(feature = "cloud")]
pub struct CloudDlq {
    store: Arc<dyn ObjectStore>,
    base_path: ObjectPath,
}

#[cfg(feature = "cloud")]
impl CloudDlq {
    pub fn new(url_str: &str) -> Result<Self> {
        let url = Url::parse(url_str)?;
        let (store, path) = parse_url(&url)?;
        Ok(Self {
            store: Arc::from(store),
            base_path: path,
        })
    }
}

#[cfg(feature = "cloud")]
#[async_trait]
impl DlqSink for CloudDlq {
    async fn write_dead_letter(&mut self, record: OwnedValue, reason: String) -> Result<()> {
        let json_str = simd_json::to_string(&record).map_err(UdoError::JsonParse)?;
        let content = format!(r#"{{"error": "{}", "record": {}}}"#, reason, json_str);

        // Simple strategy: One file per error (not efficient for high error rates, but safe for DLQ)
        // A production version would buffer or rotate logs.
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_micros();
        let filename = format!("{}/dlq_{}.json", self.base_path, timestamp);
        let path = ObjectPath::from(filename);

        self.store.put(&path, content.into()).await?;
        Ok(())
    }
}
