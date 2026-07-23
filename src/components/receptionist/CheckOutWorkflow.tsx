"use client";

import { useState } from "react";
import { Search, CheckCircle2, Loader2, LogOut } from "lucide-react";
import { getGuestName, getGuestPhone } from "@/lib/reservationDisplay";

type ReservationResult = {
  _id: string;
  status: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  userId?: { name?: string; phone?: string } | null;
  guestName?: string;
  guestPhone?: string;
  roomId?: { roomNumber?: string; floor?: number } | null;
};

function nightsBetween(checkIn: string, checkOut: string): number {
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
}

export default function CheckOutWorkflow() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ReservationResult[]>([]);
  const [selected, setSelected] = useState<ReservationResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);
  const [additionalFees, setAdditionalFees] = useState(0);
  const [notes, setNotes] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setError(null);
    setSelected(null);
    setDone(false);

    try {
      const res = await fetch(
        `/api/receptionist/reservations?query=${encodeURIComponent(query.trim())}&status=checked_in`
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

  const completeCheckOut = async () => {
    if (!selected) return;
    setConfirming(true);
    setError(null);
    try {
      const res = await fetch(`/api/receptionist/reservations/${selected._id}/check-out`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ additionalFees: additionalFees || undefined, notes: notes || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Check-out failed");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Check-out failed");
    } finally {
      setConfirming(false);
    }
  };

  if (done && selected) {
    return (
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-10 text-center max-w-lg mx-auto">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-zinc-900">Check-Out Complete</h3>
        <p className="text-sm text-zinc-500 mt-2">
          {getGuestName(selected)} has checked out of Room {selected.roomId?.roomNumber}. The room is now available.
        </p>
        <button
          onClick={() => {
            setSelected(null);
            setResults([]);
            setQuery("");
            setDone(false);
            setAdditionalFees(0);
            setNotes("");
          }}
          className="mt-6 bg-[#18181B] text-white px-4 py-2.5 rounded-lg text-xs font-bold hover:bg-zinc-800 transition"
        >
          Check Out Another Guest
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Search */}
      <form onSubmit={handleSearch} className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
        <h3 className="text-sm font-bold text-zinc-900 mb-3">Search Current Guest</h3>
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
          Only guests currently checked in will appear here.
        </p>
      </form>

      {error && (
        <p className="text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded">
          {error}
        </p>
      )}

      {results.length > 0 && !selected && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm divide-y divide-zinc-100">
          {results.map((r) => (
            <button
              key={r._id}
              onClick={() => setSelected(r)}
              className="w-full text-left p-4 flex items-center justify-between hover:bg-zinc-50 transition"
            >
              <div>
                <p className="font-semibold text-sm text-zinc-800">{getGuestName(r)}</p>
                <p className="text-xs text-zinc-500">
                  Room {r.roomId?.roomNumber ?? "—"} · Since {new Date(r.checkIn).toLocaleDateString()}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
      {results.length === 0 && !searching && query && (
        <p className="text-xs text-zinc-400 text-center">No checked-in guests match your search.</p>
      )}

      {/* Stay Summary + Charges */}
      {selected && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-zinc-900">Stay Summary</h3>
          <div className="space-y-2 text-sm">
            <Row label="Guest" value={getGuestName(selected)} />
            <Row label="Phone" value={getGuestPhone(selected)} />
            <Row label="Room" value={selected.roomId?.roomNumber ?? "—"} />
            <Row
              label="Stay"
              value={`${new Date(selected.checkIn).toLocaleDateString()} – ${new Date(
                selected.checkOut
              ).toLocaleDateString()} (${nightsBetween(selected.checkIn, selected.checkOut)} nights)`}
            />
            <Row label="Room Charges" value={`$${selected.totalPrice.toFixed(2)}`} />
          </div>

          <label className="block space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Additional Fees (optional)
            </span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={additionalFees || ""}
              onChange={(e) => setAdditionalFees(Number(e.target.value) || 0)}
              className="input"
              placeholder="0.00"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Notes
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input min-h-16"
              placeholder="Minibar, damages, late checkout fee, etc."
            />
          </label>

          <div className="border-t border-zinc-200 pt-3 flex justify-between text-base font-bold text-zinc-900">
            <span>Total Due</span>
            <span>${(selected.totalPrice + additionalFees).toFixed(2)}</span>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              disabled={confirming}
              onClick={completeCheckOut}
              className="flex items-center gap-2 bg-amber-600 text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-amber-700 transition disabled:opacity-40"
            >
              <LogOut className="w-4 h-4" />
              {confirming ? "Checking Out..." : "Confirm Check-Out"}
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
