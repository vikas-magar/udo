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

      {/* Visual Flow Diagram */}
      <div className="my-12 p-8 bg-black/40 rounded-3xl border border-gray-800 relative shadow-2xl">
        <div className="flex flex-col items-center space-y-8">
          
          <div className="flex items-center space-x-4 w-full justify-center">
            <div className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-bold shadow-lg shadow-blue-900/20">User Query</div>
            <div className="h-px w-8 bg-gray-700"></div>
            <div className="px-4 py-2 bg-zinc-800 rounded-lg text-sm font-bold border border-gray-700">AI Agent / RAG</div>
          </div>

          <div className="flex flex-col items-center">
            <div className="text-[10px] text-gray-500 uppercase font-bold mb-2">1. Fetch Raw Data</div>
            <div className="h-8 w-px bg-gradient-to-b from-gray-700 to-blue-500"></div>
          </div>

          <div className="px-6 py-3 bg-zinc-900 rounded-xl border border-gray-700 flex flex-col items-center">
            <span className="text-xs text-gray-500 mb-1 uppercase font-bold tracking-widest">Data Source</span>
            <span className="text-sm font-mono text-blue-400">S3 / Kafka / SQL</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="text-[10px] text-red-500 uppercase font-bold mb-2 italic">2. Bloated Raw Dump (Noise)</div>
            <div className="h-12 w-px bg-gradient-to-b from-blue-500 to-purple-500 relative">
               <div className="absolute -right-32 top-1/2 -translate-y-1/2 flex items-center space-x-3">
                  <div className="h-px w-8 bg-purple-500"></div>
                  <div className="px-3 py-1 bg-purple-900/30 border border-purple-500 rounded text-[10px] font-bold text-purple-300">3. Intent ("Analyze Sales")</div>
               </div>
            </div>
          </div>

          <div className="px-10 py-6 bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl shadow-2xl shadow-blue-500/10 flex flex-col items-center border border-white/10 animate-pulse-slow">
            <span className="text-lg font-black tracking-tighter text-white">UDO ENGINE</span>
            <span className="text-[10px] text-blue-100 uppercase tracking-widest mt-1">4. Semantic Slicing & Masking</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="h-12 w-px bg-gradient-to-b from-purple-500 to-green-500"></div>
            <div className="text-[10px] text-green-400 uppercase font-bold mt-2">5. Perfect Context Slice (Signal)</div>
          </div>

          <div className="flex items-center space-x-4 w-full justify-center">
            <div className="px-4 py-2 bg-zinc-800 rounded-lg text-sm font-bold border border-gray-700">AI Agent</div>
            <div className="h-px w-8 bg-gray-700"></div>
            <div className="px-4 py-2 bg-green-600 rounded-lg text-sm font-bold shadow-lg shadow-green-900/20">LLM</div>
            <div className="h-px w-8 bg-gray-700"></div>
            <div className="px-4 py-2 bg-zinc-800 rounded-lg text-sm font-bold border border-gray-700">Answer</div>
          </div>

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
