import Link from "next/link";
import { listRoomTypes } from "@/backend/controllers/roomTypeController";

export default async function HomePage() {
  const roomTypes = await listRoomTypes();

  return (
    <main className="container">
      <h1>Room Types</h1>
      {roomTypes.length === 0 && <p>No room types yet.</p>}
      {roomTypes.map((roomType) => (
        <div className="card" key={String(roomType._id)}>
          <h2>{roomType.name}</h2>
          <p>{roomType.description}</p>
          <p>
            ${roomType.basePrice} / night · Sleeps {roomType.capacity}
          </p>
          <Link href={`/rooms?roomTypeId=${String(roomType._id)}`}>View rooms</Link>
        </div>
      ))}
    </main>
  );
}
