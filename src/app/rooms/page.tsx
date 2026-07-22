import Link from "next/link";
import { listRooms } from "@/backend/controllers/roomController";

type RoomsPageProps = {
  searchParams: Promise<{ roomTypeId?: string }>;
};

export default async function RoomsPage({ searchParams }: RoomsPageProps) {
  const { roomTypeId } = await searchParams;
  const rooms = await listRooms();
  const filtered = roomTypeId
    ? rooms.filter((room) => {
        const type = room.roomTypeId as unknown as { _id: unknown } | null;
        return type && String(type._id) === roomTypeId;
      })
    : rooms;

  return (
    <main className="container">
      <h1>Rooms</h1>
      {filtered.length === 0 && <p>No rooms found.</p>}
      {filtered.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Room #</th>
              <th>Type</th>
              <th>Floor</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((room) => {
              const type = room.roomTypeId as unknown as { name?: string } | null;
              return (
                <tr key={String(room._id)}>
                  <td>{room.roomNumber}</td>
                  <td>{type?.name ?? "—"}</td>
                  <td>{room.floor}</td>
                  <td>
                    <span className="badge">{room.status}</span>
                  </td>
                  <td>
                    <Link href={`/rooms/${String(room._id)}`}>Details</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </main>
  );
}
