'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, Loader2, ChevronLeft, ChevronRight, Users } from 'lucide-react';

type Guest = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
};

const PER_PAGE = 15;

export default function GuestsTab() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ role: 'guest', limit: String(PER_PAGE), skip: String((page - 1) * PER_PAGE) });
      if (search.trim()) params.set('query', search.trim());
      const res = await fetch(`/api/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setGuests(Array.isArray(data) ? data : (data.users ?? []));
        setTotal(Array.isArray(data) ? data.length : (data.total ?? data.length ?? 0));
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (id: string) => {
    await fetch(`/api/users/${id}/deactivate`, { method: 'PATCH' });
    load();
  };

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-screen-xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Guest Profiles</h2>
          <p className="text-xs text-zinc-500">{total} registered guests</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 border border-zinc-200 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-600 hover:bg-zinc-50">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name or email..."
          className="w-full pl-9 pr-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-zinc-400"
        />
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 gap-2 text-zinc-400">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading guests...
          </div>
        ) : guests.length === 0 ? (
          <div className="text-center py-20 text-zinc-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No guests found</p>
          </div>
        ) : (
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase font-bold tracking-wider">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Last Login</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {guests.map((g) => (
                <tr key={g._id} className="hover:bg-zinc-50/60 transition">
                  <td className="px-4 py-3 font-semibold text-zinc-900">{g.name}</td>
                  <td className="px-4 py-3 text-zinc-600">{g.email}</td>
                  <td className="px-4 py-3 text-zinc-500">{g.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-zinc-500">{new Date(g.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-zinc-500">{g.lastLoginAt ? new Date(g.lastLoginAt).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${g.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {g.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActive(g._id)}
                      className={`text-[10px] font-bold px-3 py-1 rounded border transition ${g.isActive !== false ? 'border-rose-200 text-rose-600 hover:bg-rose-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}
                    >
                      {g.isActive !== false ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="p-1.5 rounded border border-zinc-200 disabled:opacity-40 hover:bg-zinc-50"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-xs text-zinc-600 font-medium">Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
            className="p-1.5 rounded border border-zinc-200 disabled:opacity-40 hover:bg-zinc-50"><ChevronRight className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  );
}
