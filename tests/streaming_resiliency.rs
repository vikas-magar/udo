use std::io::Write;
use tempfile::NamedTempFile;

#[test]
fn test_cli_ndjson_resiliency() {
    let mut input_file = NamedTempFile::new().unwrap();
    writeln!(input_file, r#"{{"id": 1, "name": "Valid 1"}}"#).unwrap();
    writeln!(input_file, r#"This is not JSON"#).unwrap();
    writeln!(input_file, r#"{{"id": 2, "name": "Valid 2"}}"#).unwrap();

    let input_path = input_file.path().to_str().unwrap().to_string();
    let output_file = NamedTempFile::new().unwrap();
    let output_path = output_file.path().to_str().unwrap().to_string();

    let status = std::process::Command::new("cargo")
        .args(&[
            "run",
            "--bin",
            "udo-cli",
            "--",
            "--input",
            &input_path,
            "--output",
            &output_path,
            "--scan-rows",
            "5",
        ])
        .status()
        .expect("Failed to execute CLI");

    assert!(
        status.success(),
        "CLI failed to handle corrupted NDJSON input"
    );
}
