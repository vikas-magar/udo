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

      <h2 className="text-2xl font-bold text-white mt-12 mb-4">Where UDO Fits</h2>
      <p className="text-gray-300 mb-6">
        UDO acts as an <strong>Intelligent Context Valve</strong> or Middleware that sits between your Data Source and your LLM.
      </p>

      <div className="my-8 p-4 bg-black rounded-lg border border-gray-800 font-mono text-xs text-blue-300 overflow-x-auto">
{`[User Query] --> [AI Agent / RAG System]
                      |
                      | 1. Fetch Data
                      v
               [Data Source (DB/API)]
                      |
                      | 2. Raw Data Dump (Bloated)
                      v
               [ UDO ENGINE ] <--- 3. Intent ("Analyze dates")
                      |
                      | 4. Semantic Slicing & Masking
                      v
               [Perfect Context Slice]
                      |
                      v
               [AI Agent] --> [LLM] --> [Answer]`}
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
