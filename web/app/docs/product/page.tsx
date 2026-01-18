export default function ProductSpec() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-4xl font-bold text-white mb-8">Product Specification</h1>

      <div className="bg-blue-900/20 border border-blue-500/30 p-6 rounded-lg mb-12">
        <h2 className="text-xl font-bold text-blue-400 mb-2">Executive Summary</h2>
        <p className="text-gray-300 m-0">
          UDO solves the "Context Noise" problem. It provides LLMs with a "Perfect Context Slice" by intercepting raw data streams and performing real-time semantic analysis.
        </p>
      </div>

      <h2 className="text-2xl font-semibold text-white mt-12 mb-4">1. Goals</h2>
      <ul className="grid md:grid-cols-2 gap-4 not-prose">
        <li className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <strong className="text-white block mb-1">Latency</strong>
          <span className="text-gray-400 text-sm">Target sub-50ms processing per batch.</span>
        </li>
        <li className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <strong className="text-white block mb-1">Cost</strong>
          <span className="text-gray-400 text-sm">Reduce token usage by &gt;40%.</span>
        </li>
      </ul>

      <h2 className="text-2xl font-semibold text-white mt-12 mb-4">2. Core Features</h2>
      <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
        <li><strong>Intent-Aware Slicing:</strong> Keeps only fields relevant to the query.</li>
        <li><strong>Automated Schema Evolution:</strong> Handles drift without breaking.</li>
        <li><strong>Token Firewall:</strong> Summarizes data before LLM egress.</li>
        <li><strong>PII Redaction:</strong> Masks emails, names, locations.</li>
      </ul>

      <h2 className="text-2xl font-semibold text-white mt-12 mb-4">3. Target Audience</h2>
      <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
        <li>AI Engineers optimizing RAG pipelines.</li>
        <li>Platform Architects scaling internal data tools.</li>
        <li>CFOs reducing AI API costs.</li>
      </ul>
    </div>
  );
}