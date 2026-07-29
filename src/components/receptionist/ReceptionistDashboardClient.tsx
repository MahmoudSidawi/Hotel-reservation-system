'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarCheck, Calendar, Users, UserCheck, BedDouble, Loader2, RefreshCw,
  LogOut, Building2, Menu, X, ChevronRight, Search, Plus,
  Phone, Mail, Hash, ArrowRight, CheckCircle2, Clock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useReservationEvents } from '@/hooks/useReservationEvents';

// ── Types ─────────────────────────────────────────────────────────────────────

type Reservation = {
  _id: string;
  status: string;
  guests: number;
  totalPrice: number;
  checkIn: string;
  checkOut: string;
  notes?: string;
  specialRequests?: string;
  isWalkIn?: boolean;
  userId?: { _id: string; name: string; email: string; phone?: string };
  roomId?: { _id: string; roomNumber: string; roomTypeId?: { name: string } };
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
};

type Room = {
  _id: string;
  roomNumber: string;
  floor: number;
  status: string;
  roomTypeId?: { name: string; basePrice: number };
};

// ── Sidebar ───────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'board',         label: "Today's Board",   icon: CalendarCheck },
  { id: 'reservations',  label: 'Reservations',    icon: Users         },
  { id: 'rooms',         label: 'Room Status',     icon: BedDouble     },
  { id: 'search',        label: 'Guest Lookup',    icon: Search        },
  { id: 'walkin',        label: 'Walk-in',         icon: Plus          },
] as const;
type Tab = typeof TABS[number]['id'];

