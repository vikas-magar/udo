import Link from 'next/link';

export default function Architecture() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <nav className="fixed w-full z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/docs" className="text-xl font-bold text-gray-400 hover:text-white">← Back to Docs</Link>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto text-gray-300">
        <h1 className="text-4xl font-bold text-white mb-8">Detailed Architecture</h1>

        <h2 className="text-2xl font-semibold text-white mb-4 mt-12">1. Core Components</h2>
        <p className="mb-6">The UDO architecture is composed of a high-speed data plane built in Rust and a management control plane built with Next.js.</p>

        <h3 className="text-xl font-medium text-white mb-3 mt-8">2.1. Data Plane (Rust)</h3>
        <ul className="list-disc list-inside space-y-3 mb-8 ml-4">
          <li><strong className="text-white">Ingestion Tier:</strong> Connects to S3, Kafka, Postgres. Uses <code>simd-json</code> for fast parsing.</li>
          <li><strong className="text-white">Semantic Sieve:</strong>
            <ul className="list-circle list-inside ml-6 mt-2 space-y-2 text-gray-400">
              <li><strong>Intent Analyzer:</strong> Uses local embeddings (<code>candle</code>) to parse query intent.</li>
              <li><strong>Columnar Pruner:</strong> Discards irrelevant columns using <code>polars</code>.</li>
              <li><strong>Type Coercer:</strong> Standardizes messy types (e.g., "10 bucks" -&gt; <code>10.0</code>).</li>
              <li><strong>Schema Registry:</strong> Detects and manages schema drift.</li>
              <li><strong>Context Compiler:</strong> Summarizes data to fit token budgets (<code>tiktoken-rs</code>).</li>
            </ul>
          </li>
          <li><strong className="text-white">Output Layer:</strong> Delivers processed data (gRPC/Wasm/Parquet).</li>
        </ul>

        <h3 className="text-xl font-medium text-white mb-3 mt-8">2.2. Control Plane (Next.js)</h3>
        <ul className="list-disc list-inside space-y-2 mb-8 ml-4">
          <li><strong>Management Dashboard:</strong> UI for configuration and monitoring.</li>
          <li><strong>Metrics Database:</strong> Embedded <code>DuckDB</code> for local metrics storage.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-white mb-4 mt-12">3. Schema Drift Handling</h2>
        <ul className="list-disc list-inside space-y-2 mb-8 ml-4">
          <li><strong>Detection:</strong> Inspects incoming schema against registered schema per request.</li>
          <li><strong>Adaptation:</strong>
            <ul className="list-circle list-inside ml-6 mt-2 space-y-2 text-gray-400">
              <li><strong>Automatic:</strong> Adapts to non-breaking changes (new nullable fields).</li>
              <li><strong>Alerting:</strong> Notifies on breaking changes (type changes, removals).</li>
              <li><strong>Pausing:</strong> Can pause pipeline on critical breaks.</li>
            </ul>
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-white mb-4 mt-12">4. High-Level Architecture</h2>
        <pre className="bg-gray-800 p-6 rounded-lg overflow-x-auto text-xs font-mono text-gray-300 border border-gray-700 leading-relaxed shadow-inner">
{`+--------------------------------------------------------------------------+
|                                  Control Plane (Next.js)                 |
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
|  | (S3, Kafka, ..)|  | (Filter, Coerce)|  | (Summarize)     |  | (Parquet)|
|  +-----------------+  +-----------------+  +-----------------+  +--------+
|          ^                     |                    |               |
|          | (Raw Data)          v                    v               v
|          +---------------------+--------------------+---------------+
|                                | (Processed Data)
+--------------------------------|-----------------------------------------+`}
        </pre>

        <h2 className="text-2xl font-semibold text-white mb-4 mt-12">5. Integration with AI Pipelines (RAG)</h2>
        <p className="mb-4">
          UDO enhances RAG pipelines by acting as an intelligent preprocessor. Instead of retrieving entire raw documents, UDO slices them in real-time based on the user query.
        </p>
        <ul className="list-disc list-inside space-y-2 mb-8 ml-4">
          <li><strong>Reduced Latency:</strong> LLM processes less data.</li>
          <li><strong>Lower Costs:</strong> Significant reduction in token usage.</li>
          <li><strong>Higher Accuracy:</strong> Less context noise = fewer hallucinations.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-white mb-4 mt-12">6. Technology Stack</h2>
        <ul className="list-disc list-inside space-y-2 mb-8 ml-4">
          <li><strong>Data Plane:</strong> Rust, <code>arrow-rs</code>, <code>tokio</code>, <code>simd-json</code>, <code>candle</code>, <code>polars</code>.</li>
          <li><strong>Control Plane:</strong> Next.js, Tailwind CSS, React.</li>
          <li><strong>Infrastructure:</strong> Docker, Terraform, AWS Lambda (optional).</li>
        </ul>
      </main>
    </div>
  );
}
