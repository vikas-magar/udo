export default function Architecture() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-4xl font-bold text-white mb-8">Detailed Architecture</h1>

      <h2 className="text-2xl font-semibold text-white mt-12 mb-4">1. Core Components</h2>
      <p className="text-gray-300 mb-6">The UDO architecture is composed of a high-speed data plane built in Rust and a management control plane built with Next.js.</p>

      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8">
        <h3 className="text-xl font-bold text-white mb-2">Data Plane (Rust)</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-300">
          <li><strong>Ingestion Tier:</strong> Connects to S3, Kafka, Postgres. Uses <code>simd-json</code>.</li>
          <li><strong>Semantic Sieve:</strong> The brain of UDO. Includes Intent Analyzer (Candle) and Columnar Pruner (Polars).</li>
          <li><strong>Output Layer:</strong> Delivers optimized Parquet files.</li>
        </ul>
      </div>

      <h2 className="text-2xl font-semibold text-white mt-12 mb-4">2. High-Level Diagram</h2>
      <pre className="bg-black p-6 rounded-lg overflow-x-auto text-xs font-mono text-blue-300 border border-gray-800 leading-relaxed">
{`+--------------------------------------------------------------------------+
|                                  Control Plane (Next.js)                 |
|                                  (Management UI, Monitoring)             |
+--------------------------------------------------------------------------+
       |                                      ^
       | (Config)                             | (Metrics)
       v                                      |
+--------------------------------------------------------------------------+
|      Data Plane (Rust)                                                   |
|                                                                          |
|  [ Ingestion ] --> [ Semantic Sieve ] --> [ Context Compiler ] --> [ Output ]
|  (S3, Kafka)       (Filter, Mask)         (Summarize)              (Parquet)
|                                                                          |
+--------------------------------------------------------------------------+`}
      </pre>

      <h2 className="text-2xl font-semibold text-white mt-12 mb-4">3. Technology Stack</h2>
      <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
        <li><strong>Language:</strong> Rust (Performance & Safety)</li>
        <li><strong>Core Libs:</strong> <code>arrow-rs</code> (Memory), <code>tokio</code> (Async), <code>candle</code> (AI).</li>
        <li><strong>Infrastructure:</strong> Docker, Terraform.</li>
      </ul>
    </div>
  );
}