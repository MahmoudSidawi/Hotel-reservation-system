"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import {
  DoorOpen,
  LogIn as LogInIcon,
  LogOut as LogOutIcon,
  CalendarPlus,
  ClipboardList,
  Search,
  Zap,
  BedDouble,
  ArrowRight,
  Loader2,
} from "lucide-react";
import StatusBadge from "@/components/receptionist/StatusBadge";
import { getGuestName } from "@/lib/reservationDisplay";
import { useRealtimeReservations } from "@/lib/hooks/useRealtimeReservations";

type Reservation = {
  _id: string;
  status?: string;
  checkIn?: string;
  roomId?: { roomNumber?: string } | null;
  userId?: { name?: string; phone?: string; email?: string } | null;
  guestName?: string | null;
  guestPhone?: string | null;
  guestEmail?: string | null;
};

type DashboardData = {
  arrivals: Reservation[];
  departures: Reservation[];
  currentGuests: Reservation[];
  occupancy: {
    available: number;
    reserved: number;
    occupied: number;
    maintenance: number;
  };
  quickStats: {
    totalArrivalsToday: number;
    totalDeparturesToday: number;
    walkInsToday: number;
    roomsAvailable: number;
  };
  recentActivity: Reservation[];
};

const QUICK_ACTIONS = [
  { href: "/receptionist/walk-in?mode=reservation", label: "New Reservation", icon: CalendarPlus },
  { href: "/receptionist/walk-in?mode=walkin", label: "Walk-in Guest", icon: DoorOpen },
  { href: "/receptionist/check-in", label: "Check-in", icon: LogInIcon },
  { href: "/receptionist/check-out", label: "Check-out", icon: LogOutIcon },
  { href: "/receptionist/reservations?focus=search", label: "Search Guest", icon: Search },
  { href: "/receptionist/reservations", label: "View Reservations", icon: ClipboardList },
];

