# UDO Scalability & Deployment Strategy

## 1. Executive Summary

UDO is designed as a **cloud-agnostic, stateless data plane**. Its core architecture—Rust-based, zero-copy memory management, and modular I/O—allows it to run efficiently in constrained environments (AWS Lambda) as well as high-throughput clusters (Kubernetes). This document outlines how UDO scales and supports multi-cloud deployment.

## 2. Core Scalability Principles

### 2.1. Stateless Architecture
The UDO engine processes data in isolated batches or streams. It maintains no persistent state between requests (other than optional cached models).
*   **Implication:** Scaling is linear. To handle 10x throughput, you deploy 10x replicas.
*   **No Coordination:** Instances do not need to talk to each other (shared-nothing architecture).

### 2.2. Zero-Copy & Low Footprint
UDO uses Apache Arrow for in-memory data representation.
*   **Memory Efficiency:** Data is not deserialized into heap objects unnecessarily.
*   **Cold Starts:** The binary size is small (<50MB), ensuring fast startup times on Serverless platforms.

---

## 3. Deployment Models

### 3.1. AWS Lambda (Serverless / Event-Driven)
Ideal for sporadic data dumps, file arrival triggers (S3 Events), or low-maintenance pipelines.

*   **Trigger:** S3 `ObjectCreated` event.
*   **Execution:**
    1.  Lambda receives event with S3 Key.
    2.  UDO starts up, pulls config from env vars.
    3.  Streams file from S3 -> Process -> Streams back to S3 (Clean bucket).
*   **Scaling:** AWS automatically scales Lambda concurrency (up to 1000+ concurrently).
*   **Packaging:** Docker Container Image (ECR) using **Distroless** runtime.
    ```dockerfile
    FROM gcr.io/distroless/cc-debian12
    COPY --from=builder /app/target/release/udo-cli /app/udo
    ENTRYPOINT ["/app/udo"]
    ```

### 3.2. Kubernetes (High-Throughput / Streaming)
Ideal for Kafka streams (Redpanda, MSK) or continuous high-volume ETL.

*   **Deployment:** `Deployment` managing a ReplicaSet of UDO pods.
*   **Autoscaling (HPA & KEDA):**
    *   **Implemented:** KEDA `ScaledObject` configured to monitor Kafka consumer lag.
    *   **Behavior:** As consumer lag grows beyond threshold (default: 10), KEDA spawns more UDO pods.
*   **Partitioning:** Kafka consumer groups ensure each UDO pod processes a unique subset of partitions.
*   **Multi-Cloud:** Works on EKS (AWS), GKE (Google), AKS (Azure), or on-prem OpenShift.

### 3.3. Local / Edge (Air-Gapped)
Ideal for secure enclaves, local dev, or edge devices.

*   **Execution:** Single binary execution or Docker Compose.
*   **AI Models:** Models are loaded from local disk (`/models`), requiring no internet access.
*   **Resource Control:** Can limit threads (`--threads`) and memory usage via cgroups.

---

## 4. Multi-Cloud Support Status

UDO abstracts I/O using the `object_store` crate. Granular feature flags (`aws`, `gcp`, `azure`) allow for lean builds tailored to the target cloud.

| Cloud Provider | Storage Interface | Compute Target | Status |
| :--- | :--- | :--- | :--- |
| **AWS** | S3 | Lambda / EKS | ✅ Ready (Feature: `aws`) |
| **Google Cloud** | GCS | Cloud Run / GKE | ✅ Ready (Feature: `gcp`) |
| **Azure** | Azure Blob | Azure Functions / AKS | ✅ Ready (Feature: `azure`) |

### Configuration:
Ensure `udo.yaml` uses the appropriate URI scheme (`s3://`, `gs://`, `az://`). Credentials are resolved automatically via the standard SDK chains for each provider.

---

## 5. Performance Tuning Guide

### Vertical Scaling (Bigger Box)
*   **Vectorization:** UDO uses SIMD. Newer CPUs (AVX-512) yield better performance per core.
*   **Memory:** Increase RAM for `CloudSink` buffer or larger batch sizes to reduce I/O overhead.

### Horizontal Scaling (More Boxes)
*   **Kafka:** Increase topic partitions. 1 Partition = 1 Active UDO consumer.
*   **S3 Batch:** Use S3 Batch Operations to trigger thousands of Lambdas for backfilling historical data.

---

## 6. Implementation Status (v0.1.1)

1.  **Container Hardening:** ✅ **Done.** Dockerfile updated to use `gcr.io/distroless/cc-debian12`.
2.  **KEDA Integration:** ✅ **Done.** Helm chart with `ScaledObject` created in `k8s/udo-chart`.
3.  **Terraform Modules:** ✅ **Done.** Modular structure established at `terraform/aws-lambda`.