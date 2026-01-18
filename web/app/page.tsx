import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-50 font-sans selection:bg-blue-500 selection:text-white">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-[#0F172A]/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              UDO
            </span>
            <span className="text-xs text-slate-400 border border-slate-700 rounded px-1.5 py-0.5 bg-slate-800/50">BETA</span>
          </div>
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#how-it-works" className="hover:text-white transition">How it Works</a>
            <a href="https://github.com/vikas-magar/udo" target="_blank" className="hover:text-white transition">GitHub</a>
          </div>
          <div>
            <Link 
              href="/dashboard" 
              className="px-5 py-2 rounded-full bg-white text-[#0F172A] font-semibold text-sm hover:bg-gray-200 transition shadow-lg shadow-white/10"
            >
              Launch Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
            <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-white">
            The <span className="text-blue-400">Universal Data Optimizer</span> <br/>for Secure Pipelines
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Automatically mask PII and prune irrelevant data using local AI models. 
            Designed for air-gapped environments and high-performance ETL.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link 
              href="/dashboard" 
              className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg transition shadow-xl shadow-blue-900/20 hover:scale-105 transform duration-200"
            >
              Get Started
            </Link>
            <Link 
              href="/docs" 
              className="px-8 py-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-medium text-lg transition hover:border-slate-500"
            >
              View Documentation
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-24 bg-[#1E293B]/30 border-y border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Built for Modern Data Compliance</h2>
            <p className="text-slate-400">Security first, performance always.</p>
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
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">How UDO Works</h2>
            <p className="text-slate-400">A seamless pipeline from raw data to clean, optimized context.</p>
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

          <div className="bg-[#1E293B] rounded-2xl overflow-hidden border border-slate-700 shadow-2xl max-w-4xl mx-auto">
            <div className="flex items-center justify-between px-4 py-3 bg-[#0F172A] border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <span className="text-xs text-slate-500 font-mono">config.yaml</span>
            </div>
            <div className="grid md:grid-cols-2">
              <div className="p-6 border-r border-slate-800 bg-[#0F172A]/50">
                <h4 className="text-sm font-semibold text-blue-400 mb-4 uppercase tracking-wider">Pipeline Config</h4>
                <pre className="text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto">
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
              <div className="p-6 flex flex-col justify-center bg-[#1E293B]">
                <h4 className="text-sm font-semibold text-green-400 mb-4 uppercase tracking-wider">Result</h4>
                <ul className="space-y-3 text-sm text-slate-300">
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
      <footer className="py-12 border-t border-slate-800 bg-[#0F172A] text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} UDO Project. Open Source Software.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-[#1E293B] border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 group hover:shadow-2xl hover:shadow-blue-500/10">
      <div className="text-4xl mb-6 group-hover:scale-110 transition duration-300 transform origin-left">{icon}</div>
      <h3 className="text-xl font-bold mb-3 text-white group-hover:text-blue-400 transition">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ step, title, description }: { step: string, title: string, description: string }) {
  return (
    <div className="relative p-8 rounded-2xl bg-[#1E293B] border border-slate-800 hover:bg-slate-800 hover:border-slate-600 transition group">
      <div className="text-5xl font-bold text-slate-800 absolute top-4 right-4 group-hover:text-blue-500/10 transition">{step}</div>
      <h3 className="text-xl font-bold mb-3 text-white relative z-10 group-hover:text-blue-400 transition">{title}</h3>
      <p className="text-slate-400 leading-relaxed relative z-10">{description}</p>
    </div>
  );
}