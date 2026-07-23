import { connectToDatabase } from "@/backend/config/db";
import Room from "@/backend/models/Room";
import Reservation from "@/backend/models/Reservation";
import {
  getTodaysArrivals,
  getTodaysDepartures,
  getCurrentGuests,
} from "@/backend/controllers/reservationController";

function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

export async function getDashboardData() {
  await connectToDatabase();
  const { start, end } = todayRange();

  const [
    arrivals,
    departures,
    currentGuests,
    roomsByStatus,
    walkInsToday,
    recentActivity,
  ] = await Promise.all([
    getTodaysArrivals(),
    getTodaysDepartures(),
    getCurrentGuests(),
    Room.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Reservation.countDocuments({ isWalkIn: true, createdAt: { $gte: start, $lt: end } }),
    Reservation.find().sort({ createdAt: -1 }).limit(10).populate("userId").populate("roomId").lean(),
  ]);

  const occupancy = { available: 0, reserved: 0, occupied: 0, maintenance: 0 };
  for (const entry of roomsByStatus as { _id: string; count: number }[]) {
    if (entry._id in occupancy) {
      occupancy[entry._id as keyof typeof occupancy] = entry.count;
    }
  }

  return {
    arrivals,
    departures,
    currentGuests,
    occupancy,
    quickStats: {
      totalArrivalsToday: arrivals.length,
      totalDeparturesToday: departures.length,
      walkInsToday,
      roomsAvailable: occupancy.available,
    },
    recentActivity,
  };
}
