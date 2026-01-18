import Link from 'next/link';

export default function DocsIndex() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-white mb-6">Documentation</h1>
      <p className="text-xl text-gray-400 mb-12">
        Welcome to the UDO documentation. Select a chapter from the sidebar or start below.
      </p>
      
      <div className="grid gap-6">
        <DocLink 
          href="/docs/integration" 
          title="Value & Integration" 
          description="Understand the 'Context Noise' problem and how UDO solves it in RAG pipelines." 
        />
        <DocLink 
          href="/docs/usage" 
          title="Usage Guide" 
          description="Step-by-step guides for CLI usage, configuration, and integration." 
        />
        <DocLink 
          href="/docs/architecture" 
          title="Architecture Overview" 
          description="Deep dive into the Data Plane (Rust) and Semantic Sieve components." 
        />
      </div>
    </div>
  );
}

function DocLink({ href, title, description }: { href: string, title: string, description: string }) {
  return (
    <Link href={href} className="block p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-blue-500 transition group">
      <h2 className="text-xl font-semibold mb-2 text-white group-hover:text-blue-400 transition">{title}</h2>
      <p className="text-gray-400">{description}</p>
    </Link>
  );
}