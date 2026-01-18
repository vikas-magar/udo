# UDO Codebase Walkthrough

This document provides a developer-focused tour of the UDO (Universal Data Optimizer) codebase. It explains the project structure, key modules, architectural decisions, and future roadmap.

## 1. Project Structure

UDO is a workspace containing a Rust backend (the Engine) and a Next.js frontend (the Control Plane).

```
/
├── Cargo.toml              # Rust workspace configuration
├── src/                    # Rust source code (UDO Engine)
│   ├── main.rs             # CLI entry point
│   ├── lib.rs              # Library root
│   ├── api/                # HTTP API & Metrics
│   ├── core/               # Core Pipeline Logic & Config
│   ├── io/                 # Input/Output Connectors
│   ├── processors/         # Data Processors (PII, Semantic)
│   └── utils/              # Helper functions
├── web/                    # Next.js Frontend (Control Plane)
├── k8s/                    # Kubernetes Helm Charts
├── terraform/              # Infrastructure as Code
└── docs/                   # Documentation
```

## 2. The Rust Engine (`src/`)

The core engine is built on **Tokio** for async runtime and **Arrow** for in-memory data representation.

### 2.1. Entry Point (`src/main.rs`)
*   **Purpose:** Parses CLI arguments using `clap` and orchestrates the pipeline execution.
*   **Key Logic:**
    *   Loads configuration (`udo.yaml` or CLI flags).
    *   Initializes the `MetricsDb` (DuckDB).
    *   Sets up the `PipelineRunner`.
    *   Runs the pipeline and handles graceful shutdown.

### 2.2. Core Logic (`src/core/`)
This module defines the fundamental abstractions of the system.

*   **`pipeline.rs`:** The heart of UDO. It defines the `InputSource`, `DataProcessor`, and `OutputSink` traits. The `PipelineRunner` struct manages the data flow, handling backpressure and concurrency.
*   **`schema.rs`:** Implements schema inference. It scans a sample of JSON records to deduce data types (Int, Float, String) and handles schema drift (e.g., type widening).
*   **`config.rs`:** Defines the configuration structs (serde-serializable) for YAML parsing.
*   **`model.rs`:** Wrapper around `candle` and `hf-hub` for loading AI models (BERT, MiniLM). It supports both downloading from HuggingFace and loading from a local path (Air-Gapped mode).

### 2.3. Input/Output (`src/io/`)
Adapters for external systems.

*   **`source.rs`:**
    *   `FileSource`: Reads NDJSON files line-by-line.
    *   `KafkaSource`: Consumes messages from a Kafka topic using `rdkafka`. Includes retry logic for robustness.
*   **`sink.rs`:**
    *   `ParquetSink`: Writes Arrow RecordBatches to local Parquet files.
    *   `CloudSink`: Streams data to object storage (S3, GCS, Azure) using `object_store`. It uses **Multipart Uploads** to handle large datasets without OOM.
*   **`dlq.rs`:** Dead Letter Queue implementation. Failed records are written here (Local File or Cloud) for later inspection.

### 2.4. Processors (`src/processors/`)
The transformation logic.

*   **`pii.rs`:**
    *   `PiiMasker`: Regex-based masking (Email).
    *   `NerPiiMasker`: AI-based masking using BERT Named Entity Recognition (Persons, Locations, Orgs).
*   **`semantic.rs`:**
    *   `IntentAnalyzer`: Uses `all-MiniLM-L6-v2` to generate embeddings for a query string.
    *   `SemanticProcessor`: Compares query embeddings against column name embeddings to filter out irrelevant columns ("Semantic Pruning").

### 2.5. API (`src/api/`)
*   **`server.rs`:** Starts an Actix-web server exposing the `/metrics` endpoint.
*   **`metrics.rs`:** Interface for `DuckDB` to store and query pipeline statistics (throughput, latency, tokens saved).
*   **`auth.rs`:** Simple Bearer token authentication middleware.

## 3. The Frontend (`web/`)

A Next.js 14 (App Router) application serving as the project landing page and management dashboard.

*   **`app/page.tsx`:** The polished Landing Page explaining the value prop.
*   **`app/dashboard/page.tsx`:** Real-time dashboard fetching data from the Rust engine's `/metrics` API.
*   **`app/docs/`:** Documentation portal structured as a "Book" with a sidebar layout.
*   **Styling:** Tailwind CSS with a custom "Slate 900" dark theme.

## 4. Infrastructure (`k8s/` & `terraform/`)

*   **`k8s/udo-chart/`:** A Helm chart for deploying UDO on Kubernetes. Includes a KEDA `ScaledObject` for autoscaling based on Kafka consumer lag.
*   **`terraform/aws-lambda/`:** Terraform modules to provision S3 buckets and ECR repositories for Serverless deployment.
*   **`docker/Dockerfile`:** Multi-stage build process producing a minimal **Distroless** image for security.

## 5. Future Scope & Roadmap

### 5.1. Short Term (v0.2.0)
*   **Config Hot-Reload:** Watch the `udo.yaml` file for changes and reload the pipeline without restarting the process.
*   **New Formats:** Support for Avro and CSV input/output.
*   **Integration Tests:** Spin up LocalStack (S3) and Redpanda (Kafka) in CI for end-to-end testing.

### 5.2. Medium Term (v0.5.0)
*   **Wasm Plugins:** Allow users to write custom processors in Rust/Go/JS and load them as WebAssembly modules.
*   **Data Lineage:** Track the transformation history of every record and export it to OpenLineage.
*   **UI Control:** Allow updating the pipeline configuration directly from the Next.js Dashboard.

### 5.3. Long Term (v1.0.0)
*   **Distributed Shuffle:** Implement a shuffle mechanism to sort/group data across multiple UDO instances (MapReduce style).
*   **SaaS Offering:** Multi-tenant control plane managing UDO fleets in customer VPCs.
*   **LLM Fine-tuning Prep:** A specialized sink that outputs data in JSONL format ready for OpenAI/Llama fine-tuning jobs.
