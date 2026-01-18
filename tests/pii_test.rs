use simd_json::{prelude::*, OwnedValue};
use udo::core::pipeline::DataProcessor;
use udo::processors::pii::PiiMasker;

#[tokio::test]
async fn test_pii_masking() {
    let masker = PiiMasker::new("mask").expect("Failed to create PiiMasker");

    let mut record = OwnedValue::object();
    record.insert("email", "test@example.com").unwrap();
    record.insert("name", "John").unwrap();

    let processed = masker.process(record).await.unwrap().unwrap();

    assert_eq!(
        processed.get("email").unwrap().as_str().unwrap(),
        "****@masked.com"
    );
    assert_eq!(processed.get("name").unwrap().as_str().unwrap(), "John");
}

#[tokio::test]
async fn test_pii_hashing() {
    let masker = PiiMasker::new("hash").expect("Failed to create PiiMasker");

    let mut record = OwnedValue::object();
    record.insert("email", "test@example.com").unwrap();

    let processed = masker.process(record).await.unwrap().unwrap();

    let hashed = processed.get("email").unwrap().as_str().unwrap();
    assert_ne!(hashed, "test@example.com");
    assert_eq!(hashed.len(), 64); // SHA-256 hex length
}