const ROOM_TILES = [
  { key: "available", label: "Available", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { key: "reserved", label: "Reserved", className: "bg-blue-50 text-blue-700 border-blue-200" },
  { key: "occupied", label: "Occupied", className: "bg-amber-50 text-amber-700 border-amber-200" },
  { key: "maintenance", label: "Maintenance", className: "bg-zinc-100 text-zinc-600 border-zinc-200" },
] as const;

export default function ReceptionistDashboardClient({
  initialData,
  userName,
}: {
  initialData: DashboardData;
  userName: string;
}) {
  const [data, setData] = useState<DashboardData>(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [checkingInId, setCheckingInId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/receptionist/dashboard");
      if (res.ok) setData(await res.json());
    } catch (err) {
      console.error("Failed to refresh receptionist dashboard", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const { isConnected } = useRealtimeReservations(() => {
    fetchDashboard();
  });

  const handleCheckIn = async (id: string) => {
    setCheckingInId(id);
    setActionError(null);
    try {
      const res = await fetch(`/api/receptionist/reservations/${id}/check-in`, { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Check-in failed");
      await fetchDashboard();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Check-in failed");
    } finally {
      setCheckingInId(null);
    }
  };

  const { arrivals, departures, currentGuests, occupancy } = data;
  const totalRooms =
    occupancy.available + occupancy.reserved + occupancy.occupied + occupancy.maintenance;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Welcome back, {userName}</h2>
          <p className="text-xs text-zinc-500 mt-0.5">{today}</p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full self-start ${
            isConnected
              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
              : "bg-amber-100 text-amber-800 border border-amber-300"
          }`}
        >
          <Zap className="w-3 h-3 fill-current animate-pulse" />
          {isConnected ? "Live" : "Connecting..."}
          {isRefreshing && <span className="font-normal normal-case text-zinc-500">· syncing</span>}
        </span>
      </div>

      {/* 2. Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {QUICK_ACTIONS.map(({ href, label, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="flex flex-col items-center justify-center gap-2 bg-white border border-zinc-200 rounded-xl px-3 py-4 text-center shadow-sm hover:border-[#D4AF37] hover:shadow-md transition"
          >
            <Icon className="w-5 h-5 text-[#D4AF37]" />
            <span className="text-[11px] font-semibold text-zinc-700 leading-tight">{label}</span>
          </Link>
        ))}
      </div>

      {/* 3. Room Status board */}
      <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
            <BedDouble className="w-4 h-4 text-zinc-400" />
            Room Status
          </h3>
          <span className="text-xs text-zinc-500">
            <span className="font-bold text-zinc-800">{totalRooms}</span> rooms total
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ROOM_TILES.map(({ key, label, className }) => (
            <div key={key} className={`rounded-lg p-4 text-center border ${className}`}>
              <p className="text-3xl font-bold leading-none">{occupancy[key]}</p>
              <p className="text-[11px] font-semibold uppercase tracking-wider mt-1.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {actionError && (
        <p className="text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
          {actionError}
        </p>
      )}

      {/* 4. Today's work */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Arrivals — with inline check-in */}
        <TodayCard title="Arrivals" count={arrivals.length} accent="text-emerald-600">
          {arrivals.length === 0 ? (
            <EmptyText>No arrivals scheduled today.</EmptyText>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {arrivals.map((r) => (
                <li key={r._id} className="flex items-center justify-between gap-2 py-2.5">
                  <Link href={`/receptionist/reservations/${r._id}`} className="min-w-0 group">
                    <p className="text-xs font-semibold text-zinc-800 truncate group-hover:text-[#A08149]">
                      {getGuestName(r)}
                    </p>
                    <p className="text-[11px] text-zinc-500">Room {r.roomId?.roomNumber ?? "—"}</p>
                  </Link>
                  <button
                    onClick={() => handleCheckIn(r._id)}
                    disabled={checkingInId === r._id}
                    className="shrink-0 inline-flex items-center gap-1 bg-[#18181B] hover:bg-zinc-800 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition disabled:opacity-50"
                  >
                    {checkingInId === r._id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <LogInIcon className="w-3 h-3 text-[#D4AF37]" />
                    )}
                    Check In
                  </button>
                </li>
              ))}
            </ul>
          )}
        </TodayCard>

        {/* Departures — link to check-out workflow */}
        <TodayCard title="Departures" count={departures.length} accent="text-amber-600">
          {departures.length === 0 ? (
            <EmptyText>No departures scheduled today.</EmptyText>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {departures.map((r) => (
                <li key={r._id} className="flex items-center justify-between gap-2 py-2.5">
                  <Link href={`/receptionist/reservations/${r._id}`} className="min-w-0 group">
                    <p className="text-xs font-semibold text-zinc-800 truncate group-hover:text-[#A08149]">
                      {getGuestName(r)}
                    </p>
                    <p className="text-[11px] text-zinc-500">Room {r.roomId?.roomNumber ?? "—"}</p>
                  </Link>
                  <Link
                    href="/receptionist/check-out"
                    className="shrink-0 inline-flex items-center gap-1 border border-zinc-300 hover:bg-zinc-50 text-zinc-700 text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition"
                  >
                    <LogOutIcon className="w-3 h-3 text-amber-600" />
                    Check Out
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </TodayCard>

        {/* In-house guests — read-only */}
        <TodayCard title="In-House Guests" count={currentGuests.length} accent="text-blue-600">
          {currentGuests.length === 0 ? (
            <EmptyText>No guests currently checked in.</EmptyText>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {currentGuests.map((r) => (
                <li key={r._id} className="flex items-center justify-between gap-2 py-2.5">
                  <Link href={`/receptionist/reservations/${r._id}`} className="min-w-0 group">
                    <p className="text-xs font-semibold text-zinc-800 truncate group-hover:text-[#A08149]">
                      {getGuestName(r)}
                    </p>
                    <p className="text-[11px] text-zinc-500">Room {r.roomId?.roomNumber ?? "—"}</p>
                  </Link>
                  <StatusBadge status={r.status ?? "checked_in"} />
                </li>
              ))}
            </ul>
          )}
        </TodayCard>
      </div>

      {/* Footer shortcut to full list */}
      <div className="flex justify-center">
        <Link
          href="/receptionist/reservations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition"
        >
          View all reservations
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

function TodayCard({
  title,
  count,
  accent,
  children,
}: {
  title: string;
  count: number;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-zinc-900">{title}</h3>
        <span className={`text-xl font-bold ${accent}`}>{count}</span>
      </div>
      {children}
    </div>
  );
}

function EmptyText({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-zinc-400 py-3">{children}</p>;
}
