'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  BedDouble,
  CalendarCheck,
  Users,
  ShieldCheck,
  Search,
  Plus,
  Building2,
  DollarSign,
  Percent,
  X,
  Trash2,
  CheckCircle2,
  UserCheck,
  AlertTriangle,
  RefreshCw,
  Loader2,
  LucideIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

// ==========================================
// TYPES
// ==========================================
export type NavSection =
  | 'OVERVIEW'
  | 'ROOMS'
  | 'RESERVATIONS'
  | 'USERS';

export type ReservationStatus = 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'PENDING';

export interface Reservation {
  id: string;
  code: string;
  clientName: string;
  clientEmail: string;
  roomNumber: string;
  roomTitle: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  nightsCount: number;
  status: ReservationStatus;
  grossValue: number;
  createdAt: string;
  roomId?: string;
}

export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';

export interface Room {
  id: string;
  number: string;
  title: string;
  type: string;
  floor: number;
  pricePerNight: number;
  maxGuests: number;
  status: RoomStatus;
  features: string[];
}

export interface GuestProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  tier: 'STANDARD' | 'VIP' | 'PLATINUM' | 'ROYAL';
  totalStays: number;
  totalSpent: number;
}

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'RECEPTIONIST' | 'MANAGER' | 'GUEST';
  department: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface MonthlyRevenueData {
  month: string;
  revenue: number;
  occupancy: number;
}

// ==========================================
// SUB-COMPONENTS
// ==========================================

