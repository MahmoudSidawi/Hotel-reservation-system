"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogIn, LogOut, XCircle, Pencil, Save, X } from "lucide-react";

type EditableFields = {
  checkIn: string;
  checkOut: string;
  guests: number;
  specialRequests: string;
};

export default function ReservationDetailActions({
  id,
  status,
  initialValues,
}: {
  id: string;
  status: string;
  initialValues: EditableFields;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState(initialValues);

  const canCheckIn = ["pending", "confirmed"].includes(status);
  const canCheckOut = status === "checked_in";
  const canCancel = ["pending", "confirmed"].includes(status);

  const runAction = async (action: "check-in" | "check-out" | "cancel") => {
    if (action === "cancel" && !window.confirm("Cancel this reservation?")) return;
    if (action === "check-out" && !window.confirm("Confirm check-out for this guest?")) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/receptionist/reservations/${id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: action === "check-out" ? JSON.stringify({}) : undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Action failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(false);
    }
  };

  const saveEdits = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {canCheckIn && (
          <button
            disabled={busy}
            onClick={() => runAction("check-in")}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-700 transition disabled:opacity-40"
          >
            <LogIn className="w-4 h-4" /> Check In
          </button>
        )}
        {canCheckOut && (
          <button
            disabled={busy}
            onClick={() => runAction("check-out")}
            className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-amber-700 transition disabled:opacity-40"
          >
            <LogOut className="w-4 h-4" /> Check Out
          </button>
        )}
        {canCancel && (
          <button
            disabled={busy}
            onClick={() => runAction("cancel")}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-700 transition disabled:opacity-40"
          >
            <XCircle className="w-4 h-4" /> Cancel
          </button>
        )}
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 border border-zinc-300 text-zinc-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-zinc-50 transition"
          >
            <Pencil className="w-4 h-4" /> Edit
          </button>
        )}
      </div>

      {editing && (
        <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Check-in
              </span>
              <input
                type="date"
                value={values.checkIn}
                onChange={(e) => setValues((v) => ({ ...v, checkIn: e.target.value }))}
                className="input"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Check-out
              </span>
              <input
                type="date"
                value={values.checkOut}
                onChange={(e) => setValues((v) => ({ ...v, checkOut: e.target.value }))}
                className="input"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Guests
              </span>
              <input
                type="number"
                min={1}
                value={values.guests}
                onChange={(e) => setValues((v) => ({ ...v, guests: Number(e.target.value) }))}
                className="input"
              />
            </label>
          </div>
          <label className="block space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Special Requests
            </span>
            <textarea
              value={values.specialRequests}
              onChange={(e) => setValues((v) => ({ ...v, specialRequests: e.target.value }))}
              className="input min-h-16"
            />
          </label>
          <div className="flex gap-2">
            <button
              disabled={busy}
              onClick={saveEdits}
              className="flex items-center gap-2 bg-[#18181B] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-zinc-800 transition disabled:opacity-40"
            >
              <Save className="w-4 h-4" /> Save
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setValues(initialValues);
              }}
              className="flex items-center gap-2 border border-zinc-300 text-zinc-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-zinc-50 transition"
            >
              <X className="w-4 h-4" /> Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
