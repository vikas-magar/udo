import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500 selection:text-white">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              UDO
            </span>
            <span className="text-xs text-gray-400 border border-gray-700 rounded px-1.5 py-0.5">BETA</span>
          </div>
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-300">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#how-it-works" className="hover:text-white transition">How it Works</a>
            <a href="https://github.com/your-org/udo" target="_blank" className="hover:text-white transition">GitHub</a>
          </div>
          <div>
            <Link 
              href="/dashboard" 
              className="px-5 py-2 rounded-full bg-white text-black font-semibold text-sm hover:bg-gray-200 transition"
            >
              Launch Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
            The <span className="text-blue-500">Universal Data Optimizer</span> for Secure Pipelines
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Automatically mask PII and prune irrelevant data using local AI models. 
            Designed for air-gapped environments and high-performance ETL.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link 
              href="/dashboard" 
              className="px-8 py-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-lg transition shadow-lg shadow-blue-900/20"
            >
              Get Started
            </Link>
            <a 
              href="https://github.com/your-org/udo" 
              target="_blank"
              className="px-8 py-4 rounded-lg border border-gray-700 hover:bg-gray-900 text-gray-300 font-medium text-lg transition"
            >
              View Documentation
            </a>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-24 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Modern Data Compliance</h2>
            <p className="text-gray-400">Security first, performance always.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon="🔒"
              title="Advanced PII Masking"
              description="Detects and masks sensitive entities (Emails, Names, Locations) using Regex and BERT-based NER models."
            />
            <FeatureCard 
              icon="🧠"
              title="Semantic Optimization"
              description="Describe your intent in plain English. UDO intelligently keeps only relevant columns using embedding models."
            />
            <FeatureCard 
              icon="🛡️"
              title="Air-Gapped Ready"
              description="Run entirely offline. Load AI models from local storage with no external dependencies or calls home."
            />
            <FeatureCard 
              icon="⚡"
              title="Rust Performance"
              description="Built on Apache Arrow and Tokio for blazing fast, async processing and low memory footprint."
            />
            <FeatureCard 
              icon="☁️"
              title="Cloud Native"
              description="Seamlessly integrates with S3, GCS, and Kafka. Supports Dead Letter Queues for robust error handling."
            />
            <FeatureCard 
              icon="📊"
              title="Real-time Metrics"
              description="Built-in DuckDB metrics store and REST API for monitoring throughput, latency, and data savings."
            />
          </div>
        </div>
      </section>

      {/* Code Snippet / How it works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Simple Configuration</h2>
              <p className="text-gray-400 mb-8 text-lg">
                Define your pipeline in a simple YAML file. UDO handles the complexity of model loading, schema inference, and parallel execution.
              </p>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-center">
                  <span className="text-blue-500 mr-3">✓</span> Human-readable configuration
                </li>
                <li className="flex items-center">
                  <span className="text-blue-500 mr-3">✓</span> Natural language queries for data slicing
                </li>
                <li className="flex items-center">
                  <span className="text-blue-500 mr-3">✓</span> Zero-code PII protection
                </li>
              </ul>
            </div>
            <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
              <div className="flex items-center space-x-2 px-4 py-3 bg-gray-800 border-b border-gray-700">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-2 text-xs text-gray-500 font-mono">config.yaml</span>
              </div>
              <pre className="p-6 text-sm font-mono overflow-x-auto text-gray-300 leading-relaxed">
{`processors:
  - type: pii_masker
    mode: "mask"
    use_ner: true
    model_path: "models/ner"

  - type: semantic_pruner
    query: "find user browser behavior"
    threshold: 0.85

sink:
  type: cloud
  url: "s3://my-bucket/clean-data/"`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 bg-black text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} UDO Project. Open Source Software.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-black border border-white/10 hover:border-blue-500/50 transition duration-300 group">
      <div className="text-4xl mb-6 group-hover:scale-110 transition duration-300">{icon}</div>
      <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}