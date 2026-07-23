"use client";

import { useState } from "react";
import { Search, CheckCircle2, Loader2, LogIn } from "lucide-react";
import StatusBadge from "@/components/receptionist/StatusBadge";
import { getGuestName, getGuestPhone } from "@/lib/reservationDisplay";

type ReservationResult = {
  _id: string;
  status: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  userId?: { name?: string; phone?: string } | null;
  guestName?: string;
  guestPhone?: string;
  roomId?: { roomNumber?: string; floor?: number } | null;
};

export default function CheckInWorkflow() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ReservationResult[]>([]);
  const [selected, setSelected] = useState<ReservationResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setError(null);
    setSelected(null);
    setDone(false);

    try {
      const res = await fetch(
        `/api/receptionist/reservations?query=${encodeURIComponent(query.trim())}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Search failed");
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setSearching(false);
    }
  };

  const completeCheckIn = async () => {
    if (!selected) return;
    setConfirming(true);
    setError(null);
    try {
      const res = await fetch(`/api/receptionist/reservations/${selected._id}/check-in`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Check-in failed");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Check-in failed");
    } finally {
      setConfirming(false);
    }
  };

  if (done && selected) {
    return (
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-10 text-center max-w-lg mx-auto">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-zinc-900">Check-In Complete</h3>
        <p className="text-sm text-zinc-500 mt-2">
          {getGuestName(selected)} is now checked in to Room {selected.roomId?.roomNumber}.
        </p>
        <button
          onClick={() => {
            setSelected(null);
            setResults([]);
            setQuery("");
            setDone(false);
          }}
          className="mt-6 bg-[#18181B] text-white px-4 py-2.5 rounded-lg text-xs font-bold hover:bg-zinc-800 transition"
        >
          Check In Another Guest
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Search */}
      <form onSubmit={handleSearch} className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
        <h3 className="text-sm font-bold text-zinc-900 mb-3">Search Reservation</h3>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Guest name, reservation ID, phone, or room number"
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="bg-[#18181B] text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-zinc-800 transition disabled:opacity-40"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
          </button>
        </div>
        <p className="text-[11px] text-zinc-400 mt-2">
          No QR scanner connected — enter the reservation code or guest details manually.
        </p>
      </form>

      {error && (
        <p className="text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded">
          {error}
        </p>
      )}

      {/* Results */}
      {results.length > 0 && !selected && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm divide-y divide-zinc-100">
          {results.map((r) => {
            const eligible = ["pending", "confirmed"].includes(r.status);
            return (
              <button
                key={r._id}
                disabled={!eligible}
                onClick={() => setSelected(r)}
                className="w-full text-left p-4 flex items-center justify-between hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <div>
                  <p className="font-semibold text-sm text-zinc-800">{getGuestName(r)}</p>
                  <p className="text-xs text-zinc-500">
                    Room {r.roomId?.roomNumber ?? "—"} · {new Date(r.checkIn).toLocaleDateString()} –{" "}
                    {new Date(r.checkOut).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </button>
            );
          })}
        </div>
      )}
      {results.length === 0 && !searching && query && (
        <p className="text-xs text-zinc-400 text-center">No matching reservations found.</p>
      )}

      {/* Verification */}
      {selected && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-zinc-900">Verify & Confirm Check-In</h3>
          <div className="space-y-2 text-sm">
            <Row label="Guest" value={getGuestName(selected)} />
            <Row label="Phone" value={getGuestPhone(selected)} />
            <Row label="Room" value={selected.roomId?.roomNumber ?? "—"} />
            <Row
              label="Stay"
              value={`${new Date(selected.checkIn).toLocaleDateString()} – ${new Date(
                selected.checkOut
              ).toLocaleDateString()}`}
            />
            <Row label="Guests" value={String(selected.guests)} />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              disabled={confirming}
              onClick={completeCheckIn}
              className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-emerald-700 transition disabled:opacity-40"
            >
              <LogIn className="w-4 h-4" />
              {confirming ? "Checking In..." : "Complete Check-In"}
            </button>
            <button
              onClick={() => setSelected(null)}
              className="border border-zinc-300 text-zinc-700 px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-zinc-50 transition"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-zinc-500">{label}</span>
      <span className="font-medium text-zinc-800">{value}</span>
    </div>
  );
}
