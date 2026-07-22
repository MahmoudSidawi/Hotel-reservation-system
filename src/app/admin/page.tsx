'use client';

import React, { useState, useEffect } from 'react';
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
  Cell,
} from 'recharts';

// ==========================================
// TYPES
// ==========================================
export type NavSection =
  | 'OVERVIEW'
  | 'ROOMS'
  | 'RESERVATIONS'
  | 'CUSTOMERS'
  | 'USERS';

export type ReservationStatus = 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';

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
  role: 'ADMIN' | 'RECEPTIONIST' | 'MANAGER';
  department: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface MonthlyRevenueData {
  month: string;
  revenue: number;
  occupancy: number;
}

// ==========================================
// INITIAL MOCK DATA
// ==========================================
const INITIAL_ROOMS: Room[] = [
  { id: 'rm-101', number: '101', title: 'Deluxe Ocean Suite', type: 'Deluxe Suite', floor: 1, maxGuests: 2, pricePerNight: 280, status: 'AVAILABLE', features: ['Ocean View', 'King Bed', 'Free Wi-Fi', 'Balcony'] },
  { id: 'rm-102', number: '102', title: 'Executive Garden Villa', type: 'Executive Villa', floor: 1, maxGuests: 4, pricePerNight: 450, status: 'OCCUPIED', features: ['Private Pool', 'Garden View', '2 Bedrooms', 'Jacuzzi'] },
  { id: 'rm-103', number: '103', title: 'Royal Penthouse Suite', type: 'Penthouse', floor: 5, maxGuests: 6, pricePerNight: 850, status: 'RESERVED', features: ['Panoramic View', 'Private Elevator', 'Butler Service', 'Terrace'] },
  { id: 'rm-104', number: '104', title: 'Standard Twin Room', type: 'Standard Room', floor: 2, maxGuests: 2, pricePerNight: 160, status: 'AVAILABLE', features: ['Twin Beds', 'City View', 'Work Desk', 'Smart TV'] },
  { id: 'rm-105', number: '105', title: 'Presidential Lagoon Suite', type: 'Lagoon Suite', floor: 1, maxGuests: 4, pricePerNight: 620, status: 'MAINTENANCE', features: ['Direct Lagoon Access', 'Spa Bath', 'Breakfast Included'] },
  { id: 'rm-106', number: '106', title: 'Luxury Horizon Suite', type: 'Horizon Suite', floor: 3, maxGuests: 2, pricePerNight: 390, status: 'AVAILABLE', features: ['Sunset View', 'Mini Bar', 'Espresso Machine'] },
];

const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: 'res-1001',
    code: 'VEL-8921',
    clientName: 'Lord Alistair Vance',
    clientEmail: 'a.vance@royalmail.co.uk',
    roomNumber: '102',
    roomTitle: 'Executive Garden Villa',
    checkInDate: '2026-07-20',
    checkOutDate: '2026-07-25',
    nightsCount: 5,
    guestsCount: 2,
    grossValue: 2250,
    status: 'CHECKED_IN',
    createdAt: '2026-07-10',
  },
  {
    id: 'res-1002',
    code: 'VEL-8922',
    clientName: 'Sophia Montgomery',
    clientEmail: 'sophia.m@montgomery.com',
    roomNumber: '103',
    roomTitle: 'Royal Penthouse Suite',
    checkInDate: '2026-07-24',
    checkOutDate: '2026-07-28',
    nightsCount: 4,
    guestsCount: 3,
    grossValue: 3400,
    status: 'CONFIRMED',
    createdAt: '2026-07-15',
  },
  {
    id: 'res-1003',
    code: 'VEL-8923',
    clientName: 'David K. Sterling',
    clientEmail: 'david@sterlingholdings.io',
    roomNumber: '101',
    roomTitle: 'Deluxe Ocean Suite',
    checkInDate: '2026-07-18',
    checkOutDate: '2026-07-21',
    nightsCount: 3,
    guestsCount: 1,
    grossValue: 840,
    status: 'CHECKED_OUT',
    createdAt: '2026-07-08',
  },
  {
    id: 'res-1004',
    code: 'VEL-8924',
    clientName: 'Elena Rostova',
    clientEmail: 'elena.rostova@designstudio.fr',
    roomNumber: '106',
    roomTitle: 'Luxury Horizon Suite',
    checkInDate: '2026-08-01',
    checkOutDate: '2026-08-05',
    nightsCount: 4,
    guestsCount: 2,
    grossValue: 1560,
    status: 'CONFIRMED',
    createdAt: '2026-07-19',
  },
];

