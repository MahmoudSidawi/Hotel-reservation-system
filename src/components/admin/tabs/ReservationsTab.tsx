'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, RefreshCw, Loader2, ChevronLeft, ChevronRight,
  CheckCircle2, X, Trash2, Filter,
} from 'lucide-react';

import { useReservationEvents } from '@/hooks/useReservationEvents';

type Reservation = {
  _id: string;
  status: string;
  guests: number;
  totalPrice: number;
  checkIn: string;
  checkOut: string;
  specialRequests?: string;
  notes?: string;
  paymentStatus?: string;
  createdAt: string;
  userId?: { _id: string; name: string; email: string };
  roomId?: { _id: string; roomNumber: string; roomTypeId?: { name: string } };
  guestName?: string;
  guestEmail?: string;
  isWalkIn?: boolean;
};

const STATUS_COLORS: Record<string, string> = {
  pending:     'bg-zinc-100 text-zinc-700',
  confirmed:   'bg-amber-100 text-amber-800',
  checked_in:  'bg-emerald-100 text-emerald-800',
  checked_out: 'bg-blue-100 text-blue-700',
  cancelled:   'bg-rose-100 text-rose-700',
  no_show:     'bg-red-100 text-red-700',
};

const PAYMENT_COLORS: Record<string, string> = {
  pending:  'text-zinc-500',
  partial:  'text-amber-600',
  paid:     'text-emerald-600',
  refunded: 'text-rose-500',
};

const PAGE_LIMIT = 20;

export default function ReservationsTab() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: String(PAGE_LIMIT),
        skip: String((page - 1) * PAGE_LIMIT),
      });
      if (statusFilter) params.set('status', statusFilter);
      if (search.trim()) params.set('query', search.trim());

      // Use search endpoint when query is present, otherwise list
      const url = search.trim() || statusFilter
        ? `/api/reservations?${params}`
        : `/api/reservations?${params}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setReservations(Array.isArray(data) ? data : (data.reservations ?? []));
        setTotal(Array.isArray(data) ? data.length : (data.total ?? data.length ?? 0));
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);
  useReservationEvents(load);

  const updateStatus = async (id: string, status: string) => {
    try {
      const endpointMap: Record<string, string> = {
        checked_in:  `/api/receptionist/reservations/${id}/check-in`,
        checked_out: `/api/receptionist/reservations/${id}/check-out`,
        cancelled:   `/api/reservations/${id}/cancel`,
      };
      const url = endpointMap[status] ?? `/api/reservations/${id}`;
      const method = endpointMap[status] ? 'POST' : 'PATCH';
      const body = method === 'PATCH' ? JSON.stringify({ status }) : (status === 'checked_out' ? JSON.stringify({ additionalFees: 0 }) : undefined);

      const res = await fetch(url, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body,
      });
      const data = await res.json();
      if (res.status === 403) {
        alert("Permission Denied (403): You must be signed in with a Staff account (Admin or Receptionist) to update reservation status.");
        return;
      }
      if (res.status === 401) {
        alert("Session Expired (401): Please log in again.");
        window.location.href = "/login?callbackUrl=/admin";
        return;
      }
      if (!res.ok) {
        alert(data.error || `Failed to update reservation status to ${status}`);
        return;
      }
      load();
    } catch {
      alert("Failed to update status.");
    }
  };

  const deleteReservation = async (id: string) => {
    if (!confirm('Delete this reservation permanently?')) return;
    await fetch(`/api/reservations/${id}`, { method: 'DELETE' });
    load();
  };

  const guestName = (r: Reservation) =>
    r.guestName || r.userId?.name || 'Walk-in Guest';
  const guestEmail = (r: Reservation) =>
    r.guestEmail || r.userId?.email || '—';

  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Reservations</h2>
          <p className="text-xs text-zinc-500">{total} total reservations</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 border border-zinc-200 text-zinc-600 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-zinc-50"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search guest, room, email..."
            className="w-full pl-9 pr-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-zinc-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
        >
          <option value="">All Statuses</option>
          {['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'].map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ').toUpperCase()}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 gap-2 text-zinc-400">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading...
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-20 text-zinc-400 text-sm">No reservations found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[800px]">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase font-bold tracking-wider">
                  <th className="px-4 py-3">Guest</th>
                  <th className="px-4 py-3">Room</th>
                  <th className="px-4 py-3">Check-in</th>
                  <th className="px-4 py-3">Check-out</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {reservations.map((r) => (
                  <tr key={r._id} className="hover:bg-zinc-50/60 transition">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-zinc-900">{guestName(r)}</p>
                      <p className="text-zinc-400">{guestEmail(r)}</p>
                      {r.isWalkIn && <span className="text-[10px] text-purple-600 font-bold">Walk-in</span>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-zinc-900">#{r.roomId?.roomNumber ?? '—'}</p>
                      <p className="text-zinc-400">{r.roomId?.roomTypeId?.name ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-700 whitespace-nowrap">
                      {new Date(r.checkIn).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-zinc-700 whitespace-nowrap">
                      {new Date(r.checkOut).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_COLORS[r.status] ?? 'bg-zinc-100 text-zinc-600'}`}>
                        {r.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-semibold ${PAYMENT_COLORS[r.paymentStatus ?? 'pending']}`}>
                      {(r.paymentStatus ?? 'pending').toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-zinc-900">
                      ${r.totalPrice.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {(r.status === 'pending' || r.status === 'confirmed') && (
                          <button
                            onClick={() => updateStatus(r._id, 'checked_in')}
                            className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold hover:bg-emerald-700 transition"
                          >Check-in</button>
                        )}
                        {r.status === 'checked_in' && (
                          <button
                            onClick={() => updateStatus(r._id, 'checked_out')}
                            className="px-2 py-1 bg-blue-600 text-white rounded text-[10px] font-bold hover:bg-blue-700 transition"
                          >Check-out</button>
                        )}
                        {!['cancelled', 'checked_out', 'no_show'].includes(r.status) && (
                          <button
                            onClick={() => updateStatus(r._id, 'cancelled')}
                            className="px-2 py-1 text-rose-600 border border-rose-200 rounded text-[10px] font-bold hover:bg-rose-50 transition"
                          >Cancel</button>
                        )}
                        <button
                          onClick={() => deleteReservation(r._id)}
                          className="p-1 text-zinc-400 hover:text-rose-600 rounded transition"
                        ><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="p-1.5 rounded border border-zinc-200 disabled:opacity-40 hover:bg-zinc-50">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-zinc-600 font-medium">Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
            className="p-1.5 rounded border border-zinc-200 disabled:opacity-40 hover:bg-zinc-50">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
