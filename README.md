# UDO - Universal Data Optimizer

UDO is a high-performance, Rust-based data pipeline tool focused on compliance (PII masking) and semantic data optimization.

## Documentation

- [Project Status & Feature Report](docs/PROJECT_STATUS.md)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [Product Specification](docs/PRODUCT_SPECIFICATION.md)

## Quick Start

### 1. Build
```bash
cargo build --release
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

## Web Interface

UDO includes a modern web interface with a **Project Landing Page** and an **Operational Dashboard**.

### Features
- **Landing Page:** Professional product showcase (located at `/`).
- **Dashboard:** Real-time metrics monitoring (throughput, latency, tokens saved) (located at `/dashboard`).
- **Configuration:** Visual configuration manager (located at `/config`).

### Running the Web UI

```bash
cd web
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the landing page.
Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) to view the metrics dashboard.