const INITIAL_GUESTS: GuestProfile[] = [
  { id: 'gst-1', name: 'Lord Alistair Vance', email: 'a.vance@royalmail.co.uk', phone: '+44 7911 123456', tier: 'ROYAL', totalStays: 4, totalSpent: 9200 },
  { id: 'gst-2', name: 'Sophia Montgomery', email: 'sophia.m@montgomery.com', phone: '+1 212 555 0198', tier: 'PLATINUM', totalStays: 2, totalSpent: 6800 },
  { id: 'gst-3', name: 'David K. Sterling', email: 'david@sterlingholdings.io', phone: '+1 415 555 0142', tier: 'VIP', totalStays: 6, totalSpent: 12400 },
  { id: 'gst-4', name: 'Elena Rostova', email: 'elena.rostova@designstudio.fr', phone: '+33 1 42 68 55 00', tier: 'STANDARD', totalStays: 1, totalSpent: 1560 },
];

const INITIAL_STAFF: StaffUser[] = [
  { id: 'stf-1', name: 'Mohammad Khaled', email: 'm.khaled@velorahotel.com', role: 'ADMIN', department: 'Executive Management', status: 'ACTIVE' },
  { id: 'stf-2', name: 'Manar Sayyah', email: 'manar@velorahotel.com', role: 'MANAGER', department: 'Operations', status: 'ACTIVE' },
  { id: 'stf-3', name: 'Mahmoud Sidawi', email: 'm.sidawi@velorahotel.com', role: 'RECEPTIONIST', department: 'Front Desk', status: 'ACTIVE' },
  { id: 'stf-4', name: 'Hidaya Al-Youssef', email: 'hidaya@velorahotel.com', role: 'RECEPTIONIST', department: 'Front Desk', status: 'ACTIVE' },
];

const REVENUE_DATA: MonthlyRevenueData[] = [
  { month: 'Jan', revenue: 24500, occupancy: 68 },
  { month: 'Feb', revenue: 28900, occupancy: 72 },
  { month: 'Mar', revenue: 34200, occupancy: 81 },
  { month: 'Apr', revenue: 31000, occupancy: 75 },
  { month: 'May', revenue: 42800, occupancy: 89 },
  { month: 'Jun', revenue: 49500, occupancy: 94 },
  { month: 'Jul', revenue: 52100, occupancy: 96 },
];

// ==========================================
// SUB-COMPONENTS
// ==========================================

