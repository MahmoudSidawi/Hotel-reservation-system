'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, Filter, RefreshCw, Edit2, Trash2, ChevronLeft,
  ChevronRight, CheckCircle2, X, Loader2, BedDouble,
} from 'lucide-react';

type Room = {
  _id: string;
  roomNumber: string;
  floor: number;
  status: string;
  notes?: string;
  lastCleaned?: string;
  roomTypeId?: {
    _id: string;
    name: string;
    basePrice: number;
    capacity: number;
    bedType?: string;
  };
};

type RoomType = {
  _id: string;
  name: string;
  basePrice: number;
  capacity: number;
  bedType?: string;
};

const STATUS_COLORS: Record<string, string> = {
  available:      'bg-emerald-100 text-emerald-800',
  reserved:       'bg-amber-100 text-amber-800',
  occupied:       'bg-blue-100 text-blue-800',
  needs_cleaning: 'bg-orange-100 text-orange-800',
  cleaning:       'bg-purple-100 text-purple-800',
  maintenance:    'bg-rose-100 text-rose-800',
  out_of_service: 'bg-zinc-100 text-zinc-600',
};

const ALL_STATUSES = ['available', 'reserved', 'occupied', 'needs_cleaning', 'cleaning', 'maintenance', 'out_of_service'];

function RoomModal({
  room,
  roomTypes,
  onClose,
  onSaved,
}: {
  room: Room | null;
  roomTypes: RoomType[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    roomNumber: room?.roomNumber ?? '',
    floor: room?.floor ?? 1,
    status: room?.status ?? 'available',
    roomTypeId: room?.roomTypeId?._id ?? '',
    notes: room?.notes ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!form.roomNumber.trim() || !form.roomTypeId) {
      setError('Room number and type are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const url = room ? `/api/rooms/${room._id}` : '/api/rooms';
      const method = room ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? 'Failed to save room');
        return;
      }
      onSaved();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200">
          <h3 className="font-bold text-zinc-900">{room ? 'Edit Room' : 'Add Room'}</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          {error && <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded p-2">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">Room Number *</label>
              <input
                value={form.roomNumber}
                onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-400"
                placeholder="e.g. 101"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">Floor *</label>
              <input
                type="number" min={1}
                value={form.floor}
                onChange={(e) => setForm({ ...form, floor: Number(e.target.value) })}
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-400"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">Room Type *</label>
            <select
              value={form.roomTypeId}
              onChange={(e) => setForm({ ...form, roomTypeId: e.target.value })}
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-400"
            >
              <option value="">Select room type...</option>
              {roomTypes.map((rt) => (
                <option key={rt._id} value={rt._id}>{rt.name} — ${rt.basePrice}/night</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-400"
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ').toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">Staff Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-400 resize-none"
              placeholder="Internal notes visible to staff only..."
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end px-5 pb-5">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-zinc-600 border border-zinc-200 rounded-lg hover:bg-zinc-50">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-xs font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 disabled:opacity-50 flex items-center gap-1.5"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            {room ? 'Save Changes' : 'Create Room'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RoomsTab() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingRoom, setEditingRoom] = useState<Room | null | undefined>(undefined); // undefined = closed, null = new
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  const loadRooms = useCallback(async () => {
    setLoading(true);
    try {
      const [roomsRes, typesRes] = await Promise.all([
        fetch('/api/rooms'),
        fetch('/api/room-types'),
      ]);
      if (roomsRes.ok) setRooms(await roomsRes.json());
      if (typesRes.ok) setRoomTypes(await typesRes.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadRooms(); }, [loadRooms]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this room? This cannot be undone.')) return;
    await fetch(`/api/rooms/${id}`, { method: 'DELETE' });
    setRooms((prev) => prev.filter((r) => r._id !== id));
  };

  const handleStatusChange = async (room: Room, status: string) => {
    const res = await fetch(`/api/rooms/${room._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setRooms((prev) => prev.map((r) => (r._id === room._id ? { ...r, status: updated.status } : r)));
    }
  };

  const filtered = rooms.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q
      || r.roomNumber.toLowerCase().includes(q)
      || (r.roomTypeId?.name ?? '').toLowerCase().includes(q);
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Room Inventory</h2>
          <p className="text-xs text-zinc-500">{rooms.length} rooms total · {filtered.length} showing</p>
        </div>
        <button
          onClick={() => setEditingRoom(null)}
          className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-zinc-700 transition"
        >
          <Plus className="w-4 h-4" /> Add Room
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by room number or type..."
            className="w-full pl-9 pr-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-zinc-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-400"
        >
          <option value="">All Statuses</option>
          {ALL_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ').toUpperCase()}</option>)}
        </select>
        <button onClick={loadRooms} className="flex items-center gap-1.5 border border-zinc-200 px-3 py-2 rounded-lg text-sm text-zinc-600 hover:bg-zinc-50">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Room Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48 gap-2 text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading rooms...
        </div>
      ) : paginated.length === 0 ? (
        <div className="text-center py-20 text-zinc-400">
          <BedDouble className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No rooms match your criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginated.map((room) => (
            <div key={room._id} className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4 space-y-3 flex flex-col">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase text-amber-600 font-mono">Suite #{room.roomNumber}</p>
                  <h3 className="font-bold text-zinc-900 text-sm">{room.roomTypeId?.name ?? 'Unknown Type'}</h3>
                  <p className="text-[11px] text-zinc-500">Floor {room.floor} · {room.roomTypeId?.capacity ?? '?'} guests</p>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${STATUS_COLORS[room.status] ?? 'bg-zinc-100 text-zinc-600'}`}>
                  {room.status.replace(/_/g, ' ')}
                </span>
              </div>

              {room.roomTypeId && (
                <p className="text-sm font-bold text-zinc-800">${room.roomTypeId.basePrice}<span className="text-[10px] text-zinc-400 font-normal">/night</span></p>
              )}

              {room.notes && <p className="text-[11px] text-zinc-500 italic line-clamp-1">📝 {room.notes}</p>}

              {/* Quick status update */}
              <select
                value={room.status}
                onChange={(e) => handleStatusChange(room, e.target.value)}
                className="w-full border border-zinc-200 rounded-lg px-2 py-1.5 text-[11px] font-bold text-zinc-700 bg-zinc-50 focus:outline-none"
              >
                {ALL_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ').toUpperCase()}</option>)}
              </select>

              <div className="flex gap-2 pt-1 border-t border-zinc-100">
                <button
                  onClick={() => setEditingRoom(room)}
                  className="flex-1 flex items-center justify-center gap-1 text-[11px] font-semibold text-zinc-600 hover:text-zinc-900 py-1.5 hover:bg-zinc-50 rounded transition"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(room._id)}
                  className="flex-1 flex items-center justify-center gap-1 text-[11px] font-semibold text-rose-500 hover:text-rose-700 py-1.5 hover:bg-rose-50 rounded transition"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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

      {/* Create/Edit Modal */}
      {editingRoom !== undefined && (
        <RoomModal
          room={editingRoom}
          roomTypes={roomTypes}
          onClose={() => setEditingRoom(undefined)}
          onSaved={() => { setEditingRoom(undefined); loadRooms(); }}
        />
      )}
    </div>
  );
}
