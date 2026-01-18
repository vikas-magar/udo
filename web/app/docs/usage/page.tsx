import Link from 'next/link';

export default function Usage() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <nav className="fixed w-full z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/docs" className="text-xl font-bold text-gray-400 hover:text-white">← Back to Docs</Link>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto text-gray-300">
        <h1 className="text-4xl font-bold text-white mb-8">Usage & Integration</h1>

        <h2 className="text-2xl font-semibold text-white mb-4 mt-12">1. CLI Quick Start</h2>
        <p className="mb-6">The primary way to use UDO is via the Command Line Interface. Ensure you have the binary installed or built.</p>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-8">
          <code className="text-sm font-mono text-blue-400">$ udo-cli --input data.jsonl --output clean.parquet --pii-mode mask</code>
        </div>

        <h3 className="text-xl font-medium text-white mb-3">Common Flags</h3>
        <ul className="list-disc list-inside space-y-2 mb-8 ml-4">
          <li><code>--input &lt;path&gt;</code>: Path to source file (NDJSON) or Kafka URL.</li>
          <li><code>--output &lt;path&gt;</code>: Destination path (Parquet file) or S3 URL.</li>
          <li><code>--pii-mode &lt;mode&gt;</code>: <code>mask</code> (replace with ****) or <code>hash</code> (SHA-256).</li>
          <li><code>--query &lt;text&gt;</code>: Natural language query to filter columns (e.g., "customer emails").</li>
        </ul>

        <h2 className="text-2xl font-semibold text-white mb-4 mt-12">2. Configuration File</h2>
        <p className="mb-6">For production pipelines, use a <code>udo.yaml</code> file to define processors and sinks.</p>

        <pre className="bg-gray-800 p-6 rounded-lg overflow-x-auto text-xs font-mono text-gray-300 border border-gray-700 leading-relaxed mb-8">
{`# udo.yaml
source:
  type: kafka
  brokers: "kafka:9092"
  topic: "raw-events"
  group_id: "udo-consumer"

processors:
  - type: pii_masker
    mode: "hash"
    use_ner: true
    model_path: "/models/ner"

  - type: semantic_pruner
    query: "detect anomalous login behavior"
    threshold: 0.82

sink:
  type: cloud
  url: "s3://my-datalake/processed/"`}
        </pre>

        <h2 className="text-2xl font-semibold text-white mb-4 mt-12">3. Integration with RAG Pipelines</h2>
        <p className="mb-6">
          UDO sits between your raw data ingestion and your Vector Database or LLM Context Window.
        </p>

        <h3 className="text-xl font-medium text-white mb-3">Architecture Pattern</h3>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8">
          <p className="font-mono text-sm text-center">
            [Raw Data] &rarr; <strong>[ UDO Engine ]</strong> &rarr; [Clean Parquet] &rarr; [Vector DB / LLM]
          </p>
        </div>

        <h3 className="text-xl font-medium text-white mb-3">Example: Airflow DAG Integration</h3>
        <p className="mb-4">You can trigger UDO as a Docker container task within Airflow.</p>
        <pre className="bg-gray-800 p-6 rounded-lg overflow-x-auto text-xs font-mono text-gray-300 border border-gray-700 leading-relaxed">
{`from airflow.providers.docker.operators.docker import DockerOperator

process_data = DockerOperator(
    task_id='udo_process',
    image='udo-engine:latest',
    command='--config /opt/udo/config.yaml',
    volumes=['/local/data:/data', '/local/models:/models'],
    network_mode='bridge'
)`}
        </pre>
      </main>
    </div>
  );
}
