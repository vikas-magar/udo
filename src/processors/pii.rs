use async_trait::async_trait;
use simd_json::{OwnedValue, prelude::*};
#[cfg(feature = "ner")]
use std::sync::Arc;
use crate::core::error::{Result, UdoError};
use crate::core::pipeline::DataProcessor;
use tracing::debug;

pub struct PiiMasker {
    email_regex: regex::Regex,
    mask_mode: String,
}

impl PiiMasker {
    pub fn new(mask_mode: &str) -> Result<Self> {
        Ok(Self {
            email_regex: regex::Regex::new(r"(?i)[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}").map_err(|e| UdoError::Config(format!("Invalid regex: {}", e)))?,
            mask_mode: mask_mode.to_string(),
        })
    }

    fn mask_value(&self, value: &mut OwnedValue) {
        if let Some(s) = value.as_str() {
            if self.email_regex.is_match(s) {
                debug!("Email PII masked");
                let masked = match self.mask_mode.as_str() {
                    "hash" => {
                        use sha2::{Sha256, Digest};
                        let mut hasher = Sha256::new();
                        hasher.update(s.as_bytes());
                        format!("{:x}", hasher.finalize())
                    },
                    _ => "****@masked.com".to_string(),
                };
                *value = OwnedValue::from(masked);
            }
        } else if let Some(obj) = value.as_object_mut() {
            for (_, val) in obj.iter_mut() {
                self.mask_value(val);
            }
        } else if let Some(arr) = value.as_array_mut() {
            for val in arr.iter_mut() {
                self.mask_value(val);
            }
        }
    }
}

#[async_trait]
impl DataProcessor for PiiMasker {
    async fn process(&self, mut record: OwnedValue) -> Result<Option<OwnedValue>> {
        self.mask_value(&mut record);
        Ok(Some(record))
    }
}

#[cfg(feature = "ner")]
pub struct NerPiiMasker {
    analyzer: Arc<crate::processors::ner::NerAnalyzer>,
    mask_mode: String,
}

#[cfg(feature = "ner")]
impl NerPiiMasker {
    pub fn new(analyzer: crate::processors::ner::NerAnalyzer, mask_mode: &str) -> Self {
        Self {
            analyzer: Arc::new(analyzer),
            mask_mode: mask_mode.to_string(),
        }
    }

    fn mask_entities(&self, value: &mut OwnedValue) {
        if let Some(s) = value.as_str() {
            if let Ok(entities) = self.analyzer.predict(s) {
                if !entities.is_empty() {
                    let masked = match self.mask_mode.as_str() {
                        "hash" => {
                            use sha2::{Sha256, Digest};
                            let mut hasher = Sha256::new();
                            hasher.update(s.as_bytes());
                            format!("{:x}", hasher.finalize())
                        },
                        _ => "[REDACTED]".to_string(),
                    };
                    *value = OwnedValue::from(masked);
                }
            }
        } else if let Some(obj) = value.as_object_mut() {
            for (_, val) in obj.iter_mut() {
                self.mask_entities(val);
            }
        } else if let Some(arr) = value.as_array_mut() {
            for val in arr.iter_mut() {
                self.mask_entities(val);
            }
        }
    }
}

#[cfg(feature = "ner")]
#[async_trait]
impl DataProcessor for NerPiiMasker {
    async fn process(&self, mut record: OwnedValue) -> Result<Option<OwnedValue>> {
        self.mask_entities(&mut record);
        Ok(Some(record))
    }
}
