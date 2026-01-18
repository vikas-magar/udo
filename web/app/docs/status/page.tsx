export default function ProjectStatus() {
  return (
    <div className="max-w-4xl mx-auto text-gray-300">
      <h1 className="text-4xl font-bold text-white mb-6">Project Status Report</h1>
      <div className="mb-8 border-l-4 border-blue-500 pl-4 bg-gray-800/50 p-4 rounded-r">
        <p className="m-0"><strong className="text-white">Date:</strong> 2026-01-18</p>
        <p className="m-0"><strong className="text-white">Version:</strong> 0.1.2</p>
      </div>

      <h2 className="text-2xl font-semibold text-white mt-12 mb-4">1. Executive Summary</h2>
      <p className="mb-6 leading-relaxed">
        UDO (Universal Data Optimizer) is a Rust-based data processing pipeline designed for high-performance ETL tasks. The project has reached a stable <strong>Production Ready (Beta)</strong> stage, with core local functionality, cloud integration, and robust scalability patterns established.
      </p>

      <h2 className="text-2xl font-semibold text-white mt-12 mb-4">2. Component Status</h2>
      <div className="overflow-x-auto rounded-lg border border-gray-700 mb-8">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-3 border-r border-gray-700">Component</th>
              <th className="p-3 border-r border-gray-700">Status</th>
              <th className="p-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 bg-gray-900/50">
            <tr><td className="p-3 font-medium text-white border-r border-gray-700">Input Sources</td><td className="p-3 text-green-400 border-r border-gray-700">🟢 Stable</td><td className="p-3 text-gray-400">FileSource & KafkaSource with retry logic.</td></tr>
            <tr><td className="p-3 font-medium text-white border-r border-gray-700">Processors</td><td className="p-3 text-green-400 border-r border-gray-700">🟢 Stable</td><td className="p-3 text-gray-400">PiiMasker, NerAnalyzer, SemanticPruner (Local models).</td></tr>
            <tr><td className="p-3 font-medium text-white border-r border-gray-700">Sinks</td><td className="p-3 text-green-400 border-r border-gray-700">🟢 Stable</td><td className="p-3 text-gray-400">Parquet & Cloud Sink (Multipart streaming).</td></tr>
            <tr><td className="p-3 font-medium text-white border-r border-gray-700">Infrastructure</td><td className="p-3 text-green-400 border-r border-gray-700">🟢 Stable</td><td className="p-3 text-gray-400">Distroless Docker, KEDA Autoscaling, Terraform.</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-semibold text-white mt-12 mb-4">3. Implemented Features</h2>
      <ol className="list-decimal list-inside space-y-4 mb-8 ml-4">
        <li>
          <strong className="text-white">Air-Gapped AI Support:</strong> Load models from local directory, bypassing HuggingFace.
        </li>
        <li>
          <strong className="text-white">Scalability & Deployment:</strong> 
          <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-gray-400">
            <li>Container Hardening (Distroless)</li>
            <li>KEDA Autoscaling for Kafka</li>
            <li>Multi-Cloud Feature Flags</li>
          </ul>
        </li>
        <li>
          <strong className="text-white">Semantic Schema Optimization:</strong> Prunes columns based on intent.
        </li>
      </ol>

      <h2 className="text-2xl font-semibold text-white mt-12 mb-4">4. Production Readiness</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-green-900/10 border border-green-500/20 p-6 rounded-lg">
          <h3 className="font-bold text-green-400 mb-2">Ready For</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-400">
            <li>High-throughput Streaming (K8s + KEDA)</li>
            <li>Cloud-native deployments (S3/GCS)</li>
            <li>Air-gapped environments</li>
          </ul>
        </div>
        <div className="bg-yellow-900/10 border border-yellow-500/20 p-6 rounded-lg">
          <h3 className="font-bold text-yellow-400 mb-2">Next Steps</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-400">
            <li>Load testing 100GB+ files</li>
            <li>Integration tests (LocalStack)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}