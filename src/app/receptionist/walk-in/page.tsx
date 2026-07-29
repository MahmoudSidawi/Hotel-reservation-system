import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listRoomTypes } from "@/backend/controllers/roomTypeController";
import WalkInBookingForm from "@/components/receptionist/WalkInBookingForm";

function isoDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export default async function WalkInBookingPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const [{ mode }, roomTypes] = await Promise.all([searchParams, listRoomTypes()]);

  // "reservation" = a future booking; "walkin" (default) = a guest at the desk now.
  const isReservation = mode === "reservation";
  const heading = isReservation ? "New Reservation" : "New Walk-in Booking";
  const subtitle = isReservation
    ? "Book a future stay for a guest without requiring an account."
    : "Check in a guest arriving now without requiring an account.";
  const defaultCheckIn = isReservation ? isoDate(7) : isoDate(0);
  const defaultCheckOut = isReservation ? isoDate(10) : isoDate(1);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <Link
          href="/receptionist"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 px-3.5 py-2 rounded-lg shadow-sm hover:bg-zinc-50 transition mb-3"
        >
          <ArrowLeft className="w-4 h-4 text-zinc-500" />
          Back to Dashboard
        </Link>
        <h2 className="text-xl font-bold text-zinc-900">{heading}</h2>
        <p className="text-xs text-zinc-500">{subtitle}</p>
      </div>
      <WalkInBookingForm
        submitLabel={isReservation ? "Confirm Reservation" : "Confirm Booking"}
        defaultCheckIn={defaultCheckIn}
        defaultCheckOut={defaultCheckOut}
        roomTypes={roomTypes.map((rt) => ({
          _id: String(rt._id),
          name: rt.name,
          basePrice: rt.basePrice,
          capacity: rt.capacity,
        }))}
      />
    </div>
  );
}
