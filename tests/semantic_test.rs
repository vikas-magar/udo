#[cfg(feature = "semantic")]
use udo::processors::semantic::IntentAnalyzer;

#[cfg(feature = "semantic")]
fn cosine_similarity(v1: &[f32], v2: &[f32]) -> f32 {
    let dot_product: f32 = v1.iter().zip(v2.iter()).map(|(a, b)| a * b).sum();
    let norm1: f32 = v1.iter().map(|a| a * a).sum::<f32>().sqrt();
    let norm2: f32 = v2.iter().map(|b| b * b).sum::<f32>().sqrt();
    dot_product / (norm1 * norm2)
}

#[test]
#[cfg(feature = "semantic")]
fn test_semantic_embedding() {
    let model_path = if std::path::Path::new("models/semantic").exists() {
        Some(std::path::PathBuf::from("models/semantic"))
    } else {
        None
    };

    // This test might fail if internet is not available and no local model is found
    let analyzer = IntentAnalyzer::new(model_path).expect("Failed to load model");

    let text1 = "The cat sits on the mat";
    let text2 = "A kitten is resting on the rug";
    let text3 = "The stock market crashed today";

    let emb1 = analyzer
        .get_embedding(text1)
        .expect("Failed to embed text1");
    let emb2 = analyzer
        .get_embedding(text2)
        .expect("Failed to embed text2");
    let emb3 = analyzer
        .get_embedding(text3)
        .expect("Failed to embed text3");

    let sim_1_2 = cosine_similarity(&emb1, &emb2);
    let sim_1_3 = cosine_similarity(&emb1, &emb3);

    println!("Similarity (Cat vs Kitten): {}", sim_1_2);
    println!("Similarity (Cat vs Stocks): {}", sim_1_3);

    assert!(sim_1_2 > sim_1_3, "Semantic similarity logic failed");
}
