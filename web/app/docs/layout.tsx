import Link from 'next/link';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-50 font-sans flex selection:bg-blue-500 selection:text-white">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-800 h-screen fixed top-0 left-0 overflow-y-auto hidden md:block bg-[#0F172A]/95 backdrop-blur-xl z-20">
        <div className="p-6 border-b border-slate-800">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">UDO Docs</Link>
        </div>
        <nav className="mt-6 px-4 space-y-8">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-3">Getting Started</h3>
            <ul className="space-y-1">
              <li><NavLink href="/docs">Introduction</NavLink></li>
              <li><NavLink href="/docs/integration">Value & Integration</NavLink></li>
              <li><NavLink href="/docs/usage">Usage Guide</NavLink></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-3">Core Concepts</h3>
            <ul className="space-y-1">
              <li><NavLink href="/docs/architecture">Architecture</NavLink></li>
              <li><NavLink href="/docs/product">Product Spec</NavLink></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-3">Reference</h3>
            <ul className="space-y-1">
              <li><NavLink href="/docs/status">Project Status</NavLink></li>
              <li><a href="https://github.com/vikas-magar/udo" target="_blank" className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition">GitHub Repo ↗</a></li>
            </ul>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-8 md:p-12 max-w-5xl mx-auto w-full">
        {children}
        
        {/* Simple Footer for Docs */}
        <div className="mt-24 pt-8 border-t border-slate-800/50 text-sm text-slate-500 flex justify-between items-center">
          <span>&copy; 2026 UDO Project</span>
          <Link href="/" className="hover:text-blue-400 transition">Back to Landing Page</Link>
        </div>
      </main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 hover:border-slate-700 transition border border-transparent"
    >
      {children}
    </Link>
  );
}
