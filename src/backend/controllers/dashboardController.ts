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

export async function getAdminDashboardData() {
  await connectToDatabase();

  const [totalRoomsCount, roomsByStatus, totalReservations, allReservations] =
    await Promise.all([
      Room.countDocuments(),
      Room.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Reservation.countDocuments(),
      Reservation.find().sort({ createdAt: -1 }).populate("userId").populate({ path: "roomId", populate: { path: "roomTypeId" } }).lean(),
    ]);

  const occupancy = { available: 0, reserved: 0, occupied: 0, maintenance: 0 };
  for (const entry of roomsByStatus as { _id: string; count: number }[]) {
    if (entry._id in occupancy) {
      occupancy[entry._id as keyof typeof occupancy] = entry.count;
    }
  }

  // Monthly revenue aggregation
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonthIdx = new Date().getMonth();
  const monthlyRevenueMap = new Map<string, { revenue: number; count: number }>();

  // Pre-fill last 7 months
  for (let i = 6; i >= 0; i--) {
    const idx = (currentMonthIdx - i + 12) % 12;
    monthlyRevenueMap.set(monthNames[idx], { revenue: 0, count: 0 });
  }

  let totalRevenue = 0;
  let activeCheckIns = 0;

  for (const res of allReservations) {
    if (res.status === "checked_in") activeCheckIns++;
    if (res.status !== "cancelled" && res.totalPrice) {
      totalRevenue += res.totalPrice;
      const resDate = new Date(res.checkIn || (res as unknown as { createdAt: Date }).createdAt);
      const mName = monthNames[resDate.getMonth()];
      if (monthlyRevenueMap.has(mName)) {
        const item = monthlyRevenueMap.get(mName)!;
        item.revenue += res.totalPrice;
        item.count += 1;
      }
    }
  }

  const monthlyData = Array.from(monthlyRevenueMap.entries()).map(([month, data]) => ({
    month,
    revenue: data.revenue,
    occupancy: totalRoomsCount > 0 ? Math.min(100, Math.round((data.count / (totalRoomsCount * 30)) * 100)) : 0,
  }));

  const occupiedOrReserved = occupancy.occupied + occupancy.reserved;
  const occupancyRate = totalRoomsCount > 0 ? Math.round((occupiedOrReserved / totalRoomsCount) * 100) : 0;

  return {
    totalRooms: totalRoomsCount,
    occupancyRate,
    activeCheckIns,
    totalRevenue,
    occupancy,
    monthlyData,
    recentReservations: allReservations.slice(0, 10),
  };
}

