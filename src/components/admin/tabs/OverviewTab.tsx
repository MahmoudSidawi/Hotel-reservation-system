'use client';

import React, { useState, useEffect } from 'react';
import {
  BedDouble, CalendarCheck, UserCheck, DollarSign, Percent,
  TrendingUp, Users, Wrench, Sparkles, AlertCircle, RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, LineChart, Line, Legend,
} from 'recharts';

type Summary = {
  totalReservations: number;
  activeReservations: number;
  todayCheckIns: number;
  todayCheckOuts: number;
  totalRooms: number;
  roomStatus: Record<string, number>;
  totalRevenue: number;
  totalGuests: number;
  newGuests30d: number;
  openMaintenance: number;
  cancellationRate: number;
  avgStayDuration: number;
};

type MonthlyRevenue = { month: string; revenue: number; count: number };

const GOLD = '#D4AF37';
const EMERALD = '#059669';

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  color = 'zinc',
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
  color?: 'gold' | 'emerald' | 'rose' | 'blue' | 'zinc';
}) {
  const colorMap = {
    gold:    { bg: 'bg-amber-50',   border: 'border-amber-200', icon: 'text-amber-500'  },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-600' },
    rose:    { bg: 'bg-rose-50',    border: 'border-rose-200', icon: 'text-rose-500'    },
    blue:    { bg: 'bg-blue-50',    border: 'border-blue-200', icon: 'text-blue-500'    },
    zinc:    { bg: 'bg-white',      border: 'border-zinc-200', icon: 'text-zinc-500'    },
  };
  const c = colorMap[color];
  return (
    <div className={`${c.bg} border ${c.border} rounded-xl p-5 space-y-3 shadow-sm`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</span>
        <Icon className={`w-5 h-5 ${c.icon}`} />
      </div>
      <p className="text-2xl font-bold text-zinc-900">{value}</p>
      {sub && <p className="text-[11px] text-zinc-500">{sub}</p>}
    </div>
  );
}

export default function OverviewTab() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [monthly, setMonthly] = useState<MonthlyRevenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const load = async () => {
    setLoading(true);
    try {
      const [sumRes, revRes] = await Promise.all([
        fetch('/api/admin/reports?type=summary'),
        fetch('/api/admin/reports?type=revenue&months=7'),
      ]);
      if (sumRes.ok) setSummary(await sumRes.json());
      if (revRes.ok) {
        const d = await revRes.json();
        setMonthly(d.data ?? []);
      }
      setLastRefresh(new Date());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const occupancyRate = summary && summary.totalRooms > 0
    ? Math.round(((summary.roomStatus['occupied'] ?? 0) + (summary.roomStatus['reserved'] ?? 0)) / summary.totalRooms * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-400 gap-2">
        <RefreshCw className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading dashboard data…</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Executive Overview</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Live operational metrics — last refreshed {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 border border-zinc-200 hover:bg-zinc-50 px-3 py-1.5 rounded-lg transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={CalendarCheck}  label="Total Reservations" value={summary?.totalReservations ?? 0}  color="zinc" />
        <KpiCard icon={UserCheck}      label="Active Reservations" value={summary?.activeReservations ?? 0} color="emerald" />
        <KpiCard icon={TrendingUp}     label="Today's Check-ins"   value={summary?.todayCheckIns ?? 0}     color="blue" />
        <KpiCard icon={TrendingUp}     label="Today's Check-outs"  value={summary?.todayCheckOuts ?? 0}    color="zinc" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Percent}    label="Occupancy Rate"    value={`${occupancyRate}%`}                            color="gold" />
        <KpiCard icon={DollarSign} label="Total Revenue"     value={`$${(summary?.totalRevenue ?? 0).toLocaleString()}`} color="emerald" sub="Completed stays only" />
        <KpiCard icon={BedDouble}  label="Available Rooms"   value={summary?.roomStatus['available'] ?? 0}          color="zinc" />
        <KpiCard icon={BedDouble}  label="Rooms Occupied"    value={summary?.roomStatus['occupied'] ?? 0}           color="blue" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Wrench}    label="Open Maintenance"  value={summary?.openMaintenance ?? 0}  color={summary?.openMaintenance ? 'rose' : 'zinc'} />
        <KpiCard icon={Sparkles}  label="Rooms Maintenance" value={summary?.roomStatus['maintenance'] ?? 0} color="zinc" />
        <KpiCard icon={Users}     label="New Guests (30d)"  value={summary?.newGuests30d ?? 0}     color="emerald" />
        <KpiCard icon={AlertCircle} label="Cancellation Rate" value={`${summary?.cancellationRate ?? 0}%`} color={summary?.cancellationRate && summary.cancellationRate > 20 ? 'rose' : 'zinc'} />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="text-base font-bold text-zinc-900">Monthly Revenue</h3>
          <p className="text-xs text-zinc-500">Realized revenue from completed stays (last 7 months)</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly} margin={{ top: 4, right: 16, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#71717A' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#71717A' }} tickLine={false} axisLine={false}
                tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              />
              <Tooltip
                contentStyle={{ background: '#18181B', border: 'none', borderRadius: 8, fontSize: 12, color: '#fff' }}
                formatter={(value: any) => [`$${Number(value ?? 0).toLocaleString()}`, 'Revenue']}
              />
              <Bar dataKey="revenue" fill={GOLD} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Room Status Breakdown */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-base font-bold text-zinc-900 mb-4">Room Status Breakdown</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { key: 'available',     label: 'Available',     color: 'bg-emerald-100 text-emerald-800' },
            { key: 'reserved',      label: 'Reserved',      color: 'bg-amber-100 text-amber-800'     },
            { key: 'occupied',      label: 'Occupied',      color: 'bg-blue-100 text-blue-800'       },
            { key: 'needs_cleaning',label: 'Needs Clean',   color: 'bg-orange-100 text-orange-800'   },
            { key: 'cleaning',      label: 'Cleaning',      color: 'bg-purple-100 text-purple-800'   },
            { key: 'maintenance',   label: 'Maintenance',   color: 'bg-rose-100 text-rose-800'       },
            { key: 'out_of_service',label: 'Out of Service',color: 'bg-zinc-100 text-zinc-600'       },
          ].map(({ key, label, color }) => (
            <div key={key} className={`${color} rounded-lg p-3 text-center`}>
              <p className="text-2xl font-bold">{summary?.roomStatus[key] ?? 0}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider mt-1 opacity-80">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm text-center">
          <p className="text-3xl font-bold text-zinc-900">{summary?.avgStayDuration ?? 0}</p>
          <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider font-semibold">Avg Stay (nights)</p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm text-center">
          <p className="text-3xl font-bold text-zinc-900">{summary?.totalGuests ?? 0}</p>
          <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider font-semibold">Registered Guests</p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm text-center">
          <p className="text-3xl font-bold text-zinc-900">{summary?.totalRooms ?? 0}</p>
          <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider font-semibold">Total Rooms</p>
        </div>
      </div>
    </div>
  );
}
