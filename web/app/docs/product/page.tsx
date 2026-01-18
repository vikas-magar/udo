import Link from 'next/link';

export default function ProductSpec() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <nav className="fixed w-full z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/docs" className="text-xl font-bold text-gray-400 hover:text-white">← Back to Docs</Link>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto text-gray-300">
        <h1 className="text-4xl font-bold text-white mb-8">Product Specification</h1>

        <h2 className="text-2xl font-semibold text-white mb-4 mt-12">1. Executive Summary</h2>
        <p className="mb-6 leading-relaxed">
          UDO solves the "Context Noise" problem in Agentic AI. It provides LLMs with a "Perfect Context Slice" by intercepting raw data streams and performing real-time semantic analysis, filtering, and summarization. This reduces token costs, latency, and hallucinations.
        </p>

        <h2 className="text-2xl font-semibold text-white mb-4 mt-12">2. Goals and Objectives</h2>
        <ul className="list-disc list-inside space-y-3 mb-8 ml-4">
          <li><strong className="text-white">Primary Goal:</strong> Provide clean, relevant, dense context slices.</li>
          <li><strong className="text-white">Latency:</strong> Target sub-50ms processing.</li>
          <li><strong className="text-white">Cost Efficiency:</strong> Reduce token usage by &gt;40%.</li>
          <li><strong className="text-white">Security:</strong> Prevent sensitive data leakage.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-white mb-4 mt-12">3. Core Features</h2>
        <ul className="list-disc list-inside space-y-3 mb-8 ml-4">
          <li><strong className="text-white">Intent-Aware Slicing:</strong> Analyzes agent intent to return only specific fields (via Semantic Sieve).</li>
          <li><strong className="text-white">Automated Schema Evolution:</strong> Detects schema drift in real-time.</li>
          <li><strong className="text-white">Token Firewall:</strong> Summarizes data if it exceeds token limits.</li>
          <li><strong className="text-white">PII Redaction:</strong> Masks sensitive entities at the edge.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-white mb-4 mt-12">4. Technical Requirements</h2>
        <ul className="list-disc list-inside space-y-3 mb-8 ml-4">
          <li><strong className="text-white">Language:</strong> Rust (Core), Next.js (Control Plane).</li>
          <li><strong className="text-white">Footprint:</strong> Capable of running in 128MB serverless functions.</li>
          <li><strong className="text-white">Deployment:</strong> BYOC (Bring Your Own Cloud) within customer VPC.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-white mb-4 mt-12">5. Target Audience</h2>
        <ul className="list-disc list-inside space-y-3 mb-8 ml-4">
          <li>AI Engineers building RAG pipelines.</li>
          <li>Platform Architects at large tech companies.</li>
          <li>CFOs looking to reduce AI API bills.</li>
        </ul>
      </main>
    </div>
  );
}
