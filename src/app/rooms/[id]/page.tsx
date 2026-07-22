import { notFound } from "next/navigation";
import { getRoomById } from "@/backend/controllers/roomController";
import { NotFoundError } from "@/lib/errors";

type RoomPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RoomDetailPage({ params }: RoomPageProps) {
  const { id } = await params;

  let room;
  try {
    room = await getRoomById(id);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  const type = room.roomTypeId as unknown as {
    name?: string;
    description?: string;
    basePrice?: number;
    capacity?: number;
  } | null;

  return (
    <main className="container">
      <h1>Room {room.roomNumber}</h1>
      <p>Floor {room.floor}</p>
      <p>
        Status: <span className="badge">{room.status}</span>
      </p>
      {type && (
        <div className="card">
          <h2>{type.name}</h2>
          <p>{type.description}</p>
          <p>
            ${type.basePrice} / night · Sleeps {type.capacity}
          </p>
        </div>
      )}
    </main>
  );
}
