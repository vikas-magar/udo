export default function IntegrationPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-4xl font-bold text-white mb-6">UDO in the AI Pipeline</h1>
      
      <p className="text-xl text-gray-300 mb-8 leading-relaxed">
        <strong>The Core Problem: Context Noise.</strong><br/>
        In modern Generative AI, Retrieval-Augmented Generation (RAG) and Agentic Workflows face a common bottleneck: data quality vs. quantity.
      </p>

      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-8">
        <h3 className="text-lg font-bold text-white mb-4">The Cost of Noise</h3>
        <ul className="space-y-2 text-gray-300">
          <li>💰 <strong>Financial:</strong> Sending 100 lines of JSON when 5 lines suffice increases token costs by 20x.</li>
          <li>⚡ <strong>Latency:</strong> More tokens = slower Time-To-First-Token (TTFT).</li>
          <li>🧠 <strong>Accuracy:</strong> LLMs struggle to find relevant facts when buried in irrelevant noise ("Lost in the Middle").</li>
        </ul>
      </div>

      <h2 className="text-2xl font-bold text-white mt-12 mb-8">Where UDO Fits</h2>
      <p className="text-gray-300 mb-10">
        UDO acts as an <strong>Intelligent Context Valve</strong> or Middleware that sits between your Data Source and your LLM.
      </p>

      {/* Professional System Flow Diagram */}
      <div className="my-16 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl rounded-full opacity-50"></div>
        
        <div className="relative bg-[#0F172A] border border-slate-800 rounded-2xl p-8 md:p-12 shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center relative z-10">
            
            {/* Step 1: User/Agent */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-600 shadow-lg relative group">
                <span className="text-2xl">👤</span>
                <div className="absolute -bottom-2 px-2 py-0.5 bg-blue-600 text-[10px] font-bold text-white rounded-full">User Query</div>
              </div>
              <div className="h-16 w-0.5 md:w-full md:h-0.5 bg-slate-700/50"></div>
            </div>

            {/* Step 2: Data Source */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 w-full">
                <div className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Source</div>
                <div className="text-slate-200 font-mono text-sm">S3 / SQL</div>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-red-400 font-medium mb-1">Raw Dump (50MB)</span>
                <div className="h-12 w-0.5 bg-gradient-to-b from-red-500/50 to-transparent"></div>
              </div>
            </div>

            {/* Step 3: UDO Engine (Central) */}
            <div className="md:col-span-1 flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-b from-blue-900/20 to-purple-900/20 border border-blue-500/30 shadow-blue-900/20 shadow-xl backdrop-blur-sm transform md:scale-110">
              <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">UDO Engine</div>
              <div className="space-y-2 w-full">
                <div className="flex items-center justify-between text-[10px] text-slate-300 bg-black/40 px-2 py-1 rounded border border-white/5">
                  <span>Intent Analysis</span>
                  <span className="text-green-400">✓</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-300 bg-black/40 px-2 py-1 rounded border border-white/5">
                  <span>Semantic Pruning</span>
                  <span className="text-green-400">✓</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-300 bg-black/40 px-2 py-1 rounded border border-white/5">
                  <span>PII Masking</span>
                  <span className="text-green-400">✓</span>
                </div>
              </div>
            </div>

            {/* Step 4: Output */}
            <div className="flex flex-col-reverse md:flex-col items-center text-center space-y-4">
              <div className="flex flex-col items-center mb-4 md:mb-0">
                <span className="text-[10px] text-green-400 font-medium mb-1">Clean Slice (50KB)</span>
                <div className="h-12 w-0.5 bg-gradient-to-t md:bg-gradient-to-b from-green-500/50 to-transparent"></div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 w-full">
                <div className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Context</div>
                <div className="text-slate-200 font-mono text-sm">Optimized JSON</div>
              </div>
            </div>

            {/* Step 5: LLM */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-0.5 md:w-full md:h-0.5 bg-slate-700/50 order-2 md:order-1"></div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center border border-indigo-400 shadow-lg shadow-indigo-900/30 relative order-1 md:order-2">
                <span className="text-2xl font-bold text-white">AI</span>
                <div className="absolute -top-2 px-2 py-0.5 bg-white text-[10px] font-bold text-black rounded-full">LLM</div>
              </div>
            </div>

          </div>
          
          {/* Connecting Lines (Desktop only usually, but simplified here) */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -z-0 hidden md:block"></div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mt-12 mb-4">Detailed Integration Flows</h2>

      <h3 className="text-xl font-bold text-white mt-8 mb-2">Scenario A: The Financial Analyst Agent</h3>
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-red-900/10 border border-red-500/20 p-6 rounded-lg">
          <h4 className="font-bold text-red-400 mb-2">Without UDO</h4>
          <ol className="list-decimal list-inside text-sm text-gray-400 space-y-2">
            <li>Agent queries SQL: <code>SELECT * FROM transactions</code></li>
            <li>DB returns 1,000 rows with 50 columns each.</li>
            <li>Agent dumps all data into LLM context.</li>
            <li><strong>Result:</strong> Context Window Exceeded, Massive Cost, LLM Confused.</li>
          </ol>
        </div>
        <div className="bg-green-900/10 border border-green-500/20 p-6 rounded-lg">
          <h4 className="font-bold text-green-400 mb-2">With UDO</h4>
          <ol className="list-decimal list-inside text-sm text-gray-400 space-y-2">
            <li>Agent calls UDO CLI with raw query.</li>
            <li>Provides Intent: <em>"Analyze transaction amounts"</em>.</li>
            <li>UDO drops "server_id", "debug_trace", masks PII.</li>
            <li><strong>Result:</strong> Returns lightweight JSON. Fast, Cheap, Accurate.</li>
          </ol>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mt-12 mb-4">Deployment Example</h2>
      <p className="text-gray-300 mb-4">In a production pipeline (e.g., Airflow or Kubernetes):</p>

      <pre className="bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm text-gray-300">
{`# Step 1: Raw Data Extraction
- name: extract-data
  image: postgres-client
  command: ["pg_dump", "..."]

# Step 2: UDO Optimization (The Value Add)
- name: udo-optimize
  image: udo-engine:latest
  command:
    - "--input"
    - "/data/raw_dump.json"
    - "--query"
    - "extract customer sentiment" # <--- The Intent
    - "--pii-mode"
    - "mask"
    - "--output"
    - "/data/clean_context.parquet"

# Step 3: LLM Inference
- name: llm-process
  image: python-llm-script
  command: ["python", "analyze.py", "--input", "/data/clean_context.parquet"]`}
      </pre>
    </div>
  );
}
