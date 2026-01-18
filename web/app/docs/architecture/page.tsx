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

        <h2 className="text-2xl font-semibold text-white mb-8 mt-12">4. High-Level Architecture</h2>
        
        {/* Visual Architecture Diagram */}
        <div className="mb-12 p-8 bg-[#0F172A] border border-slate-800 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-[100px]">🏗️</div>
          
          <div className="flex flex-col space-y-8 relative z-10">
            
            {/* Control Plane */}
            <div className="bg-[#1E293B] border border-blue-500/30 rounded-xl p-6 relative">
              <div className="absolute -top-3 left-4 px-2 bg-blue-600 text-[10px] font-bold text-white rounded shadow-lg uppercase tracking-widest">Control Plane (Next.js)</div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-slate-900 rounded border border-slate-700 text-sm font-medium text-slate-300">Management UI</div>
                <div className="p-3 bg-slate-900 rounded border border-slate-700 text-sm font-medium text-slate-300">Monitoring</div>
              </div>
            </div>

            {/* Arrows */}
            <div className="flex justify-around px-12 text-slate-500 text-xs">
              <div className="flex flex-col items-center">
                <span>↓ Config</span>
                <div className="h-8 w-0.5 bg-slate-700"></div>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-8 w-0.5 bg-slate-700"></div>
                <span>↑ Metrics</span>
              </div>
            </div>

            {/* Data Plane */}
            <div className="bg-[#1E293B] border border-purple-500/30 rounded-xl p-6 relative">
              <div className="absolute -top-3 left-4 px-2 bg-purple-600 text-[10px] font-bold text-white rounded shadow-lg uppercase tracking-widest">Data Plane (Rust)</div>
              
              <div className="flex flex-col md:flex-row items-center gap-4">
                {/* Ingestion */}
                <div className="flex-1 w-full p-4 bg-slate-900 rounded border border-slate-700 flex flex-col items-center text-center">
                  <span className="text-xs text-purple-400 font-bold uppercase mb-1">Ingestion</span>
                  <span className="text-[10px] text-slate-400">S3 / Kafka</span>
                </div>

                <div className="text-slate-600 hidden md:block">→</div>
                <div className="text-slate-600 md:hidden">↓</div>

                {/* Semantic Sieve */}
                <div className="flex-[2] w-full p-4 bg-slate-900 rounded border border-slate-700 flex flex-col items-center text-center shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                  <span className="text-xs text-purple-400 font-bold uppercase mb-1">Semantic Sieve</span>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-1 bg-black/40 rounded text-[9px] text-slate-300">Intent</span>
                    <span className="px-2 py-1 bg-black/40 rounded text-[9px] text-slate-300">Prune</span>
                    <span className="px-2 py-1 bg-black/40 rounded text-[9px] text-slate-300">Mask</span>
                  </div>
                </div>

                <div className="text-slate-600 hidden md:block">→</div>
                <div className="text-slate-600 md:hidden">↓</div>

                {/* Output */}
                <div className="flex-1 w-full p-4 bg-slate-900 rounded border border-slate-700 flex flex-col items-center text-center">
                  <span className="text-xs text-purple-400 font-bold uppercase mb-1">Output</span>
                  <span className="text-[10px] text-slate-400">Parquet / Stream</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      <h2 className="text-2xl font-semibold text-white mt-12 mb-4">3. Technology Stack</h2>
      <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
        <li><strong>Language:</strong> Rust (Performance & Safety)</li>
        <li><strong>Core Libs:</strong> <code>arrow-rs</code> (Memory), <code>tokio</code> (Async), <code>candle</code> (AI).</li>
        <li><strong>Infrastructure:</strong> Docker, Terraform.</li>
      </ul>
    </div>
  );
}