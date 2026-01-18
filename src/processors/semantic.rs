use async_trait::async_trait;
use std::sync::{Arc, Mutex};
use simd_json::{OwnedValue, prelude::*};
use arrow::datatypes::Schema;
use crate::core::error::{Result, UdoError};
use crate::core::pipeline::DataProcessor;
use crate::core::model::BertModelContainer;
use candle_core::Tensor;
use tracing::{info, warn, debug};

pub struct IntentAnalyzer {
    container: BertModelContainer,
}

impl IntentAnalyzer {
    pub fn new() -> Result<Self> {
        let container = BertModelContainer::load("sentence-transformers/all-MiniLM-L6-v2")?;
        Ok(Self { container })
    }

    pub fn get_embedding(&self, text: &str) -> Result<Vec<f32>> {
        let tokens = self.container.tokenizer.encode(text, true).map_err(|e| UdoError::AiModel(e.to_string()))?;
        let token_ids = Tensor::new(tokens.get_ids(), &self.container.device).map_err(|e| UdoError::AiModel(e.to_string()))?.unsqueeze(0).map_err(|e| UdoError::AiModel(e.to_string()))?;
        let token_type_ids = Tensor::zeros_like(&token_ids).map_err(|e| UdoError::AiModel(e.to_string()))?;
        
        let embeddings = self.container.model.forward(&token_ids, &token_type_ids, None).map_err(|e| UdoError::AiModel(e.to_string()))?;
        
        let (_batch, n_tokens, _hidden) = embeddings.dims3().map_err(|e| UdoError::AiModel(e.to_string()))?;
        let pooled = (embeddings.sum(1).map_err(|e| UdoError::AiModel(e.to_string()))? / (n_tokens as f64)).map_err(|e| UdoError::AiModel(e.to_string()))?;
        
        let norm = pooled.sqr().map_err(|e| UdoError::AiModel(e.to_string()))?.sum_all().map_err(|e| UdoError::AiModel(e.to_string()))?.sqrt().map_err(|e| UdoError::AiModel(e.to_string()))?.to_scalar::<f32>().map_err(|e| UdoError::AiModel(e.to_string()))? as f64;
        let pooled = (pooled / norm).map_err(|e| UdoError::AiModel(e.to_string()))?;
        
        let vec = pooled.squeeze(0).map_err(|e| UdoError::AiModel(e.to_string()))?.to_vec1::<f32>().map_err(|e| UdoError::AiModel(e.to_string()))?;
        
        Ok(vec)
    }

    pub fn rank_columns(&self, query: &str, columns: &[String]) -> Result<Vec<(String, f32)>> {
        let query_emb = self.get_embedding(query)?;
        
        let mut results = Vec::new();
        for col in columns {
            let col_text = col.replace("_", " ");
            let col_emb = self.get_embedding(&col_text)?;
            
            let sim = cosine_similarity(&query_emb, &col_emb);
            results.push((col.clone(), sim));
        }
        
        results.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
        
        Ok(results)
    }
}

fn cosine_similarity(v1: &[f32], v2: &[f32]) -> f32 {
    v1.iter().zip(v2.iter()).map(|(a, b)| a * b).sum()
}

pub struct SemanticProcessor {
    analyzer: Arc<IntentAnalyzer>,
    query: String,
    threshold: f32,
    keep_columns: Arc<Mutex<Option<std::collections::HashSet<String>>>>,
}

impl SemanticProcessor {
    pub fn new(analyzer: IntentAnalyzer, query: String, threshold: f32) -> Self {
        Self {
            analyzer: Arc::new(analyzer),
            query,
            threshold,
            keep_columns: Arc::new(Mutex::new(None)),
        }
    }
}

#[async_trait]
impl DataProcessor for SemanticProcessor {
    async fn process(&self, mut record: OwnedValue) -> Result<Option<OwnedValue>> {
        let keep_cols_guard = self.keep_columns.lock().map_err(|_| UdoError::Pipeline("SemanticProcessor mutex poisoned".to_string()))?;
        if let Some(keep_cols) = keep_cols_guard.as_ref() {
            if let Some(obj) = record.as_object_mut() {
                let keys_to_remove: Vec<String> = obj.iter()
                    .filter(|(k, _)| !keep_cols.contains(&k.to_string()))
                    .map(|(k, _)| k.to_string())
                    .collect();
                
                for key in keys_to_remove {
                    obj.remove(&key);
                }
            }
        }
        Ok(Some(record))
    }

    fn update_schema(&self, schema: &Arc<Schema>) -> Result<Arc<Schema>> {
        debug!(query = %self.query, "Analyzing column relevance for query");
        let col_names: Vec<String> = schema.fields().iter().map(|f| f.name().to_string()).collect();
        let ranked = self.analyzer.rank_columns(&self.query, &col_names)?;
        
        let mut keep = std::collections::HashSet::new();
        let mut relevant_fields = Vec::new();
        
        for (col, score) in ranked {
            if score >= self.threshold {
                debug!(column = %col, score = %score, "[KEEP]");
                keep.insert(col.clone());
                if let Some(field) = schema.fields().iter().find(|f| f.name() == &col) {
                    relevant_fields.push(field.clone());
                }
            } else {
                debug!(column = %col, score = %score, "[DROP]");
            }
        }

        if relevant_fields.is_empty() {
            warn!("No columns met threshold. Keeping all columns as fallback.");
            return Ok(schema.clone());
        }

        let mut keep_cols_guard = self.keep_columns.lock().map_err(|_| UdoError::Pipeline("SemanticProcessor mutex poisoned".to_string()))?;
        *keep_cols_guard = Some(keep);

        info!(original = %schema.fields().len(), pruned = %relevant_fields.len(), "Schema pruned semantically");
        Ok(Arc::new(Schema::new(relevant_fields)))
    }
}
