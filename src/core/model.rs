#[cfg(any(feature = "semantic", feature = "ner"))]
use anyhow::Error;
#[cfg(any(feature = "semantic", feature = "ner"))]
use candle_core::{Device, DType};
#[cfg(any(feature = "semantic", feature = "ner"))]
use candle_nn::VarBuilder;
#[cfg(any(feature = "semantic", feature = "ner"))]
use candle_transformers::models::bert::{BertModel, Config};
#[cfg(any(feature = "semantic", feature = "ner"))]
use hf_hub::{api::sync::ApiBuilder, Repo, RepoType};
#[cfg(any(feature = "semantic", feature = "ner"))]
use tokenizers::Tokenizer;
#[cfg(any(feature = "semantic", feature = "ner"))]
use crate::core::error::{Result, UdoError};

#[cfg(any(feature = "semantic", feature = "ner"))]
pub struct BertModelContainer {
    pub model: BertModel,
    pub tokenizer: Tokenizer,
    pub device: Device,
}

#[cfg(any(feature = "semantic", feature = "ner"))]
impl BertModelContainer {
    pub fn load(model_id: &str) -> Result<Self> {
        let device = Device::Cpu; 
        
        let api = ApiBuilder::new().build().map_err(|e: hf_hub::api::sync::ApiError| UdoError::AiModel(e.to_string()))?;
        let repo = api.repo(Repo::new(model_id.to_string(), RepoType::Model));

        let config_filename = repo.get("config.json").map_err(|e: hf_hub::api::sync::ApiError| UdoError::AiModel(e.to_string()))?;
        let tokenizer_filename = repo.get("tokenizer.json").map_err(|e: hf_hub::api::sync::ApiError| UdoError::AiModel(e.to_string()))?;
        let weights_filename = repo.get("model.safetensors").map_err(|e: hf_hub::api::sync::ApiError| UdoError::AiModel(e.to_string()))?;

        let config: Config = serde_json::from_str(&std::fs::read_to_string(config_filename).map_err(UdoError::Io)?)
            .map_err(|e: serde_json::Error| UdoError::Config(e.to_string()))?;
        let tokenizer = Tokenizer::from_file(tokenizer_filename).map_err(Error::msg).map_err(|e: anyhow::Error| UdoError::AiModel(e.to_string()))?;
        
        let vb = unsafe { VarBuilder::from_mmaped_safetensors(&[weights_filename], DType::F32, &device).map_err(|e: candle_core::Error| UdoError::AiModel(e.to_string()))? };
        let model = BertModel::load(vb, &config).map_err(|e: candle_core::Error| UdoError::AiModel(e.to_string()))?;

        Ok(Self {
            model,
            tokenizer,
            device,
        })
    }
}