function Sidebar({ activeSection, onSelectSection }: { activeSection: NavSection; onSelectSection: (s: NavSection) => void }) {
  const items: { label: NavSection; icon: LucideIcon }[] = [
    { label: 'OVERVIEW', icon: LayoutDashboard },
    { label: 'ROOMS', icon: BedDouble },
    { label: 'RESERVATIONS', icon: CalendarCheck },
    { label: 'CUSTOMERS', icon: Users },
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
            MK
          </div>
          <div>
            <p className="text-xs font-bold text-white">Mohammad Khaled</p>
            <p className="text-[10px] text-zinc-500">Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ==========================================
// VIEW MODULES
// ==========================================

function OverviewModule({ rooms, reservations, onOpenNewReservation, onNavigate }: any) {
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((r: Room) => r.status === 'OCCUPIED').length;
  const reservedRooms = rooms.filter((r: Room) => r.status === 'RESERVED').length;
  const occupancyRate = Math.round(((occupiedRooms + reservedRooms) / totalRooms) * 100);

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
          <p className="text-xs text-zinc-500">100% active capacity</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Occupancy Rate</span>
            <Percent className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-zinc-900">{occupancyRate}%</p>
          <p className="text-xs text-emerald-600 font-medium">↑ 12% vs last month</p>
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
          <p className="text-xs text-zinc-500">Financial performance for Velora Hotel</p>
        </div>
        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#71717A' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#71717A' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181B', borderRadius: '8px', border: 'none', color: '#FFF', fontSize: '12px' }}
                formatter={(val: any) => [`$${val.toLocaleString()}`, 'Revenue']}
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
              {reservations.slice(0, 4).map((res: Reservation) => (
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
        </div>
      </div>
    </div>
  );
}

function RoomsModule({ rooms, onUpdateStatus, searchQuery }: any) {
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
    </div>
  );
}

function ReservationsModule({ reservations, onUpdateStatus, onDelete, onOpenNew, searchQuery }: any) {
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
                    {res.status === 'CONFIRMED' && (
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
      </div>
    </div>
  );
}

function CustomersModule({ guests, searchQuery }: any) {
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((g: GuestProfile) => (
          <div key={g.id} className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center font-bold text-base text-[#D4AF37] shrink-0">
              {g.name.split(' ').map((n) => n[0]).join('')}
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
    </div>
  );
}

function UsersModule({ staff, searchQuery }: any) {
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
        <p className="text-xs text-zinc-500">User authorization levels and front-desk personnel</p>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
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
      </div>
    </div>
  );
}


// ==========================================
// MODAL FOR NEW RESERVATIONS
// ==========================================

function NewReservationModal({ isOpen, onClose, rooms, onCreate }: any) {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState(rooms[0]?.id || '');
  const [checkInDate, setCheckInDate] = useState('2026-08-01');
  const [checkOutDate, setCheckOutDate] = useState('2026-08-05');
  const [guestsCount, setGuestsCount] = useState(2);
  const [errorMsg, setErrorMsg] = useState('');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nights <= 0) {
      setErrorMsg('Check-out date must strictly occur after check-in date!');
      return;
    }

    onCreate({
      id: `res-${Date.now()}`,
      code: `VEL-${Math.floor(8000 + Math.random() * 1000)}`,
      clientName,
      clientEmail: clientEmail || `${clientName.toLowerCase().replace(/\s+/g, '.')}@guest.com`,
      roomNumber: selectedRoom.number,
      roomTitle: selectedRoom.title,
      checkInDate,
      checkOutDate,
      nightsCount: nights,
      guestsCount,
      grossValue: totalPrice,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString().split('T')[0],
    });

    onClose();
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
              <p className="text-amber-700 font-medium">Rate: ${selectedRoom?.pricePerNight} / night</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">Total Price</span>
              <span className="text-lg font-bold text-amber-900">${totalPrice.toLocaleString()}</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#18181B] text-white font-bold rounded-lg text-xs hover:bg-zinc-800 transition uppercase tracking-wider"
          >
            Confirm Reservation
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

  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [isLoaded, setIsLoaded] = useState(false);

  const [guests] = useState<GuestProfile[]>(INITIAL_GUESTS);
  const [staff] = useState<StaffUser[]>(INITIAL_STAFF);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load persisted state only after hydration
  useEffect(() => {
    try {
      const savedRooms = localStorage.getItem('velora_rooms_v3');
      if (savedRooms) {
        setRooms(JSON.parse(savedRooms));
      }
      const savedRes = localStorage.getItem('velora_reservations_v3');
      if (savedRes) {
        setReservations(JSON.parse(savedRes));
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('velora_rooms_v3', JSON.stringify(rooms));
    }
  }, [rooms, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('velora_reservations_v3', JSON.stringify(reservations));
    }
  }, [reservations, isLoaded]);

  const handleUpdateRoomStatus = (roomId: string, status: RoomStatus) => {
    setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, status } : r)));
    setToastMessage(`Room status updated to ${status}`);
  };

  const handleUpdateReservationStatus = (resId: string, status: Reservation['status']) => {
    setReservations((prev) => prev.map((r) => (r.id === resId ? { ...r, status } : r)));
    setToastMessage(`Reservation status updated to ${status}`);
  };

  const handleDeleteReservation = (resId: string) => {
    setReservations((prev) => prev.filter((r) => r.id !== resId));
    setToastMessage('Reservation record deleted.');
  };

  const handleCreateReservation = (newRes: Reservation) => {
    setReservations((prev) => [newRes, ...prev]);
    setToastMessage(`Created new booking ${newRes.code}`);
  };

  return (
    <div className="flex min-h-screen bg-[#F4F4F5] text-zinc-900 font-sans antialiased">
      <Sidebar activeSection={activeSection} onSelectSection={setActiveSection} />

      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 overflow-y-auto pb-12">
          {activeSection === 'OVERVIEW' && (
            <OverviewModule
              rooms={rooms}
              reservations={reservations}
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

          {activeSection === 'CUSTOMERS' && (
            <CustomersModule guests={guests} searchQuery={searchQuery} />
          )}

          {activeSection === 'USERS' && (
            <UsersModule staff={staff} searchQuery={searchQuery} />
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
        <div className="fixed bottom-6 right-6 z-50 bg-[#18181B] text-white px-4 py-3 rounded-lg shadow-xl border border-zinc-700 flex items-center gap-3 text-xs font-semibold">
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
