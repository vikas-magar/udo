# UDO - Detailed Architecture and Implementation Plan

This document provides a detailed architecture and implementation plan for the UDO project, based on the product specification.

## 1. Introduction

UDO (Universal Data Orchestrator) is a high-performance data processing engine designed to solve the "Context Noise" problem in Agentic AI. It provides AI agents with a "Perfect Context Slice" by intercepting and processing raw data streams in real-time. The core objectives are to reduce latency, minimize LLM token usage, and improve the reliability of AI agents by providing clean, relevant, and dense context.

## 2. Core Components

The UDO architecture is composed of a high-speed data plane built in Rust and a management control plane built with Next.js.

### 2.1. Data Plane (Rust)

The Data Plane is responsible for the high-speed processing of data. It is composed of the following components:

*   **Ingestion Tier:** This component is responsible for connecting to various data sources like S3, Kafka, and Postgres. It will use `simd-json` for ultra-fast parsing of JSON data and will be built on a pluggable architecture to easily add new data sources.
*   **Semantic Sieve:** This is the core processing engine of UDO.
    *   **Intent Analyzer:** This sub-component will parse the agent's query to extract key entities and understand the user's intent. This will involve using a lightweight local embedding model with `candle` to perform semantic analysis of the query.
    *   **Columnar Pruner:** Based on the intent, this sub-component will discard irrelevant data columns at the storage level. It will use `polars` for vectorized filtering and efficient data manipulation.
    *   **Type Coercer:** This sub-component will standardize messy and inconsistent data types into "Agent-Friendly" types. For example, it will coerce strings like "10 bucks" into a float `10.0`.
    *   **Schema Registry and Evolution Manager:** This sub-component is responsible for detecting and managing schema drift. It maintains a registry of known schemas and uses it to detect changes in incoming data.
    *   **Context Compiler:** This sub-component will use `tiktoken-rs` to aggressively summarize and densify the data into Markdown tables or other compact formats, ensuring the output fits within the token budget of the LLM.
*   **Output Layer:** This component will deliver the processed data to the AI agent through a high-speed gRPC or WebAssembly (Wasm) interface.

### 2.2. Control Plane (Next.js)

The Control Plane provides a user interface for managing and monitoring the UDO engine.

*   **Management Dashboard:** A web-based UI for configuring, monitoring, and analyzing the performance of the UDO engine.
*   **Metrics Database:** Embedded `DuckDB` instance to store operational metrics (rows processed, latency, tokens saved) locally without external dependencies.

## 3. Schema Drift and Evolution

Schema drift is an inevitable problem in real-world data pipelines. Source schemas change, fields are added, removed, or have their types altered. UDO is designed to handle this gracefully through its Schema Registry and Evolution Manager.

*   **Detection:** UDO detects schema drift by inspecting the schema of incoming data and comparing it against a registered schema for that data source. For each processing request, a lightweight check is performed. If a new or altered field is detected, it is flagged.

*   **Adaptation:** Upon detecting a schema change, UDO can be configured to respond in several ways:
    *   **Automatic Adaptation:** For non-breaking changes (like the addition of a new nullable field), UDO can automatically adapt the "Agent-View" to include the new field, making it immediately available for querying.
    *   **Alerting:** For potentially breaking changes (like a field being removed or its type changing), UDO will alert the user through the control plane and can be configured to send notifications to external systems (e.g., Slack, PagerDuty).
    *   **Pipeline Pausing:** In critical applications, UDO can be configured to pause the data pipeline when a breaking change is detected, preventing corrupted or incorrect data from being passed to the AI agent.

*   **User Control:** The Control Plane provides a user interface for managing schema evolution. Users can view the history of schema changes, approve or reject proposed changes, and configure the adaptation strategy for each data source.

## 4. Architectural Diagrams

### 3.1. High-Level Architecture

