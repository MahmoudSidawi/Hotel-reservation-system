import { searchReservations } from "@/backend/controllers/reservationController";
import ReservationTable from "@/components/receptionist/ReservationTable";

export default async function ReservationManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ focus?: string }>;
}) {
  const [{ focus }, reservations] = await Promise.all([searchParams, searchReservations({})]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-zinc-900">Reservations</h2>
        <p className="text-xs text-zinc-500">Search, filter, and manage all reservations.</p>
      </div>
      <ReservationTable
        initialReservations={JSON.parse(JSON.stringify(reservations))}
        autoFocusSearch={focus === "search"}
      />
    </div>
  );
}