function Sidebar({
  active,
  onSelect,
  onLogout,
  isOpen,
  onClose,
  user,
}: {
  active: Tab;
  onSelect: (t: Tab) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
  user: { name: string; email: string } | null;
}) {
  return (
    <>
      {isOpen && <div onClick={onClose} className="fixed inset-0 bg-black/60 z-40 lg:hidden" />}
      <aside className={`fixed top-0 bottom-0 left-0 z-50 w-60 bg-[#1a1a2e] text-zinc-300 flex flex-col border-r border-[#232340] shrink-0 transition-transform duration-300 lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#232340]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-teal-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">VELORA</p>
              <p className="text-[10px] text-teal-400 uppercase tracking-widest font-mono">Receptionist</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = active === t.id;
            return (
              <button key={t.id} onClick={() => { onSelect(t.id); onClose(); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${isActive ? 'bg-teal-500/15 text-teal-300 border-l-2 border-teal-400 pl-[10px]' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'}`}>
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-400' : 'text-zinc-500'}`} />
                <span className="flex-1 text-left">{t.label}</span>
                {isActive && <ChevronRight className="w-3 h-3 text-teal-400" />}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-[#232340]">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-xs font-bold text-teal-300">
              {user?.name?.[0]?.toUpperCase() ?? 'R'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name ?? 'Receptionist'}</p>
              <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-4 py-3 border-t border-[#232340] text-xs font-semibold text-zinc-500 hover:text-white hover:bg-zinc-800/50 transition">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, string> = {
  pending:     'bg-zinc-100 text-zinc-600',
  confirmed:   'bg-amber-100 text-amber-800',
  checked_in:  'bg-emerald-100 text-emerald-800',
  checked_out: 'bg-blue-100 text-blue-700',
  cancelled:   'bg-rose-100 text-rose-600',
};

const ROOM_STATUS_BADGE: Record<string, string> = {
  available:      'bg-emerald-100 text-emerald-800',
  reserved:       'bg-amber-100 text-amber-800',
  occupied:       'bg-blue-100 text-blue-700',
  needs_cleaning: 'bg-orange-100 text-orange-700',
  cleaning:       'bg-purple-100 text-purple-700',
  maintenance:    'bg-rose-100 text-rose-700',
};

// ── Today's Board Tab ─────────────────────────────────────────────────────────

function TodayBoard() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [showAllPending, setShowAllPending] = useState<boolean>(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reservations');
      if (res.ok) {
        const all: Reservation[] = await res.json();
        setReservations(all);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useReservationEvents(load);

  const targetDate = new Date(selectedDate);
  targetDate.setHours(0, 0, 0, 0);

  const todayStr = new Date().toISOString().slice(0, 10);
  const isToday = selectedDate === todayStr;

  // Arrivals for selected date (or all pending if showAllPending is true)
  const arrivals = reservations.filter((r) => {
    if (r.status !== 'pending' && r.status !== 'confirmed') return false;
    if (showAllPending) return true;
    const ci = new Date(r.checkIn);
    ci.setHours(0, 0, 0, 0);
    return ci.getTime() === targetDate.getTime();
  });

  // Departures for selected date
  const departures = reservations.filter((r) => {
    if (r.status !== 'checked_in') return false;
    const co = new Date(r.checkOut);
    co.setHours(0, 0, 0, 0);
    return co.getTime() === targetDate.getTime();
  });

  // System Summary Stats
  const checkedInCount = reservations.filter((r) => r.status === 'checked_in').length;
  const allPendingCount = reservations.filter((r) => r.status === 'pending' || r.status === 'confirmed').length;

  const handleCheckIn = async (id: string) => {
    try {
      const res = await fetch(`/api/receptionist/reservations/${id}/check-in`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to check in guest');
        return;
      }
      load();
    } catch {
      alert('Failed to check in guest.');
    }
  };

  const handleCheckOut = async (id: string) => {
    try {
      const res = await fetch(`/api/receptionist/reservations/${id}/check-out`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ additionalFees: 0 }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to check out guest');
        return;
      }
      load();
    } catch {
      alert('Failed to check out guest.');
    }
  };

  const gName = (r: Reservation) => r.userId?.name ?? r.guestName ?? 'Walk-in';

  if (loading) return (
    <div className="flex items-center justify-center h-64 gap-2 text-zinc-400">
      <Loader2 className="w-5 h-5 animate-spin" /> Loading schedule...
    </div>
  );

  return (
    <div className="space-y-6">
      {/* SUMMARY STATS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Expected Arrivals</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{arrivals.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Expected Departures</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{departures.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Currently Checked In</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{checkedInCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Pending Stays</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{allPendingCount}</p>
        </div>
      </div>

      {/* CONTROLS BAR */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-zinc-500" />
          <span className="text-xs font-bold text-zinc-700">Schedule Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setShowAllPending(false);
            }}
            className="border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-800 focus:outline-none"
          />
          {!isToday && (
            <button
              onClick={() => {
                setSelectedDate(todayStr);
                setShowAllPending(false);
              }}
              className="text-[11px] font-bold text-blue-600 hover:underline ml-1"
            >
              Set to Today
            </button>
          )}
        </div>

        <button
          onClick={() => setShowAllPending(!showAllPending)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
            showAllPending
              ? 'bg-purple-600 text-white border-purple-600'
              : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
          }`}
        >
          {showAllPending ? '✓ Showing All Upcoming Stays' : 'Show All Upcoming Stays'}
        </button>
      </div>

      {/* BOARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Arrivals */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 bg-amber-50">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-zinc-900">
                {showAllPending ? 'All Upcoming & Pending Stays' : `Arrivals (${selectedDate})`}
              </h3>
            </div>
            <span className="bg-amber-200 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {arrivals.length}
            </span>
          </div>
          <div className="divide-y divide-zinc-50">
            {arrivals.length === 0 ? (
              <p className="text-center text-zinc-400 text-sm py-10">
                {showAllPending ? 'No pending bookings found' : `No arrivals scheduled for ${selectedDate}`}
              </p>
            ) : (
              arrivals.map((r) => (
                <div key={r._id} className="flex items-center justify-between px-5 py-4 hover:bg-zinc-50/60 transition">
                  <div>
                    <p className="font-semibold text-zinc-900 text-sm">
                      {gName(r)} <span className="text-xs font-normal text-zinc-400">({r.userId?.email || r.guestEmail || 'No email'})</span>
                    </p>
                    <p className="text-xs text-zinc-500">
                      Room #{r.roomId?.roomNumber ?? '?'} · {new Date(r.checkIn).toLocaleDateString()} → {new Date(r.checkOut).toLocaleDateString()}
                    </p>
                    {r.isWalkIn && <span className="text-[10px] text-purple-600 font-bold">Walk-in</span>}
                  </div>
                  <button
                    onClick={() => handleCheckIn(r._id)}
                    className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 transition"
                  >
                    <ArrowRight className="w-3.5 h-3.5" /> Check-in
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Departures */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 bg-blue-50">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-zinc-900">Departures ({selectedDate})</h3>
            </div>
            <span className="bg-blue-200 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {departures.length}
            </span>
          </div>
          <div className="divide-y divide-zinc-50">
            {departures.length === 0 ? (
              <p className="text-center text-zinc-400 text-sm py-10">
                No departures scheduled for {selectedDate}
              </p>
            ) : (
              departures.map((r) => (
                <div key={r._id} className="flex items-center justify-between px-5 py-4 hover:bg-zinc-50/60 transition">
                  <div>
                    <p className="font-semibold text-zinc-900 text-sm">
                      {gName(r)} <span className="text-xs font-normal text-zinc-400">({r.userId?.email || r.guestEmail || 'No email'})</span>
                    </p>
                    <p className="text-xs text-zinc-500">
                      Room #{r.roomId?.roomNumber ?? '?'} · ${r.totalPrice.toLocaleString()} total
                    </p>
                  </div>
                  <button
                    onClick={() => handleCheckOut(r._id)}
                    className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition"
                  >
                    <ArrowRight className="w-3.5 h-3.5" /> Check-out
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Reservations Tab ──────────────────────────────────────────────────────────

function ReservationsPanel() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reservations?limit=100');
      if (res.ok) setReservations(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useReservationEvents(load);

  const updateStatus = async (id: string, action: string) => {
    try {
      const endpointMap: Record<string, string> = {
        checked_in: `/api/receptionist/reservations/${id}/check-in`,
        checked_out: `/api/receptionist/reservations/${id}/check-out`,
        cancelled: `/api/reservations/${id}/cancel`,
      };
      const url = endpointMap[action] ?? `/api/reservations/${id}`;
      const method = endpointMap[action] ? 'POST' : 'PATCH';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: action === 'checked_out' ? JSON.stringify({ additionalFees: 0 }) : method === 'PATCH' ? JSON.stringify({ status: action }) : undefined,
      });
      const data = await res.json();
      if (res.status === 403) {
        alert("Permission Denied (403): You are currently signed in as a Guest. Please log out and sign in as Receptionist or Admin (receptionist@hotel.test / Password123!) to perform check-ins.");
        return;
      }
      if (res.status === 401) {
        alert("Session Expired (401): Please log in again to continue.");
        window.location.href = "/login?callbackUrl=/receptionist";
        return;
      }
      if (!res.ok) {
        alert(data.error || `Failed to update status to ${action}`);
        return;
      }
      load();
    } catch (err) {
      alert("Failed to update status. Please try again.");
    }
  };

  const gName = (r: Reservation) => r.userId?.name ?? r.guestName ?? 'Walk-in';

  const filtered = reservations.filter((r) => {
    const q = search.toLowerCase();
    return (!q || gName(r).toLowerCase().includes(q) || (r.roomId?.roomNumber ?? '').includes(q))
      && (!statusFilter || r.status === statusFilter);
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guest or room..."
            className="w-full pl-9 pr-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
          <option value="">All Statuses</option>
          {['pending','confirmed','checked_in','checked_out','cancelled'].map(s =>
            <option key={s} value={s}>{s.replace(/_/g, ' ').toUpperCase()}</option>)}
        </select>
        <button onClick={load} className="border border-zinc-200 px-3 py-2 rounded-lg text-zinc-600 hover:bg-zinc-50">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 gap-2 text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <div key={r._id} className="bg-white rounded-xl border border-zinc-200 shadow-sm px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_BADGE[r.status] ?? 'bg-zinc-100 text-zinc-600'}`}>
                    {r.status.replace(/_/g, ' ')}
                  </span>
                  {r.isWalkIn && <span className="text-[10px] text-purple-600 font-bold">Walk-in</span>}
                </div>
                <p className="font-bold text-zinc-900">
                  {gName(r)} <span className="font-normal text-xs text-zinc-500">({r.userId?.email || r.guestEmail || 'No email'})</span>
                </p>
                <p className="text-xs text-zinc-500">
                  Room #{r.roomId?.roomNumber ?? '?'} ·{' '}
                  {new Date(r.checkIn).toLocaleDateString()} → {new Date(r.checkOut).toLocaleDateString()} ·{' '}
                  ${r.totalPrice.toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2 shrink-0 flex-wrap">
                {(r.status === 'pending' || r.status === 'confirmed') && (
                  <button onClick={() => updateStatus(r._id, 'checked_in')}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-bold hover:bg-emerald-700">Check-in</button>
                )}
                {r.status === 'checked_in' && (
                  <button onClick={() => updateStatus(r._id, 'checked_out')}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700">Check-out</button>
                )}
                {!['cancelled', 'checked_out'].includes(r.status) && (
                  <button onClick={() => updateStatus(r._id, 'cancelled')}
                    className="px-3 py-1.5 border border-rose-200 text-rose-600 rounded text-xs font-bold hover:bg-rose-50">Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Room Status Grid ──────────────────────────────────────────────────────────

function RoomStatusGrid() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/rooms');
      if (res.ok) setRooms(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useReservationEvents(load);

  const grouped = rooms.reduce<Record<number, Room[]>>((acc, r) => {
    if (!acc[r.floor]) acc[r.floor] = [];
    acc[r.floor].push(r);
    return acc;
  }, {});

  if (loading) return (
    <div className="flex items-center justify-center h-48 gap-2 text-zinc-400">
      <Loader2 className="w-5 h-5 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5">
      {Object.entries(grouped).sort(([a], [b]) => Number(a) - Number(b)).map(([floor, floorRooms]) => (
        <div key={floor}>
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Floor {floor}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {floorRooms.map((room) => (
              <div key={room._id} className="bg-white rounded-lg border border-zinc-200 shadow-sm p-3 text-center">
                <p className="text-lg font-bold text-zinc-900">#{room.roomNumber}</p>
                <p className="text-[10px] text-zinc-500 truncate">{room.roomTypeId?.name ?? ''}</p>
                <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${ROOM_STATUS_BADGE[room.status] ?? 'bg-zinc-100'}`}>
                  {room.status.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Guest Search ──────────────────────────────────────────────────────────────

function GuestSearch() {
  const [query, setQuery] = useState('');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGuests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reservations?limit=100');
      if (res.ok) {
        const data: Reservation[] = await res.json();
        setReservations(Array.isArray(data) ? data : []);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchGuests(); }, [fetchGuests]);
  useReservationEvents(fetchGuests);

  const gName = (r: Reservation) => r.userId?.name ?? r.guestName ?? 'Walk-in';

  const filteredResults = reservations.filter((r) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    const name = (r.userId?.name ?? r.guestName ?? '').toLowerCase();
    const email = (r.userId?.email ?? r.guestEmail ?? '').toLowerCase();
    const phone = (r.userId?.phone ?? r.guestPhone ?? '').toLowerCase();
    const roomNum = (r.roomId?.roomNumber ?? '').toLowerCase();
    return name.includes(q) || email.includes(q) || phone.includes(q) || roomNum.includes(q);
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by guest name, email, phone, or room number..."
            className="w-full pl-9 pr-3 py-2.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-zinc-400"
          />
        </div>
        {query && (
          <button
            onClick={() => setQuery('')}
            className="bg-zinc-100 text-zinc-600 px-3.5 py-2.5 rounded-lg text-xs font-semibold hover:bg-zinc-200"
          >
            Clear Filter
          </button>
        )}
      </div>

      {loading && (
        <div className="flex justify-center gap-2 text-zinc-400 py-8">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading guest list...
        </div>
      )}

      {!loading && filteredResults.length === 0 && (
        <p className="text-center text-zinc-400 text-sm py-8">
          {query ? `No guests match "${query}"` : 'No guest records found in system.'}
        </p>
      )}

      {!loading && filteredResults.map((r) => (
        <div key={r._id} className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-zinc-900">{gName(r)}</p>
              <div className="flex flex-wrap gap-3 mt-1 text-xs text-zinc-500">
                {(r.userId?.email ?? r.guestEmail) && (
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{r.userId?.email ?? r.guestEmail}</span>
                )}
                {(r.userId?.phone ?? r.guestPhone) && (
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{r.userId?.phone ?? r.guestPhone}</span>
                )}
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_BADGE[r.status] ?? 'bg-zinc-100'}`}>
              {r.status.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 text-xs text-zinc-600">
            <div><p className="text-[10px] uppercase text-zinc-400 font-semibold">Room</p><p className="font-bold">#{r.roomId?.roomNumber ?? '?'}</p></div>
            <div><p className="text-[10px] uppercase text-zinc-400 font-semibold">Check-in</p><p className="font-bold">{new Date(r.checkIn).toLocaleDateString()}</p></div>
            <div><p className="text-[10px] uppercase text-zinc-400 font-semibold">Total</p><p className="font-bold">${r.totalPrice.toLocaleString()}</p></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Walk-in Form ──────────────────────────────────────────────────────────────

function WalkInForm() {
  const router = useRouter();
  return (
    <div className="text-center py-12">
      <Plus className="w-12 h-12 mx-auto mb-4 text-zinc-300" />
      <h3 className="font-bold text-zinc-900 mb-2">Create Walk-in Reservation</h3>
      <p className="text-sm text-zinc-500 mb-6">Use the dedicated walk-in booking form to create an instant reservation for a guest at the front desk.</p>
      <button
        onClick={() => router.push('/receptionist/walk-in')}
        className="bg-zinc-900 text-white px-6 py-3 rounded-lg text-sm font-bold hover:bg-zinc-700 transition"
      >
        Open Walk-in Form →
      </button>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

const TAB_TITLES: Record<Tab, string> = {
  board:        "Today's Board",
  reservations: 'Reservations',
  rooms:        'Room Status',
  search:       'Guest Lookup',
  walkin:       'Walk-in Booking',
};

export default function ReceptionistDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('board');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'board':        return <TodayBoard />;
      case 'reservations': return <ReservationsPanel />;
      case 'rooms':        return <RoomStatusGrid />;
      case 'search':       return <GuestSearch />;
      case 'walkin':       return <WalkInForm />;
      default:             return <TodayBoard />;
    }
  };

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden font-sans">
      <Sidebar
        active={activeTab}
        onSelect={setActiveTab}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 bg-white border-b border-zinc-200 flex items-center gap-3 px-4 sm:px-6 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100">
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-zinc-900">{TAB_TITLES[activeTab]}</h1>
            <p className="text-[10px] text-zinc-500">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-screen-xl mx-auto w-full">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}