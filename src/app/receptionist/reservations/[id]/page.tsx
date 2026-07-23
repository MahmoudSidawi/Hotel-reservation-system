import { notFound } from "next/navigation";
import { getReservationById } from "@/backend/controllers/reservationController";
import { getPaymentByReservationId } from "@/backend/controllers/paymentController";
import { NotFoundError } from "@/lib/errors";
import StatusBadge from "@/components/receptionist/StatusBadge";
import ReservationDetailActions from "@/components/receptionist/ReservationDetailActions";
import { getGuestName, getGuestPhone, getGuestEmail } from "@/lib/reservationDisplay";

const TIMELINE_STEPS = ["pending", "confirmed", "checked_in", "checked_out"];

function toDateInputValue(date: Date | string) {
  return new Date(date).toISOString().slice(0, 10);
}

export default async function ReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let reservation;
  try {
    reservation = await getReservationById(id);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  const payment = await getPaymentByReservationId(id);
  const room = reservation.roomId as unknown as { roomNumber?: string; floor?: number } | null;

  const nights = Math.max(
    1,
    Math.round(
      (new Date(reservation.checkOut).getTime() - new Date(reservation.checkIn).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  const currentStepIndex = TIMELINE_STEPS.indexOf(reservation.status ?? "pending");
  const isCancelled = reservation.status === "cancelled" || reservation.status === "no_show";

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">
            Reservation {String(reservation._id).slice(-8).toUpperCase()}
          </h2>
          <p className="text-xs text-zinc-500">Created {new Date(reservation.createdAt as Date).toLocaleString()}</p>
        </div>
        <StatusBadge status={reservation.status ?? "pending"} />
      </div>

      {/* Status Timeline */}
      {!isCancelled && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
          <div className="flex items-center">
            {TIMELINE_STEPS.map((step, i) => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    i <= currentStepIndex
                      ? "bg-[#D4AF37] text-white"
                      : "bg-zinc-100 text-zinc-400"
                  }`}
                >
                  {i + 1}
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 ml-2 mr-4 capitalize">
                  {step.replace("_", " ")}
                </span>
                {i < TIMELINE_STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mr-4 ${
                      i < currentStepIndex ? "bg-[#D4AF37]" : "bg-zinc-100"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Guest Details */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-3">
          <h3 className="text-sm font-bold text-zinc-900">Guest Details</h3>
          <DetailRow label="Name" value={getGuestName(reservation)} />
          <DetailRow label="Phone" value={getGuestPhone(reservation)} />
          <DetailRow label="Email" value={getGuestEmail(reservation)} />
          <DetailRow label="Booking Type" value={reservation.isWalkIn ? "Walk-in" : "Online"} />
        </div>

        {/* Room & Stay */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-3">
          <h3 className="text-sm font-bold text-zinc-900">Assigned Room & Stay</h3>
          <DetailRow label="Room" value={room?.roomNumber ?? "—"} />
          <DetailRow label="Floor" value={room?.floor?.toString() ?? "—"} />
          <DetailRow
            label="Check-in"
            value={new Date(reservation.checkIn).toLocaleDateString()}
          />
          <DetailRow
            label="Check-out"
            value={new Date(reservation.checkOut).toLocaleDateString()}
          />
          <DetailRow label="Nights" value={String(nights)} />
          <DetailRow label="Guests" value={String(reservation.guests)} />
        </div>

        {/* Booking Notes */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-3">
          <h3 className="text-sm font-bold text-zinc-900">Booking Notes</h3>
          <p className="text-sm text-zinc-600">
            {reservation.specialRequests || "No special requests."}
          </p>
        </div>

        {/* Payment Status */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-3">
          <h3 className="text-sm font-bold text-zinc-900">Payment</h3>
          <DetailRow label="Total Price" value={`$${reservation.totalPrice}`} />
          <DetailRow
            label="Payment Status"
            value={payment ? payment.status ?? "pending" : "No payment recorded"}
          />
          {payment && <DetailRow label="Method" value={payment.method ?? "—"} />}
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
        <h3 className="text-sm font-bold text-zinc-900 mb-4">Actions</h3>
        <ReservationDetailActions
          id={String(reservation._id)}
          status={reservation.status ?? "pending"}
          initialValues={{
            checkIn: toDateInputValue(reservation.checkIn),
            checkOut: toDateInputValue(reservation.checkOut),
            guests: reservation.guests,
            specialRequests: reservation.specialRequests ?? "",
          }}
        />
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className="font-medium text-zinc-800">{value}</span>
    </div>
  );
}
