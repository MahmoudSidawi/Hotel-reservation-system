import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { listReservationsByUser } from "@/backend/controllers/reservationController";
import { listRoomTypes } from "@/backend/controllers/roomTypeController";
import { listRoomImages } from "@/backend/controllers/roomImageController";
import CustomerDashboardClient from "@/components/customer/CustomerDashboardClient";

export const dynamic = "force-dynamic";

export default async function CustomerDashboardPage() {
  const session = await getCurrentUser();
  if (!session) {
    redirect("/login?callbackUrl=/Customer");
  }

  const [reservations, roomTypes, roomImages] = await Promise.all([
    listReservationsByUser(session.sub),
    listRoomTypes(),
    listRoomImages(),
  ]);

  // Serialize Mongoose/lean docs (Dates -> ISO strings) for the client component.
  const serialize = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

  return (
    <CustomerDashboardClient
      user={{ name: session.name, email: session.email }}
      reservations={serialize(reservations)}
      roomTypes={serialize(roomTypes).map((rt: { _id: string; name: string; description?: string; basePrice: number; capacity: number }) => ({
        _id: String(rt._id),
        name: rt.name,
        description: rt.description,
        basePrice: rt.basePrice,
        capacity: rt.capacity,
      }))}
      roomImages={serialize(roomImages).map((img: { roomTypeId: string; imageUrl: string; isPrimary?: boolean }) => ({
        roomTypeId: String(img.roomTypeId),
        imageUrl: img.imageUrl,
        isPrimary: img.isPrimary,
      }))}
    />
  );
}
