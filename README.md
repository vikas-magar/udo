# UDO - Universal Data Optimizer

UDO is a high-performance, Rust-based data pipeline tool focused on compliance (PII masking) and semantic data optimization.

## Documentation

- [Project Status & Feature Report](docs/PROJECT_STATUS.md)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [Product Specification](docs/PRODUCT_SPECIFICATION.md)

## Quick Start

### 1. Build
```bash
car go build --release
```

### 2. Run with Local Models (Air-Gapped)
Ensure you have the models downloaded in `models/`.

```bash
# Using CLI args
./target/release/udo-cli \
  --input data/input.jsonl \
  --output data/output.parquet \
  --pii-mode mask --pii-ner \
  --ner-model-path models/ner \
  --query "find user email" \
  --semantic-model-path models/semantic

# Using Config File
./target/release/udo-cli --config config/udo.yaml
```

### 3. Run Tests
```bash
cargo test
```

