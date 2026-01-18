import Link from 'next/link';

export default function DocsIndex() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <nav className="fixed w-full z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-500">UDO Docs</Link>
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-gray-400 hover:text-white transition">Home</Link>
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition">Dashboard</Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Documentation</h1>
        <div className="grid gap-6">
          <DocLink 
            href="/docs/status" 
            title="Project Status" 
            description="Current development status, implemented features, known gaps, and readiness assessment." 
          />
          <DocLink 
            href="/docs/architecture" 
            title="Architecture Overview" 
            description="Deep dive into the Data Plane (Rust), Control Plane (Next.js), and core components like the Semantic Sieve." 
          />
          <DocLink 
            href="/docs/product" 
            title="Product Specification" 
            description="Detailed breakdown of features, goals, target audience, and future roadmap." 
          />
        </div>
      </main>
    </div>
  );
}

function DocLink({ href, title, description }: { href: string, title: string, description: string }) {
  return (
    <Link href={href} className="block p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-blue-500 transition group">
      <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-400 transition">{title}</h2>
      <p className="text-gray-400">{description}</p>
    </Link>
  );
}
