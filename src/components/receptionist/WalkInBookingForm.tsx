"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

type RoomType = {
  _id: string;
  name: string;
  basePrice: number;
  capacity: number;
};

type AvailableRoom = {
  _id: string;
  roomNumber: string;
  floor: number;
  roomTypeId: RoomType | string;
};

function nightsBetween(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

export default function WalkInBookingForm({ roomTypes }: { roomTypes: RoomType[] }) {
  const router = useRouter();

  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestIdNumber, setGuestIdNumber] = useState("");
  const [guests, setGuests] = useState(1);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [roomTypeId, setRoomTypeId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  const [availableRooms, setAvailableRooms] = useState<AvailableRoom[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{ id: string; roomNumber: string } | null>(
    null
  );

  const nights = useMemo(() => nightsBetween(checkIn, checkOut), [checkIn, checkOut]);

  const selectedRoom = availableRooms.find((r) => r._id === roomId);
  const selectedRoomType =
    selectedRoom && typeof selectedRoom.roomTypeId !== "string" ? selectedRoom.roomTypeId : null;
  const basePrice = selectedRoomType?.basePrice ?? 0;
  const totalPrice = basePrice * nights;

  const loadAvailableRooms = useCallback(
    (signal: AbortSignal) => {
      setAvailabilityError(null);

      if (!checkIn || !checkOut || nights <= 0) {
        setAvailableRooms([]);
        setRoomId("");
        return;
      }

      setLoadingRooms(true);
      const params = new URLSearchParams({ checkIn, checkOut });
      if (roomTypeId) params.set("roomTypeId", roomTypeId);

      fetch(`/api/rooms/available?${params.toString()}`, { signal })
        .then(async (res) => {
          const data: AvailableRoom[] = await res.json();
          if (!res.ok) {
            throw new Error((data as unknown as { error?: string }).error ?? "Failed to load available rooms");
          }
          setAvailableRooms(data);
          setRoomId((current) => (data.some((room) => room._id === current) ? current : ""));
        })
        .catch((err) => {
          if (err.name !== "AbortError") setAvailabilityError(err.message);
        })
        .finally(() => setLoadingRooms(false));
    },
    [checkIn, checkOut, roomTypeId, nights]
  );

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => loadAvailableRooms(controller.signal), 0);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [loadAvailableRooms]);

  const canSubmit =
    guestName.trim() && guestPhone.trim() && guests > 0 && roomId && nights > 0 && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/receptionist/walk-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName,
          guestPhone,
          guestEmail: guestEmail || undefined,
          guestIdNumber: guestIdNumber || undefined,
          guests,
          checkIn,
          checkOut,
          roomId,
          totalPrice,
          specialRequests: specialRequests || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Booking failed");

      setConfirmation({ id: String(data._id), roomNumber: selectedRoom?.roomNumber ?? "" });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmation) {
    return (
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-10 text-center max-w-lg mx-auto">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-zinc-900">Booking Confirmed</h3>
        <p className="text-sm text-zinc-500 mt-2">
          {guestName} is booked into Room {confirmation.roomNumber}. Status: Confirmed.
        </p>
        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={() => router.push(`/receptionist/reservations/${confirmation.id}`)}
            className="bg-[#18181B] text-white px-4 py-2.5 rounded-lg text-xs font-bold hover:bg-zinc-800 transition"
          >
            View Reservation
          </button>
          <button
            onClick={() => window.location.reload()}
            className="border border-zinc-300 text-zinc-700 px-4 py-2.5 rounded-lg text-xs font-bold hover:bg-zinc-50 transition"
          >
            New Booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Guest Information */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-zinc-900">Guest Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name" required>
              <input
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="input"
                placeholder="Jane Doe"
              />
            </Field>
            <Field label="Phone Number" required>
              <input
                required
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="input"
                placeholder="+1 555 0100"
              />
            </Field>
            <Field label="Email (optional)">
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="input"
                placeholder="jane@example.com"
              />
            </Field>
            <Field label="National ID / Passport">
              <input
                value={guestIdNumber}
                onChange={(e) => setGuestIdNumber(e.target.value)}
                className="input"
                placeholder="P1234567"
              />
            </Field>
          </div>
        </div>

        {/* Stay Details */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-zinc-900">Stay Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Check-in Date" required>
              <input
                type="date"
                required
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Check-out Date" required>
              <input
                type="date"
                required
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Number of Guests" required>
              <input
                type="number"
                min={1}
                required
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="input"
              />
            </Field>
            <Field label="Room Type">
              <select
                value={roomTypeId}
                onChange={(e) => setRoomTypeId(e.target.value)}
                className="input"
              >
                <option value="">Any room type</option>
                {roomTypes.map((rt) => (
                  <option key={rt._id} value={rt._id}>
                    {rt.name} (${rt.basePrice}/night)
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Available Room" required>
            {loadingRooms ? (
              <p className="text-xs text-zinc-400 flex items-center gap-2 py-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Checking availability...
              </p>
            ) : availabilityError ? (
              <p className="text-xs text-red-600 py-2">{availabilityError}</p>
            ) : !checkIn || !checkOut || nights <= 0 ? (
              <p className="text-xs text-zinc-400 py-2">Select check-in and check-out dates first.</p>
            ) : availableRooms.length === 0 ? (
              <p className="text-xs text-zinc-400 py-2">No rooms available for these dates.</p>
            ) : (
              <select
                required
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="input"
              >
                <option value="">Select a room</option>
                {availableRooms.map((room) => {
                  const type = typeof room.roomTypeId !== "string" ? room.roomTypeId : null;
                  return (
                    <option key={room._id} value={room._id}>
                      Room {room.roomNumber} · Floor {room.floor}
                      {type ? ` · ${type.name}` : ""}
                    </option>
                  );
                })}
              </select>
            )}
          </Field>

          <Field label="Special Requests">
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              className="input min-h-20"
              placeholder="Late check-in, extra pillows, etc."
            />
          </Field>
        </div>
      </div>

      {/* Price Summary */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-4 sticky top-6">
          <h3 className="text-sm font-bold text-zinc-900">Price Summary</h3>
          <div className="space-y-2 text-sm text-zinc-600">
            <div className="flex justify-between">
              <span>Room rate</span>
              <span>${basePrice.toFixed(2)} / night</span>
            </div>
            <div className="flex justify-between">
              <span>Nights</span>
              <span>{nights}</span>
            </div>
          </div>
          <div className="border-t border-zinc-200 pt-3 flex justify-between text-base font-bold text-zinc-900">
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>

          {submitError && (
            <p className="text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full bg-[#18181B] text-white py-3 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "Booking..." : "Confirm Booking"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
    </label>
  );
}
