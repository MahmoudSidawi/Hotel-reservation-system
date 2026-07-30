'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Loader2, Sparkles, Plus, X, CheckCircle2, Building2, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

type Room = {
  _id: string;
  roomNumber: string;
  floor: number;
  status: string;
  notes?: string;
  lastCleaned?: string;
  roomTypeId?: { name: string };
};

const COLUMNS = [
  { id: 'needs_cleaning', label: '🧹 Needs Cleaning', desc: 'Rooms awaiting cleaning', bg: 'bg-orange-50 border-orange-200' },
  { id: 'cleaning',       label: '🫧 In Progress',    desc: 'Being cleaned now',       bg: 'bg-blue-50 border-blue-200'    },
  { id: 'available',      label: '✅ Clean & Ready',  desc: 'Clean and available',     bg: 'bg-emerald-50 border-emerald-200' },
];

function MaintenanceReportModal({ room, onClose, onSubmitted }: {
  room: Room;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [form, setForm] = useState({ category: 'other', priority: 'medium', title: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('Title is required'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room._id, ...form }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Failed to submit'); return; }
      onSubmitted();
    } catch { setError('Network error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200">
          <h3 className="font-bold text-zinc-900">Report Issue — Room #{room.roomNumber}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-zinc-400" /></button>
        </div>
        <div className="p-5 space-y-3">
          {error && <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded p-2">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                {['electrical','plumbing','hvac','furniture','appliance','cleaning','security','other'].map(c =>
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">Priority</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                {['low','medium','high','urgent'].map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">Issue Title *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Broken toilet flush"
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">Details</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3} className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" />
          </div>
        </div>
        <div className="flex gap-2 justify-end px-5 pb-5">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-zinc-600 border border-zinc-200 rounded-lg">Cancel</button>
          <button onClick={handleSubmit} disabled={saving}
            className="px-5 py-2 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 flex items-center gap-1.5">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HousekeepingPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportRoom, setReportRoom] = useState<Room | null>(null);
  const { user, logout } = useAuth();
  const router = useRouter();

  const fetchRooms = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const res = await fetch('/api/housekeeping/rooms', { cache: 'no-store' });
      if (res.ok) setRooms(await res.json());
    } catch { /* ignore */ }
    finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms(true);
    const interval = setInterval(() => fetchRooms(false), 5000);
    return () => clearInterval(interval);
  }, [fetchRooms]);

  const updateStatus = async (roomId: string, status: string) => {
    // Optimistic update
    setRooms((prev) => prev.map((r) => r._id === roomId ? { ...r, status } : r));

    try {
      const res = await fetch('/api/housekeeping/rooms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setRooms((prev) => prev.map((r) => r._id === roomId ? updated : r));
      }
    } catch {
      fetchRooms(false);
    }
  };

  const colRooms = (status: string) => rooms.filter((r) => r.status === status);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      {/* Top Navigation */}
      <header className="bg-[#1a1a2e] text-white px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-teal-400" />
          </div>
          <div>
            <p className="text-sm font-bold">VELORA — Housekeeping</p>
            <p className="text-[10px] text-zinc-400">{user?.name ?? 'Housekeeper'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => fetchRooms(true)} className="border border-zinc-600 text-zinc-300 hover:text-white hover:border-zinc-400 px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button onClick={async () => { await logout(); router.push('/login'); }}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white px-3 py-1.5 border border-zinc-700 rounded-lg">
            <LogOut className="w-3.5 h-3.5" /> Exit
          </button>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8 max-w-screen-xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-zinc-900">Housekeeping Board</h2>
          <p className="text-sm text-zinc-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} ·{' '}
            {rooms.filter(r => r.status === 'needs_cleaning').length} rooms awaiting cleaning
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 gap-2 text-zinc-400">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading task board...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {COLUMNS.map((col) => {
              const cr = colRooms(col.id);
              return (
                <div key={col.id} className={`rounded-xl border-2 ${col.bg} p-4 min-h-[300px]`}>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold text-zinc-800">{col.label}</h3>
                    <span className="bg-white border border-zinc-200 text-zinc-600 text-[11px] font-bold px-2 py-0.5 rounded-full">{cr.length}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mb-4">{col.desc}</p>
                  <div className="space-y-3">
                    {cr.length === 0 ? (
                      <div className="text-center py-10 text-zinc-400">
                        <Sparkles className="w-8 h-8 mx-auto mb-1 opacity-30" />
                        <p className="text-xs">All clear!</p>
                      </div>
                    ) : cr.sort((a, b) => a.floor - b.floor || a.roomNumber.localeCompare(b.roomNumber)).map((room) => (
                      <div key={room._id} className="bg-white rounded-lg border border-zinc-200 shadow-sm p-3.5 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-[10px] text-zinc-400 font-mono font-bold uppercase">Floor {room.floor}</p>
                            <p className="font-bold text-zinc-900 text-base">Room #{room.roomNumber}</p>
                            <p className="text-[11px] text-zinc-500">{room.roomTypeId?.name ?? ''}</p>
                          </div>
                          <button
                            onClick={() => setReportRoom(room)}
                            title="Report maintenance issue"
                            className="text-[10px] text-rose-500 border border-rose-200 hover:bg-rose-50 rounded px-1.5 py-0.5 font-bold transition"
                          >
                            ⚠️ Report
                          </button>
                        </div>
                        {room.notes && <p className="text-[11px] text-zinc-400 italic">{room.notes}</p>}
                        {room.lastCleaned && (
                          <p className="text-[10px] text-zinc-400">
                            Last cleaned: {new Date(room.lastCleaned).toLocaleDateString()}
                          </p>
                        )}
                        <div className="pt-1 flex gap-2">
                          {col.id === 'needs_cleaning' && (
                            <button onClick={() => updateStatus(room._id, 'cleaning')}
                              className="flex-1 text-[11px] font-bold bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 transition">
                              Start Cleaning
                            </button>
                          )}
                          {col.id === 'cleaning' && (
                            <button onClick={() => updateStatus(room._id, 'available')}
                              className="flex-1 text-[11px] font-bold bg-emerald-600 text-white rounded-lg py-2 hover:bg-emerald-700 transition">
                              ✓ Mark Done
                            </button>
                          )}
                          {col.id === 'available' && (
                            <button onClick={() => updateStatus(room._id, 'needs_cleaning')}
                              className="flex-1 text-[11px] font-bold text-orange-600 border border-orange-200 rounded-lg py-2 hover:bg-orange-50 transition">
                              Mark Dirty
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {reportRoom && (
        <MaintenanceReportModal
          room={reportRoom}
          onClose={() => setReportRoom(null)}
          onSubmitted={() => { setReportRoom(null); load(); }}
        />
      )}
    </div>
  );
}
