use std::path::PathBuf;
use std::fs::File;
use std::io::{BufWriter, Write};
use simd_json::OwnedValue;
use crate::core::pipeline::DlqSink;
use crate::core::error::{Result, UdoError};
use async_trait::async_trait;

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