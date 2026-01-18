import Link from 'next/link';

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
            <a href="https://github.com/vikas-magar/udo" target="_blank" className="hover:text-white transition">GitHub</a>
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
            <Link 
              href="/docs" 
              className="px-8 py-4 rounded-lg border border-gray-700 hover:bg-gray-900 text-gray-300 font-medium text-lg transition"
            >
              View Documentation
            </Link>
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

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/5 opacity-20 pointer-events-none"></div>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">How UDO Works</h2>
            <p className="text-gray-400">A seamless pipeline from raw data to clean, optimized context.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 mb-20">
            <StepCard 
              step="01"
              title="Connect & Ingest"
              description="Connect to S3 buckets, Kafka topics, or local files. UDO streams data using zero-copy Apache Arrow buffers."
            />
            <StepCard 
              step="02"
              title="Analyze & Mask"
              description="Local BERT models identify PII and semantic relevance. Irrelevant columns are dropped; sensitive data is masked."
            />
            <StepCard 
              step="03"
              title="Deliver & Monitor"
              description="Optimized Parquet files are written to your sink. Real-time metrics are pushed to the dashboard."
            />
          </div>

          <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-2xl max-w-4xl mx-auto">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-xs text-gray-500 font-mono">config.yaml</span>
            </div>
            <div className="grid md:grid-cols-2">
              <div className="p-6 border-r border-gray-800 bg-gray-900/50">
                <h4 className="text-sm font-semibold text-blue-400 mb-4 uppercase tracking-wider">Pipeline Config</h4>
                <pre className="text-xs font-mono text-gray-300 leading-relaxed overflow-x-auto">
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
              <div className="p-6 flex flex-col justify-center">
                <h4 className="text-sm font-semibold text-green-400 mb-4 uppercase tracking-wider">Result</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span> 
                    <span>PII (Names, Emails) redacted via NER</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span> 
                    <span>Columns irrelevant to "browser behavior" dropped</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span> 
                    <span>Output optimized for Analytics/LLM Context</span>
                  </li>
                </ul>
              </div>
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

function StepCard({ step, title, description }: { step: string, title: string, description: string }) {
  return (
    <div className="relative p-8 rounded-2xl bg-zinc-900 border border-white/5 hover:bg-zinc-800 transition">
      <div className="text-5xl font-bold text-blue-900/20 absolute top-4 right-4">{step}</div>
      <h3 className="text-xl font-bold mb-3 text-white relative z-10">{title}</h3>
      <p className="text-gray-400 leading-relaxed relative z-10">{description}</p>
    </div>
  );
}