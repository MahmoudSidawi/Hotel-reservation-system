"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Eye, Pencil, XCircle, LogIn, LogOut, Loader2, Search } from "lucide-react";
import StatusBadge from "@/components/receptionist/StatusBadge";
import { getGuestName, getGuestPhone } from "@/lib/reservationDisplay";

type ReservationRow = {
  _id: string;
  status: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  userId?: { name?: string; phone?: string } | null;
  guestName?: string;
  guestPhone?: string;
  roomId?: { roomNumber?: string } | null;
};

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "checked_in", label: "Checked In" },
  { value: "checked_out", label: "Checked Out" },
  { value: "cancelled", label: "Cancelled" },
];

const SORT_OPTIONS = [
  { value: "checkIn", label: "Check-in Date" },
  { value: "checkOut", label: "Check-out Date" },
  { value: "createdAt", label: "Booking Date" },
];

export default function ReservationTable({
  initialReservations,
}: {
  initialReservations: ReservationRow[];
}) {
  const [reservations, setReservations] = useState(initialReservations);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("checkIn");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchReservations = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ sortBy, sortDir });
    if (query.trim()) params.set("query", query.trim());
    if (status) params.set("status", status);

    fetch(`/api/receptionist/reservations?${params.toString()}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load reservations");
        setReservations(data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [query, status, sortBy, sortDir]);

  useEffect(() => {
    const timeout = setTimeout(fetchReservations, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, status, sortBy, sortDir]);

  const runAction = async (id: string, action: "cancel" | "check-in" | "check-out") => {
    if (action === "cancel" && !window.confirm("Cancel this reservation?")) return;
    if (action === "check-out" && !window.confirm("Confirm check-out for this guest?")) return;

    setActionId(id);
    try {
      const res = await fetch(`/api/receptionist/reservations/${id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: action === "check-out" ? JSON.stringify({}) : undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Action failed");
      fetchReservations();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by guest name, reservation ID, phone, or room number..."
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-zinc-300 rounded-lg px-3 py-2.5 text-sm"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-zinc-300 rounded-lg px-3 py-2.5 text-sm"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Sort: {opt.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
          className="border border-zinc-300 rounded-lg px-3 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50"
        >
          {sortDir === "asc" ? "↑ Asc" : "↓ Desc"}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-700 bg-red-50 border-b border-red-200 px-4 py-2">{error}</p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-zinc-500 bg-zinc-50">
              <th className="px-4 py-3">Reservation ID</th>
              <th className="px-4 py-3">Guest</th>
              <th className="px-4 py-3">Room</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Guests</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-zinc-400 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                  Loading...
                </td>
              </tr>
            )}
            {!loading && reservations.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-zinc-400 text-xs">
                  No reservations match your search.
                </td>
              </tr>
            )}
            {!loading &&
              reservations.map((reservation) => {
                const room = reservation.roomId;
                const canCheckIn = ["pending", "confirmed"].includes(reservation.status);
                const canCheckOut = reservation.status === "checked_in";
                const canCancel = ["pending", "confirmed"].includes(reservation.status);
                const busy = actionId === reservation._id;

                return (
                  <tr key={reservation._id} className="border-t border-zinc-100 hover:bg-zinc-50/50">
                    <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                      {reservation._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-800">{getGuestName(reservation)}</p>
                      <p className="text-xs text-zinc-500">{getGuestPhone(reservation)}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{room?.roomNumber ?? "—"}</td>
                    <td className="px-4 py-3 text-zinc-600 text-xs">
                      {new Date(reservation.checkIn).toLocaleDateString()} –{" "}
                      {new Date(reservation.checkOut).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{reservation.guests}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={reservation.status} />
                    </td>
                    <td className="px-4 py-3 text-zinc-600">${reservation.totalPrice}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/receptionist/reservations/${reservation._id}`}
                          title="View"
                          className="p-1.5 rounded hover:bg-zinc-100 text-zinc-500"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/receptionist/reservations/${reservation._id}`}
                          title="Edit"
                          className="p-1.5 rounded hover:bg-zinc-100 text-zinc-500"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        {canCheckIn && (
                          <button
                            title="Check In"
                            disabled={busy}
                            onClick={() => runAction(reservation._id, "check-in")}
                            className="p-1.5 rounded hover:bg-emerald-50 text-emerald-600 disabled:opacity-40"
                          >
                            <LogIn className="w-4 h-4" />
                          </button>
                        )}
                        {canCheckOut && (
                          <button
                            title="Check Out"
                            disabled={busy}
                            onClick={() => runAction(reservation._id, "check-out")}
                            className="p-1.5 rounded hover:bg-amber-50 text-amber-600 disabled:opacity-40"
                          >
                            <LogOut className="w-4 h-4" />
                          </button>
                        )}
                        {canCancel && (
                          <button
                            title="Cancel"
                            disabled={busy}
                            onClick={() => runAction(reservation._id, "cancel")}
                            className="p-1.5 rounded hover:bg-red-50 text-red-600 disabled:opacity-40"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
