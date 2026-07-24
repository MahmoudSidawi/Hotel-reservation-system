import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { listReservationsByUser } from "@/backend/controllers/reservationController";
import StatusBadge from "@/components/receptionist/StatusBadge";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

export default async function ReservationsPage() {
  const session = await getCurrentUser();
  if (!session) {
    redirect("/login?callbackUrl=/reservations");
  }

  const reservations = await listReservationsByUser(session.sub);

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-[#1A1918] font-sans antialiased flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow max-w-5xl mx-auto w-full px-6 md:px-12 py-16">
        <div className="mb-10 space-y-2">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#A08149] font-semibold block">
            WELCOME BACK, {session.name.toUpperCase()}
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-normal tracking-tight">My Reservations</h1>
        </div>

        {reservations.length === 0 ? (
          <div className="bg-white border border-[#ECE7DF] rounded-lg p-12 text-center space-y-4">
            <p className="text-sm text-[#736F68]">You don&apos;t have any reservations yet.</p>
            <Link
              href="/rooms"
              className="inline-block bg-[#1A1918] hover:bg-[#2C2A29] text-white text-xs font-bold uppercase tracking-[0.18em] px-6 py-3 rounded transition-colors"
            >
              Browse Our Rooms
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-[#ECE7DF] rounded-lg overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#ECE7DF] text-left text-[10px] uppercase tracking-wider text-[#8C8880]">
                  <th className="px-6 py-3 font-bold">Room</th>
                  <th className="px-6 py-3 font-bold">Check-in</th>
                  <th className="px-6 py-3 font-bold">Check-out</th>
                  <th className="px-6 py-3 font-bold">Guests</th>
                  <th className="px-6 py-3 font-bold">Status</th>
                  <th className="px-6 py-3 font-bold text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation) => {
                  const room = reservation.roomId as unknown as {
                    roomNumber?: string;
                    roomTypeId?: { name?: string } | null;
                  } | null;
                  return (
                    <tr key={String(reservation._id)} className="border-b border-[#F2EEE8] last:border-0">
                      <td className="px-6 py-4">
                        <div className="font-medium text-[#1A1918]">{room?.roomTypeId?.name ?? "—"}</div>
                        {room?.roomNumber && (
                          <div className="text-xs text-[#8C8880]">Room {room.roomNumber}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-[#5C5954]">
                        {new Date(reservation.checkIn).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-[#5C5954]">
                        {new Date(reservation.checkOut).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-[#5C5954]">{reservation.guests}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={reservation.status ?? "pending"} />
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-[#1A1918]">
                        ${reservation.totalPrice}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
