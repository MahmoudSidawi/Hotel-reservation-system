import { connectToDatabase } from "@/backend/config/db";
import { User, RoomType, Room, Reservation, Payment, Amenity } from "@/backend/models";

export default async function AdminPage() {
  await connectToDatabase();

  const [users, roomTypes, rooms, reservations, payments, amenities] = await Promise.all([
    User.countDocuments(),
    RoomType.countDocuments(),
    Room.countDocuments(),
    Reservation.countDocuments(),
    Payment.countDocuments(),
    Amenity.countDocuments(),
  ]);

  const stats = [
    { label: "Users", value: users },
    { label: "Room Types", value: roomTypes },
    { label: "Rooms", value: rooms },
    { label: "Reservations", value: reservations },
    { label: "Payments", value: payments },
    { label: "Amenities", value: amenities },
  ];

  return (
    <main className="container">
      <h1>Admin</h1>
      {stats.map((stat) => (
        <div className="card" key={stat.label}>
          <strong>{stat.label}:</strong> {stat.value}
        </div>
      ))}
    </main>
  );
}
