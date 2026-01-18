export default function ProjectStatus() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-4xl font-bold text-white mb-6">Project Status Report</h1>
      <div className="mb-8 border-l-4 border-blue-500 pl-4 bg-gray-800/50 p-4 rounded-r">
        <p className="m-0"><strong className="text-white">Date:</strong> 2026-01-18</p>
        <p className="m-0"><strong className="text-white">Version:</strong> 0.1.1</p>
      </div>

      <h2 className="text-2xl font-semibold text-white mt-12 mb-4">1. Executive Summary</h2>
      <p className="text-gray-300 mb-6">
        UDO (Universal Data Optimizer) is a Rust-based data processing pipeline designed for high-performance ETL tasks...
      </p>

      <h2 className="text-2xl font-semibold text-white mt-12 mb-4">2. Component Status</h2>
      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-3">Component</th>
              <th className="p-3">Status</th>
              <th className="p-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 bg-gray-900/50">
            <tr><td className="p-3 font-medium text-white">Input Sources</td><td className="p-3 text-green-400">🟢 Stable</td><td className="p-3 text-gray-400">FileSource & KafkaSource implemented.</td></tr>
            <tr><td className="p-3 font-medium text-white">Processors</td><td className="p-3 text-green-400">🟢 Stable</td><td className="p-3 text-gray-400">PiiMasker & SemanticPruner operational.</td></tr>
            <tr><td className="p-3 font-medium text-white">Sinks</td><td className="p-3 text-green-400">🟢 Stable</td><td className="p-3 text-gray-400">Parquet & Cloud Sink (Multipart) ready.</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-semibold text-white mt-12 mb-4">3. Resolved Issues (v0.1.1)</h2>
      <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
        <li><strong>Cloud DLQ:</strong> Implemented `CloudDlq` for S3 error logging.</li>
        <li><strong>Kafka Robustness:</strong> Added retry loops for transient errors.</li>
        <li><strong>Memory Fix:</strong> Refactored Cloud Sink to stream data instead of buffering.</li>
      </ul>
    </div>
  );
}
