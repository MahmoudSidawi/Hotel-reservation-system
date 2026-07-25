import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { listReservationsByUser } from "@/backend/controllers/reservationController";
import CustomerReservationsClient from "@/components/customer/CustomerReservationsClient";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

export default async function ReservationsPage() {
  const session = await getCurrentUser();
  if (!session) {
    redirect("/login?callbackUrl=/reservations");
  }

  const rawReservations = await listReservationsByUser(session.sub);
  const initialReservations = JSON.parse(JSON.stringify(rawReservations));

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-[#1A1918] font-sans antialiased flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow max-w-6xl mx-auto w-full px-6 md:px-12 py-12">
        <CustomerReservationsClient
          initialReservations={initialReservations}
          currentUserId={session.sub}
          userName={session.name}
        />
      </main>

      <Footer />
    </div>
  );
}
