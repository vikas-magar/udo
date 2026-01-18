import Link from 'next/link';

export default function DocsIndex() {
  return (
    <div>
      <div className="mb-12 border-b border-slate-800 pb-8">
        <h1 className="text-5xl font-bold text-white mb-6 tracking-tight">Documentation</h1>
        <p className="text-xl text-slate-400 max-w-2xl leading-relaxed">
          Welcome to the UDO documentation. Explore our architecture, integration guides, and product specifications to get started.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <DocLink 
          href="/docs/integration" 
          title="Value & Integration" 
          description="Understand the 'Context Noise' problem and how UDO solves it in RAG pipelines." 
          icon="⚡"
        />
        <DocLink 
          href="/docs/usage" 
          title="Usage Guide" 
          description="Step-by-step guides for CLI usage, configuration, and production deployment." 
          icon="🛠️"
        />
        <DocLink 
          href="/docs/architecture" 
          title="Architecture Overview" 
          description="Deep dive into the Data Plane (Rust) and Semantic Sieve components." 
          icon="🏗️"
        />
        <DocLink 
          href="/docs/product" 
          title="Product Specification" 
          description="Detailed breakdown of features, goals, target audience, and future roadmap." 
          icon="📋"
        />
      </div>
    </div>
  );
}

function DocLink({ href, title, description, icon }: { href: string, title: string, description: string, icon: string }) {
  return (
    <Link href={href} className="group block p-8 bg-[#1E293B] rounded-2xl border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800 transition-all duration-300 shadow-lg shadow-black/20 hover:shadow-blue-900/10">
      <div className="text-3xl mb-4 group-hover:scale-110 transition duration-300 transform origin-left">{icon}</div>
      <h2 className="text-xl font-bold mb-3 text-white group-hover:text-blue-400 transition">{title}</h2>
      <p className="text-slate-400 leading-relaxed text-sm">{description}</p>
    </Link>
  );
}