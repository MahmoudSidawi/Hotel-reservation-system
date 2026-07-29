'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Loader2, Download, BarChart3 } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, LineChart, Line,
} from 'recharts';

type MonthlyRevenue = { month: string; revenue: number; count: number };
type MonthlyOccupancy = { month: string; occupancyRate: number; count: number };

function exportCSV(filename: string, data: Record<string, unknown>[]) {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const csv = [keys.join(','), ...data.map(row => keys.map(k => JSON.stringify(row[k] ?? '')).join(','))].join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsTab() {
  const [revenue, setRevenue] = useState<MonthlyRevenue[]>([]);
  const [occupancy, setOccupancy] = useState<MonthlyOccupancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState(7);

  const load = async () => {
    setLoading(true);
    try {
      const [revRes, occRes] = await Promise.all([
        fetch(`/api/admin/reports?type=revenue&months=${months}`),
        fetch(`/api/admin/reports?type=occupancy&months=${months}`),
      ]);
      if (revRes.ok) { const d = await revRes.json(); setRevenue(d.data ?? []); }
      if (occRes.ok) { const d = await occRes.json(); setOccupancy(d.data ?? []); }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [months]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-screen-xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Reports & Analytics</h2>
          <p className="text-xs text-zinc-500">Historical performance data across all metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={months} onChange={(e) => setMonths(Number(e.target.value))}
            className="border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
            <option value={3}>Last 3 months</option>
            <option value={7}>Last 7 months</option>
            <option value={12}>Last 12 months</option>
          </select>
          <button onClick={load} className="border border-zinc-200 px-3 py-2 rounded-lg text-zinc-600 hover:bg-zinc-50">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 gap-2 text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading reports...
        </div>
      ) : (
        <>
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-zinc-900">Revenue by Month</h3>
                <p className="text-xs text-zinc-500">Realized from completed stays</p>
              </div>
              <button
                onClick={() => exportCSV('revenue_report.csv', revenue as unknown as Record<string, unknown>[])}
                className="flex items-center gap-1.5 text-xs font-semibold border border-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-50 text-zinc-600"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenue} margin={{ top: 4, right: 16, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#71717A' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#71717A' }} tickLine={false} axisLine={false}
                    tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                  <Tooltip contentStyle={{ background: '#18181B', border: 'none', borderRadius: 8, fontSize: 12, color: '#fff' }}
                    formatter={(v: any) => [`$${Number(v ?? 0).toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#D4AF37" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-zinc-100 pt-3">
              <div className="text-center">
                <p className="text-xl font-bold text-zinc-900">
                  ${revenue.reduce((s, r) => s + r.revenue, 0).toLocaleString()}
                </p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Total Revenue</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-zinc-900">
                  {revenue.reduce((s, r) => s + r.count, 0)}
                </p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Completed Stays</p>
              </div>
            </div>
          </div>

          {/* Occupancy Chart */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-zinc-900">Occupancy Rate Trend</h3>
                <p className="text-xs text-zinc-500">Percentage of rooms occupied per month</p>
              </div>
              <button
                onClick={() => exportCSV('occupancy_report.csv', occupancy as unknown as Record<string, unknown>[])}
                className="flex items-center gap-1.5 text-xs font-semibold border border-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-50 text-zinc-600"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={occupancy} margin={{ top: 4, right: 16, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#71717A' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#71717A' }} tickLine={false} axisLine={false}
                    tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: '#18181B', border: 'none', borderRadius: 8, fontSize: 12, color: '#fff' }}
                    formatter={(v: any) => [`${Number(v ?? 0)}%`, 'Occupancy Rate']} />
                  <Line type="monotone" dataKey="occupancyRate" stroke="#059669" strokeWidth={2} dot={{ r: 4, fill: '#059669' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue Table */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="font-bold text-zinc-900">Revenue Breakdown</h3>
            </div>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-100 text-zinc-500 uppercase font-bold tracking-wider">
                  <th className="px-4 py-3">Month</th>
                  <th className="px-4 py-3 text-right">Revenue</th>
                  <th className="px-4 py-3 text-right">Completed Stays</th>
                  <th className="px-4 py-3 text-right">Avg per Stay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {revenue.map((row) => (
                  <tr key={row.month} className="hover:bg-zinc-50/60 transition">
                    <td className="px-4 py-3 font-semibold text-zinc-900">{row.month}</td>
                    <td className="px-4 py-3 text-right font-bold text-zinc-900">${row.revenue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-zinc-600">{row.count}</td>
                    <td className="px-4 py-3 text-right text-zinc-600">
                      {row.count > 0 ? `$${Math.round(row.revenue / row.count).toLocaleString()}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
