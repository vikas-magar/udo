'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Metric {
  id: number;
  timestamp: string;
  processed_rows: number;
  latency_ms: number;
  tokens_saved: number;
  operation: string;
}

interface DashboardStats {
  total_rows: number;
  avg_latency: number;
  total_tokens_saved: number;
  recent_metrics: Metric[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch('http://localhost:8080/metrics', {
          headers: {
            'Authorization': 'Bearer viewer-secret'
          }
        });
        if (!res.ok) throw new Error('Failed to fetch metrics');
        const data: DashboardStats = await res.json();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to connect to UDO Engine API (is it running?)');
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 2000); // Poll every 2s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-50 font-sans flex">
      {/* Sidebar / Nav */}
      <nav className="fixed top-0 left-0 h-full w-64 bg-[#0F172A]/95 backdrop-blur-xl border-r border-slate-800 p-6 z-20">
        <div className="mb-8">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">UDO</Link>
        </div>
        <ul className="space-y-2">
          <li>
            <Link href="/dashboard" className="block px-4 py-2 bg-blue-600/10 text-blue-400 rounded-lg border border-blue-600/20 font-medium">
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/config" className="block px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition">
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
      <main className="ml-64 p-8 md:p-12 w-full">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Operational Overview</h2>
            <p className="text-slate-400 mt-1">Real-time pipeline performance metrics.</p>
          </div>
          <div className="flex items-center space-x-3 px-4 py-2 bg-[#1E293B] rounded-full border border-slate-700">
            <span className={`w-2.5 h-2.5 rounded-full ${error ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`}></span>
            <span className="text-xs font-medium text-slate-300">
              {error ? 'System Offline' : 'Engine Active'}
            </span>
          </div>
        </header>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl mb-8 flex items-center">
            <span className="mr-3">⚠️</span> {error}
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <MetricCard 
            title="Total Tokens Saved" 
            value={stats ? stats.total_tokens_saved.toLocaleString() : '-'} 
            sub="Cumulative Optimization"
            color="text-emerald-400"
            trend="+12%" // Placeholder
          />
          <MetricCard 
            title="Avg Latency" 
            value={stats ? `${stats.avg_latency.toFixed(2)}ms` : '-'} 
            sub="Processing Speed"
            color="text-blue-400"
            trend="-5ms"
          />
          <MetricCard 
            title="Processed Rows" 
            value={stats ? stats.total_rows.toLocaleString() : '-'} 
            sub="Throughput Volume"
            color="text-purple-400"
            trend="Live"
          />
        </div>

        {/* Recent Activity Table */}
        <div className="bg-[#1E293B] rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700/50 flex justify-between items-center bg-[#0F172A]/50">
            <h3 className="font-semibold text-white">Recent Operations</h3>
            <span className="text-xs text-slate-500">Last 10 events</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-800/50 text-slate-200 font-medium border-b border-slate-700">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Operation</th>
                  <th className="px-6 py-3">Rows</th>
                  <th className="px-6 py-3">Latency</th>
                  <th className="px-6 py-3">Tokens Saved</th>
                  <th className="px-6 py-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {stats?.recent_metrics.map((metric) => (
                  <tr key={metric.id} className="hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">#{metric.id}</td>
                    <td className="px-6 py-4 font-medium text-white">{metric.operation}</td>
                    <td className="px-6 py-4">{metric.processed_rows}</td>
                    <td className="px-6 py-4 text-blue-400">{metric.latency_ms.toFixed(2)}ms</td>
                    <td className="px-6 py-4 text-emerald-400 font-medium">+{metric.tokens_saved}</td>
                    <td className="px-6 py-4 text-right text-xs text-slate-500">{metric.timestamp}</td>
                  </tr>
                ))}
                {(!stats || stats.recent_metrics.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500 italic">
                      Waiting for engine telemetry...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function MetricCard({ title, value, sub, color, trend }: { title: string, value: string, sub: string, color: string, trend: string }) {
  return (
    <div className="bg-[#1E293B] p-6 rounded-2xl border border-slate-800 shadow-lg hover:border-slate-700 transition">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</h3>
        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">{trend}</span>
      </div>
      <p className={`text-3xl font-bold ${color} mb-1`}>{value}</p>
      <p className="text-xs text-slate-500">{sub}</p>
    </div>
  );
}
