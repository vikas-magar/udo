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
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      {/* Sidebar / Nav */}
      <nav className="fixed top-0 left-0 h-full w-64 bg-gray-800 border-r border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-blue-500 mb-8 tracking-tighter">UDO</h1>
        <ul className="space-y-4">
          <li>
            <Link href="/dashboard" className="block p-3 bg-gray-700 rounded-lg text-white font-medium">
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/" className="block p-3 text-gray-400 hover:bg-gray-700 hover:text-white rounded-lg transition">
              Home
            </Link>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <header className="mb-8 flex justify-between items-center">
          <h2 className="text-3xl font-semibold">Real-time Overview</h2>
          <div className="flex items-center space-x-4">
            <span className={`w-3 h-3 rounded-full ${error ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></span>
            <span className="text-sm text-gray-400">
              {error ? 'System Offline' : 'System Operational'}
            </span>
          </div>
        </header>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
            <h3 className="text-gray-400 text-sm font-medium uppercase mb-2">Total Tokens Saved</h3>
            <p className="text-4xl font-bold text-green-400">
              {stats ? stats.total_tokens_saved.toLocaleString() : '-'}
            </p>
            <p className="text-xs text-gray-500 mt-2">Cumulative</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
            <h3 className="text-gray-400 text-sm font-medium uppercase mb-2">Avg Latency</h3>
            <p className="text-4xl font-bold text-blue-400">
              {stats ? stats.avg_latency.toFixed(2) : '-'} <span className="text-xl">ms</span>
            </p>
            <p className="text-xs text-gray-500 mt-2">Per request</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
            <h3 className="text-gray-400 text-sm font-medium uppercase mb-2">Processed Rows</h3>
            <p className="text-4xl font-bold text-purple-400">
              {stats ? stats.total_rows.toLocaleString() : '-'}
            </p>
            <p className="text-xs text-gray-500 mt-2">Total volume</p>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-xl font-semibold mb-4">Recent Operations</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-gray-700/50 text-gray-200 uppercase font-medium">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Operation</th>
                  <th className="p-3">Rows</th>
                  <th className="p-3">Latency</th>
                  <th className="p-3">Tokens Saved</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {stats?.recent_metrics.map((metric) => (
                  <tr key={metric.id} className="hover:bg-gray-700/30 transition">
                    <td className="p-3">#{metric.id}</td>
                    <td className="p-3 font-medium text-white">{metric.operation}</td>
                    <td className="p-3">{metric.processed_rows}</td>
                    <td className="p-3 text-blue-400">{metric.latency_ms.toFixed(2)}ms</td>
                    <td className="p-3 text-green-400">{metric.tokens_saved}</td>
                    <td className="p-3 text-gray-500">{metric.timestamp}</td>
                  </tr>
                ))}
                {(!stats || stats.recent_metrics.length === 0) && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-500 italic">
                      No recent activity found.
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
