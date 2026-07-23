import Link from "next/link";
import {
  DoorOpen,
  LogIn as LogInIcon,
  LogOut as LogOutIcon,
  BedDouble,
  CalendarPlus,
  ClipboardList,
} from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { getDashboardData } from "@/backend/controllers/dashboardController";
import StatCard from "@/components/receptionist/StatCard";
import StatusBadge from "@/components/receptionist/StatusBadge";
import { getGuestName } from "@/lib/reservationDisplay";

export default async function ReceptionistDashboardPage() {
  const [user, data] = await Promise.all([getCurrentUser(), getDashboardData()]);
  const { arrivals, departures, currentGuests, occupancy, quickStats, recentActivity } = data;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Welcome back, {user?.name ?? "there"}</h2>
          <p className="text-xs text-zinc-500">Here&apos;s what&apos;s happening at the front desk today.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/receptionist/walk-in"
            className="flex items-center gap-2 bg-[#18181B] hover:bg-zinc-800 text-white px-4 py-2.5 rounded-lg text-xs font-bold transition shadow-sm"
          >
            <CalendarPlus className="w-4 h-4 text-[#D4AF37]" />
            New Walk-in Booking
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickAction href="/receptionist/walk-in" label="New Walk-in Booking" icon={DoorOpen} />
        <QuickAction href="/receptionist/check-in" label="Check In Guest" icon={LogInIcon} />
        <QuickAction href="/receptionist/check-out" label="Check Out Guest" icon={LogOutIcon} />
        <QuickAction href="/receptionist/reservations" label="View Reservations" icon={ClipboardList} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="Arrivals Today"
          value={quickStats.totalArrivalsToday}
          icon={LogInIcon}
          iconClassName="text-emerald-500"
        />
        <StatCard
          label="Departures Today"
          value={quickStats.totalDeparturesToday}
          icon={LogOutIcon}
          iconClassName="text-amber-500"
        />
        <StatCard
          label="Walk-ins Today"
          value={quickStats.walkInsToday}
          icon={DoorOpen}
          iconClassName="text-blue-500"
        />
        <StatCard
          label="Rooms Available"
          value={quickStats.roomsAvailable}
          icon={BedDouble}
          iconClassName="text-zinc-400"
        />
      </div>

      {/* Occupancy Summary */}
      <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
        <h3 className="text-base font-bold text-zinc-900 mb-4">Room Occupancy Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <OccupancyTile label="Available" value={occupancy.available} className="bg-emerald-50 text-emerald-700" />
          <OccupancyTile label="Reserved" value={occupancy.reserved} className="bg-blue-50 text-blue-700" />
          <OccupancyTile label="Occupied" value={occupancy.occupied} className="bg-amber-50 text-amber-700" />
          <OccupancyTile label="Maintenance" value={occupancy.maintenance} className="bg-zinc-100 text-zinc-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ReservationListCard title="Today's Arrivals" reservations={arrivals} emptyText="No arrivals scheduled today." />
        <ReservationListCard title="Today's Departures" reservations={departures} emptyText="No departures scheduled today." />
        <ReservationListCard title="Current In-House Guests" reservations={currentGuests} emptyText="No guests currently checked in." />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-6 pb-0">
          <h3 className="text-base font-bold text-zinc-900">Recent Reservation Activity</h3>
        </div>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-zinc-500 border-t border-zinc-200">
                <th className="px-6 py-3">Guest</th>
                <th className="px-6 py-3">Room</th>
                <th className="px-6 py-3">Check-in</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-6 text-center text-zinc-400 text-xs">
                    No reservation activity yet.
                  </td>
                </tr>
              )}
              {recentActivity.map((reservation) => {
                const room = reservation.roomId as unknown as { roomNumber?: string } | null;
                return (
                  <tr key={String(reservation._id)} className="border-t border-zinc-100">
                    <td className="px-6 py-3 font-medium text-zinc-800">{getGuestName(reservation)}</td>
                    <td className="px-6 py-3 text-zinc-600">{room?.roomNumber ?? "—"}</td>
                    <td className="px-6 py-3 text-zinc-600">
                      {new Date(reservation.checkIn).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={reservation.status ?? "pending"} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: typeof DoorOpen;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-2 bg-white border border-zinc-200 rounded-xl p-5 text-center shadow-sm hover:border-[#D4AF37] hover:shadow-md transition"
    >
      <Icon className="w-5 h-5 text-[#D4AF37]" />
      <span className="text-xs font-semibold text-zinc-700">{label}</span>
    </Link>
  );
}

function OccupancyTile({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className={`rounded-lg p-4 text-center ${className}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-[11px] font-semibold uppercase tracking-wider">{label}</p>
    </div>
  );
}

type ReservationListItem = {
  _id: unknown;
  status?: string;
  checkIn: Date | string;
  checkOut: Date | string;
  roomId?: unknown;
  userId?: { name?: string } | null;
  guestName?: string | null;
};

function ReservationListCard({
  title,
  reservations,
  emptyText,
}: {
  title: string;
  reservations: ReservationListItem[];
  emptyText: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
      <h3 className="text-sm font-bold text-zinc-900 mb-4">{title}</h3>
      {reservations.length === 0 ? (
        <p className="text-xs text-zinc-400">{emptyText}</p>
      ) : (
        <ul className="space-y-3">
          {reservations.slice(0, 6).map((reservation) => {
            const room = reservation.roomId as unknown as { roomNumber?: string } | null;
            return (
              <li key={String(reservation._id)} className="flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-zinc-800">{getGuestName(reservation)}</p>
                  <p className="text-zinc-500">Room {room?.roomNumber ?? "—"}</p>
                </div>
                <StatusBadge status={reservation.status ?? "pending"} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
