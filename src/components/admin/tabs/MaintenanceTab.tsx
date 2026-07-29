'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Loader2, Plus, Wrench, AlertCircle, X, CheckCircle2, ChevronDown } from 'lucide-react';

type MaintenanceRequest = {
  _id: string;
  title: string;
  description?: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  roomId?: { _id: string; roomNumber: string; floor: number };
  reportedBy?: { _id: string; name: string; role: string };
  assignedTo?: { _id: string; name: string; role: string };
};

const PRIORITY_COLORS: Record<string, string> = {
  low:    'bg-zinc-100 text-zinc-600',
  medium: 'bg-amber-100 text-amber-700',
  high:   'bg-orange-100 text-orange-700',
  urgent: 'bg-rose-100 text-rose-700',
};

const STATUS_COLORS: Record<string, string> = {
  open:        'bg-rose-100 text-rose-700',
  assigned:    'bg-amber-100 text-amber-800',
  in_progress: 'bg-blue-100 text-blue-700',
  resolved:    'bg-emerald-100 text-emerald-700',
  closed:      'bg-zinc-100 text-zinc-500',
};

function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [rooms, setRooms] = useState<{ _id: string; roomNumber: string }[]>([]);
  const [form, setForm] = useState({ roomId: '', category: 'other', priority: 'medium', title: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/rooms').then(r => r.json()).then(d => setRooms(Array.isArray(d) ? d : []));
  }, []);

  const handleSave = async () => {
    if (!form.roomId || !form.title.trim()) { setError('Room and title are required'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Failed to create request'); return; }
      onCreated();
    } catch { setError('Network error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200">
          <h3 className="font-bold text-zinc-900">Report Maintenance Issue</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-zinc-400" /></button>
        </div>
        <div className="p-5 space-y-3">
          {error && <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded p-2">{error}</p>}
          <div>
            <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">Room *</label>
            <select value={form.roomId} onChange={(e) => setForm({ ...form, roomId: e.target.value })}
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
              <option value="">Select room...</option>
              {rooms.map((r) => <option key={r._id} value={r._id}>Room #{r.roomNumber}</option>)}
            </select>
          </div>
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
            <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">Title *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Brief description of the issue"
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">Details</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3} placeholder="Full description of the issue..."
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" />
          </div>
        </div>
        <div className="flex gap-2 justify-end px-5 pb-5">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-zinc-600 border border-zinc-200 rounded-lg hover:bg-zinc-50">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2 text-xs font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 disabled:opacity-50 flex items-center gap-1.5">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            Submit Request
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MaintenanceTab() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showModal, setShowModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (priorityFilter) params.set('priority', priorityFilter);
      const res = await fetch(`/api/maintenance?${params}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests ?? []);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [statusFilter, priorityFilter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/maintenance/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-screen-xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Maintenance Requests</h2>
          <p className="text-xs text-zinc-500">{requests.length} requests</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-zinc-700">
            <Plus className="w-4 h-4" /> Report Issue
          </button>
          <button onClick={load} className="border border-zinc-200 px-3 py-2 rounded-lg text-zinc-600 hover:bg-zinc-50">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
          <option value="">All Statuses</option>
          {['open','assigned','in_progress','resolved','closed'].map(s =>
            <option key={s} value={s}>{s.replace(/_/g, ' ').toUpperCase()}</option>)}
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
          className="border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
          <option value="">All Priorities</option>
          {['low','medium','high','urgent'].map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 gap-2 text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading...
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20 text-zinc-400">
          <Wrench className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No maintenance requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req._id} className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${PRIORITY_COLORS[req.priority]}`}>
                      {req.priority}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_COLORS[req.status]}`}>
                      {req.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">{req.category.toUpperCase()}</span>
                  </div>
                  <h3 className="font-bold text-zinc-900">{req.title}</h3>
                  {req.description && <p className="text-xs text-zinc-500 mt-1">{req.description}</p>}
                  
                  {/* ACTIVE BOOKING WARNING BANNER */}
                  {(req as any).activeReservation && (
                    <div className="mt-2.5 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Active Guest Reservation Detected</span>
                      </div>
                      <p className="text-amber-900 font-medium">
                        Guest: <span className="font-bold">{(req as any).activeReservation.guestName}</span> ({(req as any).activeReservation.guestEmail})
                      </p>
                      <p className="text-[11px] text-amber-700">
                        Stay: {new Date((req as any).activeReservation.checkIn).toLocaleDateString()} → {new Date((req as any).activeReservation.checkOut).toLocaleDateString()} · Status: <span className="uppercase font-semibold font-mono">{(req as any).activeReservation.status}</span>
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 mt-2 text-[11px] text-zinc-500">
                    <span>🚪 Room #{req.roomId?.roomNumber ?? '?'} · Floor {req.roomId?.floor ?? '?'}</span>
                    {req.reportedBy && <span>👤 Reported by {req.reportedBy.name}</span>}
                    {req.assignedTo && <span>🔧 Assigned to {req.assignedTo.name}</span>}
                    <span>📅 {new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {req.status === 'open' && (
                    <button onClick={() => updateStatus(req._id, 'in_progress')}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded text-[11px] font-bold hover:bg-blue-700">
                      Start
                    </button>
                  )}
                  {req.status === 'in_progress' && (
                    <button onClick={() => updateStatus(req._id, 'resolved')}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded text-[11px] font-bold hover:bg-emerald-700">
                      Resolve
                    </button>
                  )}
                  {req.status === 'resolved' && (
                    <button onClick={() => updateStatus(req._id, 'closed')}
                      className="px-3 py-1.5 border border-zinc-200 text-zinc-600 rounded text-[11px] font-bold hover:bg-zinc-50">
                      Close
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CreateModal onClose={() => setShowModal(false)} onCreated={() => { setShowModal(false); load(); }} />
      )}
    </div>
  );
}