```
+--------------------------------------------------------------------------+
|                                  Control Plane (Next.js, Supabase)       |
|                                  (Management UI, Monitoring, Config)     |
+--------------------------------------------------------------------------+
       |                                      ^
       | (Config, Metrics)                    | (API Calls)
       v                                      |
+--------------------------------------------------------------------------+
|      Data Plane (Rust)                                                   |
|                                                                          |
|  +-----------------+  +-----------------+  +-----------------+  +--------+
|  | Ingestion Tier  |  | Semantic Sieve  |  | Context Compiler|  | Output |
|  | (S3, Kafka, ..)|  | (Filter, Coerce)|  | (Summarize)     |  | (gRPC) |
|  +-----------------+  +-----------------+  +-----------------+  +--------+
|          ^                     |                    |               |
|          | (Raw Data)          v                    v               v
|          +---------------------+--------------------+---------------+
|                                | (Processed Data)
+--------------------------------|-----------------------------------------+
                                 |
                                 v
+--------------------------------------------------------------------------+
|                          AI Agent / LLM Application                      |
+--------------------------------------------------------------------------+
```

### 3.2. Data Flow within a RAG Pipeline

```
+----------+      +----------------+      +-----------+      +-----------------+      +-----+
|          |----->|                |----->|           |----->|                 |----->|     |
|   User   |      |  AI Application|      |   UDO     |      | Vector Database |      | LLM |
| (Query)  |----->|  (Orchestrator)|<-----|           |<-----| (for Embeddings)|<-----|     |
|          |      |                |      | (Slicer)  |      |                 |      |     |
+----------+      +----------------+      +-----------+      +-----------------+      +-----+
       ^                                      |
       |                                      | (Perfect Context Slice)
       +--------------------------------------+
```

## 4. Data Flow

1.  An AI agent sends a query to the UDO engine.
2.  The **Ingestion Tier** fetches the raw data from the configured data source (e.g., S3, Kafka).
3.  The **Intent Analyzer** processes the agent's query to understand the intent.
4.  The **Columnar Pruner** filters out irrelevant data columns.
5.  The **Type Coercer** cleans and standardizes the data types.
6.  The **Context Compiler** summarizes and densifies the data to meet the token budget.
7.  The **Output Layer** sends the processed data to the AI agent.
8.  The **Control Plane** continuously monitors the process and displays real-time metrics on the dashboard.

## 5. Integration with AI Pipelines

UDO is designed to be a seamless component in modern AI pipelines, particularly in Retrieval-Augmented Generation (RAG) systems.

In a typical RAG pipeline, a user query is used to retrieve relevant documents from a vector database. These documents are then injected into the context window of a Large Language Model (LLM) to generate an answer.

UDO enhances this pipeline by acting as an intelligent, high-speed data preprocessor. Instead of retrieving entire documents, UDO intercepts the query, fetches the raw data (which could be massive structured or semi-structured files), and then "slices" it in real-time to produce a "Perfect Context Slice". This slice contains only the information directly relevant to the query, is cleaned, and is densified to fit optimally within the LLM's context window.

This integration results in:
*   **Reduced Latency:** The LLM has less data to process.
*   **Lower Costs:** Token usage is significantly reduced.
*   **Higher Accuracy:** The LLM is not distracted by irrelevant "context noise".

## 6. Scalability

The UDO architecture is designed to be highly scalable, both horizontally and vertically.

*   **Stateless Data Plane:** The core Rust-based Data Plane is stateless. This means we can deploy multiple instances of the UDO engine behind a load balancer to handle a high volume of requests. Each request can be processed independently, allowing for near-linear scalability.
*   **Serverless Deployment:** By packaging the Data Plane as a WebAssembly (Wasm) module and deploying it on serverless platforms like AWS Lambda, we can automatically scale up and down based on demand. This provides a cost-effective and highly elastic solution.
*   **Asynchronous Processing:** The use of `tokio` in our Rust codebase allows for asynchronous and parallel processing of data, making efficient use of multi-core processors.
*   **Efficient Memory Management:** The use of `arrow-rs` and zero-copy execution ensures that the memory footprint remains low, allowing us to run in constrained environments and process large datasets without running out of memory.

## 7. Technology Stack

*   **Data Plane:**
    *   Language: Rust
    *   Core Libraries: `arrow-rs`, `tokio`, `simd-json`, `candle`, `polars`, `tiktoken-rs`
    *   API: gRPC, WebAssembly (Wasm)
