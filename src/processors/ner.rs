use candle_core::Tensor;
use crate::core::error::{Result, UdoError};
use crate::core::model::BertModelContainer;
use tracing::debug;

pub struct NerAnalyzer {
    container: BertModelContainer,
    labels: Vec<String>,
}

impl NerAnalyzer {
    pub fn new() -> Result<Self> {
        let container = BertModelContainer::load("dbmdz/bert-large-cased-finetuned-conll03-english")?;

        let labels = vec![
            "O".to_string(),
            "B-MISC".to_string(), "I-MISC".to_string(),
            "B-PER".to_string(), "I-PER".to_string(),
            "B-ORG".to_string(), "I-ORG".to_string(),
            "B-LOC".to_string(), "I-LOC".to_string(),
        ];

        Ok(Self {
            container,
            labels,
        })
    }

    pub fn predict(&self, text: &str) -> Result<Vec<(String, String)>> {
        let tokens = self.container.tokenizer.encode(text, true).map_err(|e| UdoError::AiModel(e.to_string()))?;
        let token_ids = Tensor::new(tokens.get_ids(), &self.container.device).map_err(|e| UdoError::AiModel(e.to_string()))?
            .unsqueeze(0).map_err(|e| UdoError::AiModel(e.to_string()))?;
        let token_type_ids = Tensor::zeros_like(&token_ids).map_err(|e| UdoError::AiModel(e.to_string()))?;
        
        let logits = self.container.model.forward(&token_ids, &token_type_ids, None).map_err(|e| UdoError::AiModel(e.to_string()))?;
        let logits = logits.squeeze(0).map_err(|e| UdoError::AiModel(e.to_string()))?;
        
        let predictions = logits.argmax(1).map_err(|e| UdoError::AiModel(e.to_string()))?;
        let pred_ids = predictions.to_vec1::<u32>().map_err(|e| UdoError::AiModel(e.to_string()))?;
        
        let mut results = Vec::new();
        let token_strings = tokens.get_tokens();
        
        for (idx, &pred_id) in pred_ids.iter().enumerate() {
            let label = &self.labels[pred_id as usize];
            if label != "O" {
                debug!(token = %token_strings[idx], label = %label, "PII Entity detected");
                results.push((token_strings[idx].clone(), label.clone()));
            }
        }
        
        Ok(results)
    }
}