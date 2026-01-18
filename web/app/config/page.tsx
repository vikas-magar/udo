import Link from 'next/link';

export default function ConfigPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex">
      {/* Sidebar */}
      <nav className="fixed top-0 left-0 h-full w-64 bg-gray-800 border-r border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-blue-500 mb-8 tracking-tighter">UDO</h1>
        <ul className="space-y-4">
          <li>
            <Link href="/" className="block p-3 text-gray-400 hover:bg-gray-700 hover:text-white rounded-lg transition">
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/config" className="block p-3 bg-gray-700 rounded-lg text-white font-medium">
              Configuration
            </Link>
          </li>
          <li>
            <span className="block p-3 text-gray-400 cursor-not-allowed">Analytics (Soon)</span>
          </li>
          <li>
            <span className="block p-3 text-gray-400 cursor-not-allowed">Settings (Soon)</span>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="ml-64 p-8 w-full max-w-5xl">
        <header className="mb-8">
          <h2 className="text-3xl font-semibold">Source Configuration</h2>
          <p className="text-gray-400 mt-2">Manage your data streams and schema evolution rules.</p>
        </header>

        {/* Form Section */}
        <section className="bg-gray-800 rounded-xl border border-gray-700 p-8 shadow-2xl mb-8">
          <h3 className="text-xl font-medium mb-6">Add New Data Source</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-gray-400 uppercase font-bold tracking-wider">Source Name</label>
              <input 
                type="text" 
                placeholder="e.g. Production S3 Bucket" 
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400 uppercase font-bold tracking-wider">Source Type</label>
              <select className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>AWS S3</option>
                <option>Kafka Topic</option>
                <option>Google Cloud Storage</option>
                <option>PostgreSQL (CDC)</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm text-gray-400 uppercase font-bold tracking-wider">Connection String / URI</label>
              <input 
                type="text" 
                placeholder="s3://production-data-v2/raw-events/" 
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button className="mt-8 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg transition shadow-lg shadow-blue-900/20">
            Register Source
          </button>
        </section>

        {/* Rule Engine Section */}
        <section className="bg-gray-800 rounded-xl border border-gray-700 p-8 shadow-2xl">
          <h3 className="text-xl font-medium mb-6">Schema Evolution Rules</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700">
              <div>
                <p className="font-bold">Auto-Adapt Schema</p>
                <p className="text-sm text-gray-400">Automatically include new fields in the agent context if they are non-breaking.</p>
              </div>
              <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700">
              <div>
                <p className="font-bold text-red-400">Strict Mode</p>
                <p className="text-sm text-gray-400">Pause the data pipeline and alert engineers when a field type changes (e.g. String to Int).</p>
              </div>
              <div className="w-12 h-6 bg-gray-700 rounded-full relative">
                <div className="absolute left-1 top-1 w-4 h-4 bg-gray-400 rounded-full shadow-sm"></div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
