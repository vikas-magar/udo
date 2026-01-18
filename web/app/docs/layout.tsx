import Link from 'next/link';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 h-screen fixed overflow-y-auto hidden md:block">
        <div className="p-6">
          <Link href="/" className="text-2xl font-bold text-blue-500 tracking-tight">UDO Docs</Link>
        </div>
        <nav className="mt-4 px-4 space-y-8">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Getting Started</h3>
            <ul className="space-y-1">
              <li><NavLink href="/docs">Introduction</NavLink></li>
              <li><NavLink href="/docs/integration">Value & Integration</NavLink></li>
              <li><NavLink href="/docs/usage">Usage Guide</NavLink></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Core Concepts</h3>
            <ul className="space-y-1">
              <li><NavLink href="/docs/architecture">Architecture</NavLink></li>
              <li><NavLink href="/docs/product">Product Spec</NavLink></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Reference</h3>
            <ul className="space-y-1">
              <li><NavLink href="/docs/status">Project Status</NavLink></li>
              <li><a href="https://github.com/vikas-magar/udo" target="_blank" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800">GitHub Repo ↗</a></li>
            </ul>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-8 md:p-12 max-w-4xl mx-auto">
        {children}
        
        {/* Simple Footer for Docs */}
        <div className="mt-20 pt-8 border-t border-gray-800 text-sm text-gray-500 flex justify-between">
          <span>&copy; 2026 UDO Project</span>
          <Link href="/" className="hover:text-blue-400">Back to Landing Page</Link>
        </div>
      </main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="block px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition"
    >
      {children}
    </Link>
  );
}
