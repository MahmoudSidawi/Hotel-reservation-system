import { listReservations } from "@/backend/controllers/reservationController";

export default async function ReservationsPage() {
  const reservations = await listReservations();

  return (
    <main className="container">
      <h1>Reservations</h1>
      {reservations.length === 0 && <p>No reservations yet.</p>}
      {reservations.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Guest</th>
              <th>Room</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => {
              const user = reservation.userId as unknown as { name?: string } | null;
              const room = reservation.roomId as unknown as { roomNumber?: string } | null;
              return (
                <tr key={String(reservation._id)}>
                  <td>{user?.name ?? "—"}</td>
                  <td>{room?.roomNumber ?? "—"}</td>
                  <td>{new Date(reservation.checkIn).toLocaleDateString()}</td>
                  <td>{new Date(reservation.checkOut).toLocaleDateString()}</td>
                  <td>
                    <span className="badge">{reservation.status}</span>
                  </td>
                  <td>${reservation.totalPrice}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </main>
  );
}
