import Link from 'next/link';

export default function ConfigPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-50 font-sans flex">
      {/* Sidebar */}
      <nav className="fixed top-0 left-0 h-full w-64 bg-[#0F172A]/95 backdrop-blur-xl border-r border-slate-800 p-6 z-20">
        <div className="mb-8">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">UDO</Link>
        </div>
        <ul className="space-y-2">
          <li>
            <Link href="/dashboard" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition">
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/config" className="block px-4 py-2 bg-blue-600/10 text-blue-400 rounded-lg border border-blue-600/20 font-medium">
              Configuration
            </Link>
          </li>
          <li>
            <Link href="/" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition">
              Home
            </Link>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="ml-64 p-8 md:p-12 w-full max-w-5xl">
        <header className="mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-white">Source Configuration</h2>
          <p className="text-slate-400 mt-1">Manage your data streams and schema evolution rules.</p>
        </header>

        {/* Form Section */}
        <section className="bg-[#1E293B] rounded-2xl border border-slate-800 p-8 shadow-xl mb-10">
          <h3 className="text-lg font-semibold text-white mb-6 border-b border-slate-700/50 pb-4">Add New Data Source</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Source Name</label>
              <input 
                type="text" 
                placeholder="e.g. Production S3 Bucket" 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Source Type</label>
              <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                <option>AWS S3</option>
                <option>Kafka Topic</option>
                <option>Google Cloud Storage</option>
                <option>PostgreSQL (CDC)</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Connection String / URI</label>
              <input 
                type="text" 
                placeholder="s3://production-data-v2/raw-events/" 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl transition shadow-lg shadow-blue-900/20 hover:scale-[1.02] active:scale-[0.98]">
              Register Source
            </button>
          </div>
        </section>

        {/* Rule Engine Section */}
        <section className="bg-[#1E293B] rounded-2xl border border-slate-800 p-8 shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-6 border-b border-slate-700/50 pb-4">Schema Evolution Rules</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#0F172A]/50 rounded-xl border border-slate-700/50 hover:border-blue-500/30 transition cursor-pointer group">
              <div>
                <p className="font-bold text-white group-hover:text-blue-400 transition">Auto-Adapt Schema</p>
                <p className="text-sm text-slate-400 mt-1">Automatically include new fields in the agent context if they are non-breaking.</p>
              </div>
              <div className="w-12 h-6 bg-blue-600 rounded-full relative shadow-inner">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#0F172A]/50 rounded-xl border border-slate-700/50 hover:border-red-500/30 transition cursor-pointer group">
              <div>
                <p className="font-bold text-red-400 group-hover:text-red-300 transition">Strict Mode</p>
                <p className="text-sm text-slate-400 mt-1">Pause the data pipeline and alert engineers when a field type changes (e.g. String to Int).</p>
              </div>
              <div className="w-12 h-6 bg-slate-700 rounded-full relative shadow-inner">
                <div className="absolute left-1 top-1 w-4 h-4 bg-slate-400 rounded-full shadow-sm"></div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
