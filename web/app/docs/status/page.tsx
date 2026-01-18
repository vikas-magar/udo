import Link from 'next/link';

export default function ProjectStatus() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <nav className="fixed w-full z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/docs" className="text-xl font-bold text-gray-400 hover:text-white">← Back to Docs</Link>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto text-gray-300">
        <h1 className="text-4xl font-bold text-white mb-6">Project Status Report</h1>
        <p className="mb-8 border-l-4 border-blue-500 pl-4 bg-gray-800/50 p-2 rounded-r">
          <strong className="text-white">Date:</strong> 2026-01-18<br/>
          <strong className="text-white">Version:</strong> 0.1.1
        </p>

        <h2 className="text-2xl font-semibold text-white mb-4 mt-12">1. Executive Summary</h2>
        <p className="mb-6 leading-relaxed">
          UDO (Universal Data Optimizer) is a Rust-based data processing pipeline designed for high-performance ETL tasks...
        </p>

        <h2 className="text-2xl font-semibold text-white mb-4 mt-12">2. Current State Analysis</h2>
        <p className="mb-6">The codebase adheres to a modular architecture separating Core logic, IO adapters, Processors, and API interfaces.</p>

        <h3 className="text-xl font-medium text-white mb-3">Core Architecture</h3>
        <ul className="list-disc list-inside space-y-2 mb-8 ml-4">
          <li><strong className="text-white">Pipeline Engine:</strong> flexible <code>Source -&gt; Processor[] -&gt; Sink</code> design.</li>
          <li><strong className="text-white">Schema Management:</strong> Automatic schema inference from JSON data with drift detection.</li>
          <li><strong className="text-white">Concurrency:</strong> Async-first design using <code>tokio</code>.</li>
        </ul>

        <h3 className="text-xl font-medium text-white mb-3">Key Components Status</h3>
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-left text-sm border-collapse border border-gray-700">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="p-3 border border-gray-700">Component</th>
                <th className="p-3 border border-gray-700">Status</th>
                <th className="p-3 border border-gray-700">Details</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="p-3 border border-gray-700 font-medium">Input Sources</td><td className="p-3 border border-gray-700">🟢 Stable</td><td className="p-3 border border-gray-700"><code>FileSource</code> (NDJSON) is robust.</td></tr>
              <tr><td className="p-3 border border-gray-700 font-medium">Processors</td><td className="p-3 border border-gray-700">🟢 Stable</td><td className="p-3 border border-gray-700"><code>PiiMasker</code> and <code>NerAnalyzer</code> fully integrated.</td></tr>
              <tr><td className="p-3 border border-gray-700 font-medium">Sinks</td><td className="p-3 border border-gray-700">🟢 Stable</td><td className="p-3 border border-gray-700"><code>ParquetSink</code> stable. <code>CloudSink</code> supports multipart.</td></tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-2xl font-semibold text-white mb-4 mt-12">3. Implemented Features</h2>
        <ol className="list-decimal list-inside space-y-4 mb-8 ml-4">
          <li>
            <strong className="text-white">Air-Gapped AI Support:</strong> Load models from local directory via <code>model_path</code>.
          </li>
          <li>
            <strong className="text-white">Advanced PII Protection:</strong> Regex and NER-based detection.
          </li>
          <li>
            <strong className="text-white">Semantic Schema Optimization:</strong> Prunes columns based on intent.
          </li>
        </ol>
      </main>
    </div>
  );
}