*   **Control Plane:**
    *   Frontend: Next.js, Tailwind CSS, React
    *   Backend: Supabase (Postgres)
    *   Deployment: Vercel / Netlify

## 8. Implementation Plan

The implementation is divided into four milestones:

### Milestone 1: The Core Processing Engine (Weeks 1-4) - [COMPLETED]

*   **Goal:** Build a stable JSON-to-Arrow converter.
*   **Tasks:**
    *   [x] Set up the Rust development environment.
    *   [x] Implement a CLI tool to read a JSON file and convert it to an Arrow-backed Parquet file.
    *   [x] Use `simd-json` for parsing and `arrow-rs` for in-memory representation.
    *   [x] Benchmark the performance to process 1GB of JSON in under 5 seconds.
    *   [x] **Bonus:** Implemented Schema Inference Sampling and Streaming NDJSON support for memory efficiency and fault tolerance.
    *   [x] **Bonus:** Implemented basic Schema Drift handling (Type Widening & New Field detection).
*   **Outcome:** A high-performance CLI tool for JSON to Parquet conversion with resiliency and schema evolution capabilities.

### Milestone 2: Semantic Slicing & Logic (Weeks 5-8) - [COMPLETED]

*   **Goal:** Implement intent-based filtering.
*   **Tasks:**
    *   [x] Integrate `candle` for local embedding checks.
    *   [x] Implement the Intent Analyzer to extract entities/intent from a query.
    *   [x] Develop `rank_columns` logic using Cosine Similarity.
    *   [x] **Optimization:** Implemented "Schema Pruning" to filter columns *before* full conversion, avoiding the need to load dropped columns into memory (more efficient than full DataFrame materialization).
    *   [x] Integrated Semantic Slicing into the CLI (`--query`).
*   **Outcome:** An API that accepts a query and filters columns based on semantic relevance.

### Milestone 3: Deployment & Cloud Scaling (Weeks 9-12) - [COMPLETED]

*   **Goal:** Package for serverless and edge.
*   **Tasks:**
    *   [x] **Pivot:** Switched from Wasm to **Docker + AWS Lambda** to ensure native performance and compatibility with ML libraries (`candle`).
    *   [x] Created `Dockerfile` for a minimal, statically linked Rust binary.
    *   [x] Developed `terraform/main.tf` to provision ECR, S3, and Lambda infrastructure.
    *   [x] Created `README_DEPLOY.md` with step-by-step deployment instructions.
*   **Outcome:** A production-ready serverless deployment strategy using Container Images on AWS Lambda.

### Milestone 4: The SaaS Control Plane (Weeks 13-16) - [COMPLETED]

*   **Goal:** Management UI and Monitoring.
*   **Tasks:**
    *   [x] Set up a Next.js project with TypeScript and Tailwind CSS.
    *   [x] Designed and built a modern dark-themed Dashboard UI.
    *   [x] Implemented a "Source Configuration" page for managing S3/Kafka streams.
    *   [x] Created a UI for toggling Schema Evolution rules (Auto-Adapt vs Strict Mode).
    *   [x] Added metric visualizations for Token Savings and Latency.
*   **Outcome:** A functional prototype of the UDO Management Dashboard.

## 9. Testing Strategy

*   **Unit Tests:** Each component will have extensive unit tests to ensure correctness.
*   **Integration Tests:** The interaction between different components will be tested through integration tests.
*   **Performance Tests:** The performance of the data plane will be continuously benchmarked to ensure it meets the latency targets.
*   **End-to-End Tests:** The entire system will be tested end-to-end to ensure it works as expected.

## 10. Deployment Strategy

*   **Data Plane:** The Rust-based data plane will be deployed as a serverless function on AWS Lambda, packaged as a Wasm module. A Terraform script will be provided for easy deployment.
*   **Control Plane:** The Next.js application will be deployed on Vercel or Netlify.
*   **BYOC (Bring Your Own Cloud):** The entire system will be designed to be deployed within the customer's VPC to ensure data security.
