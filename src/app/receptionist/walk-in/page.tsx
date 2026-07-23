import { listRoomTypes } from "@/backend/controllers/roomTypeController";
import WalkInBookingForm from "@/components/receptionist/WalkInBookingForm";

export default async function WalkInBookingPage() {
  const roomTypes = await listRoomTypes();

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-zinc-900">New Walk-in Booking</h2>
        <p className="text-xs text-zinc-500">
          Create a reservation for a guest without requiring an account.
        </p>
      </div>
      <WalkInBookingForm
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