function Sidebar({ activeSection, onSelectSection }: { activeSection: NavSection; onSelectSection: (s: NavSection) => void }) {
  const items: { label: NavSection; icon: LucideIcon }[] = [
    { label: 'OVERVIEW', icon: LayoutDashboard },
    { label: 'ROOMS', icon: BedDouble },
    { label: 'RESERVATIONS', icon: CalendarCheck },
    { label: 'USERS', icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 bg-[#18181B] text-[#E4E4E7] flex flex-col justify-between border-r border-[#27272A] shrink-0 font-sans select-none min-h-screen">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-[#27272A] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold tracking-tight text-white">VELORA HOTEL</h1>
            <p className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37]">Management System</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5 mt-2">
          <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">Core Modules</div>
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.label;
            return (
              <button
                key={item.label}
                onClick={() => onSelectSection(item.label)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-[#27272A] text-[#D4AF37] border-l-4 border-[#D4AF37]'
                    : 'text-zinc-400 hover:text-white hover:bg-[#27272A]/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-zinc-500'}`} />
                <span className="capitalize">{item.label.toLowerCase()}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer User Info */}
      <div className="p-4 border-t border-[#27272A] bg-[#09090B]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center font-bold text-xs text-[#D4AF37]">
            AD
          </div>
          <div>
            <p className="text-xs font-bold text-white">Admin System</p>
            <p className="text-[10px] text-zinc-500">Connected Live to API</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ==========================================
// VIEW MODULES
// ==========================================

function OverviewModule({
  rooms,
  reservations,
  monthlyData,
  onOpenNewReservation,
  onNavigate,
}: {
  rooms: Room[];
  reservations: Reservation[];
  monthlyData: MonthlyRevenueData[];
  onOpenNewReservation: () => void;
  onNavigate: (s: NavSection) => void;
}) {
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((r: Room) => r.status === 'OCCUPIED').length;
  const reservedRooms = rooms.filter((r: Room) => r.status === 'RESERVED').length;
  const occupancyRate = totalRooms > 0 ? Math.round(((occupiedRooms + reservedRooms) / totalRooms) * 100) : 0;

  const activeCheckIns = reservations.filter((r: Reservation) => r.status === 'CHECKED_IN').length;
  const totalRevenue = reservations
    .filter((r: Reservation) => r.status !== 'CANCELLED')
    .reduce((sum: number, r: Reservation) => sum + r.grossValue, 0);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Executive Overview</h2>
          <p className="text-xs text-zinc-500">Live operational metrics and performance stats for Velora Hotel</p>
        </div>
        <button
          onClick={onOpenNewReservation}
          className="flex items-center gap-2 bg-[#18181B] hover:bg-zinc-800 text-white px-4 py-2.5 rounded-lg text-xs font-bold transition shadow-sm"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>New Reservation</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Inventory</span>
            <BedDouble className="w-5 h-5 text-zinc-400" />
          </div>
          <p className="text-3xl font-bold text-zinc-900">{totalRooms} Suites</p>
          <p className="text-xs text-zinc-500">Live MongoDB capacity</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Occupancy Rate</span>
            <Percent className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-zinc-900">{occupancyRate}%</p>
          <p className="text-xs text-emerald-600 font-medium">Real-time status</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Check-Ins</span>
            <UserCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-zinc-900">{activeCheckIns} Guests</p>
          <p className="text-xs text-zinc-500">In-house guests</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-zinc-900">${totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-emerald-600 font-medium">Recorded bookings value</p>
        </div>
      </div>

      {/* Revenue Analytics */}
      <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-zinc-900">Monthly Revenue & Occupancy Trends</h3>
          <p className="text-xs text-zinc-500">Financial performance from database records</p>
        </div>
        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData.length > 0 ? monthlyData : [{ month: 'Current', revenue: totalRevenue, occupancy: occupancyRate }]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#71717A' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#71717A' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181B', borderRadius: '8px', border: 'none', color: '#FFF', fontSize: '12px' }}
                formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Revenue']}
              />
              <Bar dataKey="revenue" fill="#D4AF37" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Reservations Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-zinc-900">Recent Guest Reservations</h3>
          <button
            onClick={() => onNavigate('RESERVATIONS')}
            className="text-xs font-bold text-zinc-700 hover:text-zinc-900 underline"
          >
            View All Reservations →
          </button>
        </div>

        <div className="overflow-x-auto">
          {reservations.length === 0 ? (
            <p className="text-xs text-zinc-500 py-6 text-center">No reservations found in the database.</p>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-zinc-50 border-y border-zinc-200 text-zinc-500 uppercase font-bold tracking-wider">
                  <th className="p-3">Code</th>
                  <th className="p-3">Guest Name</th>
                  <th className="p-3">Room / Suite</th>
                  <th className="p-3">Check-In</th>
                  <th className="p-3">Check-Out</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Total Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-zinc-800 font-medium">
                {reservations.slice(0, 5).map((res: Reservation) => (
                  <tr key={res.id} className="hover:bg-zinc-50/80 transition">
                    <td className="p-3 font-mono font-bold text-amber-700">{res.code}</td>
                    <td className="p-3 font-bold text-zinc-900">{res.clientName}</td>
                    <td className="p-3">{res.roomNumber} - {res.roomTitle}</td>
                    <td className="p-3">{res.checkInDate}</td>
                    <td className="p-3">{res.checkOutDate}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          res.status === 'CHECKED_IN'
                            ? 'bg-emerald-100 text-emerald-800'
                            : res.status === 'CONFIRMED'
                            ? 'bg-amber-100 text-amber-800'
                            : res.status === 'CHECKED_OUT'
                            ? 'bg-zinc-100 text-zinc-600'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {res.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-zinc-900">${res.grossValue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function RoomsModule({
  rooms,
  onUpdateStatus,
  searchQuery,
}: {
  rooms: Room[];
  onUpdateStatus: (id: string, st: RoomStatus) => void;
  searchQuery: string;
}) {
  const [filter, setFilter] = useState<'ALL' | RoomStatus>('ALL');
  const filtered = rooms.filter((r: Room) => {
    const matchesStatus = filter === 'ALL' ? true : r.status === filter;
    const q = searchQuery?.trim().toLowerCase() || '';
    const matchesSearch =
      !q ||
      r.number.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.type.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Room Inventory & Status</h2>
          <p className="text-xs text-zinc-500">Manage availability, pricing, and room statuses in real-time</p>
        </div>

        <div className="flex gap-2">
          {(['ALL', 'AVAILABLE', 'RESERVED', 'OCCUPIED', 'MAINTENANCE'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filter === st ? 'bg-[#18181B] text-white shadow-sm' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-zinc-500 text-xs border border-zinc-200">
          No rooms match your filter or search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((room: Room) => (
            <div key={room.id} className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-mono font-bold text-amber-600 uppercase">Suite #{room.number}</span>
                    <h3 className="font-bold text-base text-zinc-900">{room.title}</h3>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      room.status === 'AVAILABLE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : room.status === 'OCCUPIED'
                        ? 'bg-blue-100 text-blue-800'
                        : room.status === 'RESERVED'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {room.status}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-zinc-500 pt-2 border-t border-zinc-100">
                  <span>Capacity: {room.maxGuests} Guests</span>
                  <span className="font-bold text-zinc-900 text-sm">${room.pricePerNight} / night</span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {room.features.map((a, i) => (
                    <span key={i} className="text-[10px] bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded font-medium">
                      {a}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100">
                <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">Update Status</label>
                <select
                  value={room.status}
                  onChange={(e) => onUpdateStatus(room.id, e.target.value as RoomStatus)}
                  className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-bold text-zinc-800 focus:outline-none"
                >
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="RESERVED">RESERVED</option>
                  <option value="OCCUPIED">OCCUPIED</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReservationsModule({
  reservations,
  onUpdateStatus,
  onDelete,
  onOpenNew,
  searchQuery,
}: {
  reservations: Reservation[];
  onUpdateStatus: (id: string, st: ReservationStatus) => void;
  onDelete: (id: string) => void;
  onOpenNew: () => void;
  searchQuery: string;
}) {
  const filtered = reservations.filter((r: Reservation) => {
    const q = searchQuery?.trim().toLowerCase() || '';
    if (!q) return true;
    return (
      r.code.toLowerCase().includes(q) ||
      r.clientName.toLowerCase().includes(q) ||
      r.clientEmail.toLowerCase().includes(q) ||
      r.roomNumber.toLowerCase().includes(q) ||
      r.roomTitle.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Reservations & Reception Workflow</h2>
          <p className="text-xs text-zinc-500">Process guest check-in, check-out, and active booking records</p>
        </div>

        <button
          onClick={onOpenNew}
          className="bg-[#18181B] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>New Booking</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-xs text-zinc-500 p-8 text-center">No reservations found matching your criteria.</p>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase font-bold tracking-wider">
                <th className="p-4">Code</th>
                <th className="p-4">Guest Details</th>
                <th className="p-4">Room / Suite</th>
                <th className="p-4">Stay Duration</th>
                <th className="p-4">Status</th>
                <th className="p-4">Total</th>
                <th className="p-4 text-right">Workflow Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-zinc-800 font-medium">
              {filtered.map((res: Reservation) => (
                <tr key={res.id} className="hover:bg-zinc-50/80 transition">
                  <td className="p-4 font-mono font-bold text-amber-700">{res.code}</td>
                  <td className="p-4">
                    <p className="font-bold text-zinc-900">{res.clientName}</p>
                    <p className="text-[11px] text-zinc-500">{res.clientEmail}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-zinc-900">Suite #{res.roomNumber}</p>
                    <p className="text-[11px] text-zinc-500">{res.roomTitle}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-zinc-900">{res.checkInDate} → {res.checkOutDate}</p>
                    <p className="text-[11px] text-zinc-500">{res.nightsCount} Nights ({res.guestsCount} Guests)</p>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        res.status === 'CHECKED_IN'
                          ? 'bg-emerald-100 text-emerald-800'
                          : res.status === 'CONFIRMED'
                          ? 'bg-amber-100 text-amber-800'
                          : res.status === 'CHECKED_OUT'
                          ? 'bg-zinc-100 text-zinc-600'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {res.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-zinc-900">${res.grossValue.toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {(res.status === 'CONFIRMED' || res.status === 'PENDING') && (
                        <button
                          onClick={() => onUpdateStatus(res.id, 'CHECKED_IN')}
                          className="px-3 py-1 bg-emerald-600 text-white rounded text-[11px] font-bold hover:bg-emerald-700 transition"
                        >
                          Check-In
                        </button>
                      )}
                      {res.status === 'CHECKED_IN' && (
                        <button
                          onClick={() => onUpdateStatus(res.id, 'CHECKED_OUT')}
                          className="px-3 py-1 bg-zinc-800 text-white rounded text-[11px] font-bold hover:bg-zinc-900 transition"
                        >
                          Check-Out
                        </button>
                      )}
                      {res.status !== 'CANCELLED' && res.status !== 'CHECKED_OUT' && (
                        <button
                          onClick={() => onUpdateStatus(res.id, 'CANCELLED')}
                          className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded text-[11px] font-bold transition"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(res.id)}
                        className="p-1 text-zinc-400 hover:text-rose-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function CustomersModule({ guests, searchQuery }: { guests: GuestProfile[]; searchQuery: string }) {
  const filtered = guests.filter((g: GuestProfile) => {
    const q = searchQuery?.trim().toLowerCase() || '';
    if (!q) return true;
    return (
      g.name.toLowerCase().includes(q) ||
      g.email.toLowerCase().includes(q) ||
      g.phone.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto font-sans">
      <div>
        <h2 className="text-xl font-bold text-zinc-900">Registered Guest Profiles</h2>
        <p className="text-xs text-zinc-500">Centralized database of hotel guests, contact information, and stay history</p>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-zinc-500 text-xs border border-zinc-200">
          No guest profiles found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((g: GuestProfile) => (
            <div key={g.id} className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center font-bold text-base text-[#D4AF37] shrink-0">
                {g.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm text-zinc-900">{g.name}</h3>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">{g.tier}</span>
                </div>
                <p className="text-xs text-zinc-500">{g.email} • {g.phone}</p>
                <div className="flex gap-4 pt-2 text-xs">
                  <span className="font-semibold text-zinc-700">Total Stays: <strong className="text-zinc-900">{g.totalStays}</strong></span>
                  <span className="font-semibold text-zinc-700">Total Spent: <strong className="text-amber-700">${g.totalSpent.toLocaleString()}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UsersModule({ staff, searchQuery }: { staff: StaffUser[]; searchQuery: string }) {
  const filtered = staff.filter((u: StaffUser) => {
    const q = searchQuery?.trim().toLowerCase() || '';
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto font-sans">
      <div>
        <h2 className="text-xl font-bold text-zinc-900">Staff & Role Administration</h2>
        <p className="text-xs text-zinc-500">User authorization levels and front-desk personnel loaded from database</p>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-xs text-zinc-500 p-8 text-center">No user accounts found matching your query.</p>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase font-bold tracking-wider">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Department</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-zinc-800 font-medium">
              {filtered.map((u: StaffUser) => (
                <tr key={u.id} className="hover:bg-zinc-50/80 transition">
                  <td className="p-4 font-bold text-zinc-900">{u.name}</td>
                  <td className="p-4 text-zinc-500">{u.email}</td>
                  <td className="p-4 text-zinc-600">{u.department}</td>
                  <td className="p-4 font-bold text-amber-700">{u.role}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold uppercase">
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ==========================================
// MODAL FOR NEW RESERVATIONS
// ==========================================

function NewReservationModal({
  isOpen,
  onClose,
  rooms,
  onCreate,
}: {
  isOpen: boolean;
  onClose: () => void;
  rooms: Room[];
  onCreate: (payload: any) => Promise<void>;
}) {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState(rooms[0]?.id || '');
  const [checkInDate, setCheckInDate] = useState('2026-08-01');
  const [checkOutDate, setCheckOutDate] = useState('2026-08-05');
  const [guestsCount, setGuestsCount] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (rooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(rooms[0].id);
    }
  }, [rooms, selectedRoomId]);

  if (!isOpen) return null;

  const selectedRoom = rooms.find((r: Room) => r.id === selectedRoomId) || rooms[0];

  const calculateNights = () => {
    const d1 = new Date(checkInDate);
    const d2 = new Date(checkOutDate);
    const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24));
    return diff > 0 ? diff : 0;
  };

  const nights = calculateNights();
  const totalPrice = nights * (selectedRoom?.pricePerNight || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nights <= 0) {
      setErrorMsg('Check-out date must strictly occur after check-in date!');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await onCreate({
        guestName: clientName,
        guestEmail: clientEmail || `${clientName.toLowerCase().replace(/\s+/g, '.')}@guest.com`,
        roomId: selectedRoom?.id,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: Number(guestsCount),
        totalPrice,
        status: 'confirmed',
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to create reservation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl font-sans">
        <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
          <h3 className="font-bold text-base text-zinc-900">Create New Reservation</h3>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-zinc-700 block mb-1">Guest Full Name</label>
            <input
              type="text"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. Lord Alistair Vance"
              className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-zinc-400"
            />
          </div>

          <div>
            <label className="font-bold text-zinc-700 block mb-1">Guest Email</label>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="e.g. guest@royalmail.com"
              className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-zinc-400"
            />
          </div>

          <div>
            <label className="font-bold text-zinc-700 block mb-1">Select Room / Suite</label>
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 font-medium focus:outline-none"
            >
              {rooms.map((r: Room) => (
                <option key={r.id} value={r.id}>
                  Suite #{r.number} - {r.title} (${r.pricePerNight}/night)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-zinc-700 block mb-1">Check-In Date</label>
              <input
                type="date"
                required
                value={checkInDate}
                onChange={(e) => {
                  setCheckInDate(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-700 block mb-1">Check-Out Date</label>
              <input
                type="date"
                required
                value={checkOutDate}
                onChange={(e) => {
                  setCheckOutDate(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-lg flex justify-between items-center text-xs">
            <div>
              <p className="font-bold text-amber-900">Duration: {nights} Nights</p>
              <p className="text-amber-700 font-medium">Rate: ${selectedRoom?.pricePerNight || 0} / night</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">Total Price</span>
              <span className="text-lg font-bold text-amber-900">${totalPrice.toLocaleString()}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#18181B] text-white font-bold rounded-lg text-xs hover:bg-zinc-800 transition uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                <span>Creating Booking...</span>
              </>
            ) : (
              <span>Confirm Reservation</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function Admin() {
  const [activeSection, setActiveSection] = useState<NavSection>('OVERVIEW');
  const [searchQuery, setSearchQuery] = useState('');

  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [guests, setGuests] = useState<GuestProfile[]>([]);
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyRevenueData[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchAdminData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    setError(null);

    try {
      const [roomsRes, resesRes, usersRes, dashRes] = await Promise.all([
        fetch('/api/rooms'),
        fetch('/api/reservations'),
        fetch('/api/users'),
        fetch('/api/admin/dashboard'),
      ]);

      const [roomsData, resesData, usersData, dashData] = await Promise.all([
        roomsRes.ok ? roomsRes.json() : [],
        resesRes.ok ? resesRes.json() : [],
        usersRes.ok ? usersRes.json() : [],
        dashRes.ok ? dashRes.json() : null,
      ]);

      // 1. Map Rooms
      const mappedRooms: Room[] = (Array.isArray(roomsData) ? roomsData : []).map((r: any) => ({
        id: r._id,
        number: r.roomNumber || '100',
        title: r.roomTypeId?.name || `Suite #${r.roomNumber}`,
        type: r.roomTypeId?.name || 'Standard Room',
        floor: r.floor || 1,
        pricePerNight: r.roomTypeId?.basePrice || 150,
        maxGuests: r.roomTypeId?.capacity || 2,
        status: (r.status || 'available').toUpperCase() as RoomStatus,
        features: Array.isArray(r.roomTypeId?.amenities)
          ? r.roomTypeId.amenities.map((a: any) => (typeof a === 'string' ? a : a.name || 'Amenity'))
          : ['Free WiFi', 'Air Conditioning'],
      }));

      // 2. Map Reservations
      const mappedReservations: Reservation[] = (Array.isArray(resesData) ? resesData : []).map((res: any) => {
        const cIn = res.checkIn ? new Date(res.checkIn) : new Date();
        const cOut = res.checkOut ? new Date(res.checkOut) : new Date();
        const diffTime = Math.abs(cOut.getTime() - cIn.getTime());
        const nightsCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

        const clientName = res.guestName || res.userId?.name || 'Walk-In Guest';
        const clientEmail = res.guestEmail || res.userId?.email || 'guest@hotel.test';
        const roomNumber = res.roomId?.roomNumber || 'N/A';
        const roomTitle = res.roomId?.roomTypeId?.name || 'Deluxe Room';

        return {
          id: res._id,
          code: `VEL-${res._id.slice(-4).toUpperCase()}`,
          clientName,
          clientEmail,
          roomNumber,
          roomTitle,
          checkInDate: cIn.toISOString().split('T')[0],
          checkOutDate: cOut.toISOString().split('T')[0],
          nightsCount,
          guestsCount: res.guests || 1,
          grossValue: res.totalPrice || 0,
          status: (res.status || 'confirmed').toUpperCase() as ReservationStatus,
          createdAt: res.createdAt ? new Date(res.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          roomId: res.roomId?._id || res.roomId,
        };
      });

      // 3. Map Guests & Staff Users
      const rawUsers = Array.isArray(usersData) ? usersData : [];
      const mappedStaff: StaffUser[] = rawUsers
        .filter((u: any) => u.role !== 'guest')
        .map((u: any) => ({
          id: u._id,
          name: u.name || 'Staff User',
          email: u.email,
          role: (u.role || 'receptionist').toUpperCase() as StaffUser['role'],
          department: u.role === 'admin' ? 'Executive Management' : 'Front Desk',
          status: 'ACTIVE',
        }));

      // Calculate Guest Profiles from users & reservation history
      const guestMap = new Map<string, GuestProfile>();
      
      // Process registered guests
      rawUsers.forEach((u: any) => {
        if (u.role === 'guest' || !u.role) {
          guestMap.set(u.email, {
            id: u._id,
            name: u.name,
            email: u.email,
            phone: u.phone || 'N/A',
            tier: 'STANDARD',
            totalStays: 0,
            totalSpent: 0,
          });
        }
      });

      // Aggregate stay stats from reservations
      mappedReservations.forEach((res) => {
        const key = res.clientEmail;
        if (!guestMap.has(key)) {
          guestMap.set(key, {
            id: `guest-${res.id}`,
            name: res.clientName,
            email: res.clientEmail,
            phone: 'N/A',
            tier: 'STANDARD',
            totalStays: 0,
            totalSpent: 0,
          });
        }
        const g = guestMap.get(key)!;
        g.totalStays += 1;
        if (res.status !== 'CANCELLED') {
          g.totalSpent += res.grossValue;
        }

        if (g.totalSpent >= 10000) g.tier = 'ROYAL';
        else if (g.totalSpent >= 5000) g.tier = 'PLATINUM';
        else if (g.totalSpent >= 2000) g.tier = 'VIP';
        else g.tier = 'STANDARD';
      });

      setRooms(mappedRooms);
      setReservations(mappedReservations);
      setStaff(mappedStaff);
      setGuests(Array.from(guestMap.values()));

      if (dashData?.monthlyData) {
        setMonthlyData(dashData.monthlyData);
      }
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
      setError('Could not connect to backend database.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleUpdateRoomStatus = async (roomId: string, status: RoomStatus) => {
    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: status.toLowerCase() }),
      });
      if (!res.ok) throw new Error('Failed to update room status');
      setToastMessage(`Room status updated to ${status}`);
      await fetchAdminData();
    } catch (err: any) {
      setToastMessage(`Error: ${err.message}`);
    }
  };

  const handleUpdateReservationStatus = async (resId: string, status: ReservationStatus) => {
    try {
      const res = await fetch(`/api/reservations/${resId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: status.toLowerCase() }),
      });
      if (!res.ok) throw new Error('Failed to update reservation');
      setToastMessage(`Reservation status updated to ${status}`);
      await fetchAdminData();
    } catch (err: any) {
      setToastMessage(`Error: ${err.message}`);
    }
  };

  const handleDeleteReservation = async (resId: string) => {
    try {
      const res = await fetch(`/api/reservations/${resId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete reservation');
      setToastMessage('Reservation record deleted from database.');
      await fetchAdminData();
    } catch (err: any) {
      setToastMessage(`Error: ${err.message}`);
    }
  };

  const handleCreateReservation = async (payload: any) => {
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to create booking');
    }
    setToastMessage('Created new reservation in database!');
    await fetchAdminData();
  };

  return (
    <div className="flex min-h-screen bg-[#F4F4F5] text-zinc-900 font-sans antialiased">
      <Sidebar activeSection={activeSection} onSelectSection={setActiveSection} />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Navigation Bar */}
        <header className="bg-white border-b border-zinc-200 px-8 py-4 flex items-center justify-between gap-4 sticky top-0 z-10 shadow-xs">
          <div className="flex items-center gap-3 bg-zinc-100 px-3.5 py-2 rounded-lg border border-zinc-200 w-72">
            <Search className="w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rooms, guests, bookings..."
              className="bg-transparent text-xs text-zinc-800 focus:outline-none w-full"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Backend Connected (MongoDB)</span>
            </div>

            <button
              onClick={() => fetchAdminData(true)}
              disabled={isRefreshing}
              className="p-2 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition flex items-center gap-1.5 text-xs font-bold"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#D4AF37]' : ''}`} />
              <span className="hidden sm:inline">Sync Data</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-12">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-zinc-500 text-xs">
              <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
              <p className="font-semibold">Fetching Live Admin Dashboard Data from Backend...</p>
            </div>
          ) : error ? (
            <div className="m-8 p-6 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Backend Connection Error</span>
              </div>
              <p>{error}</p>
              <button
                onClick={() => fetchAdminData(true)}
                className="px-4 py-2 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition"
              >
                Retry Connection
              </button>
            </div>
          ) : (
            <>
              {activeSection === 'OVERVIEW' && (
                <OverviewModule
                  rooms={rooms}
                  reservations={reservations}
                  monthlyData={monthlyData}
                  onOpenNewReservation={() => setIsModalOpen(true)}
                  onNavigate={setActiveSection}
                />
              )}

              {activeSection === 'ROOMS' && (
                <RoomsModule
                  rooms={rooms}
                  onUpdateStatus={handleUpdateRoomStatus}
                  searchQuery={searchQuery}
                />
              )}

              {activeSection === 'RESERVATIONS' && (
                <ReservationsModule
                  reservations={reservations}
                  onUpdateStatus={handleUpdateReservationStatus}
                  onDelete={handleDeleteReservation}
                  onOpenNew={() => setIsModalOpen(true)}
                  searchQuery={searchQuery}
                />
              )}

              {activeSection === 'USERS' && (
                <UsersModule staff={staff} searchQuery={searchQuery} />
              )}
            </>
          )}
        </main>
      </div>

      <NewReservationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        rooms={rooms}
        onCreate={handleCreateReservation}
      />

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#18181B] text-white px-4 py-3 rounded-lg shadow-xl border border-zinc-700 flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default Admin;
