import { connectToDatabase } from "@/backend/config/db";
import Room from "@/backend/models/Room";
import Reservation from "@/backend/models/Reservation";
import {
  getTodaysArrivals,
  getTodaysDepartures,
  getCurrentGuests,
} from "@/backend/controllers/reservationController";

type Occupancy = { available: number; reserved: number; occupied: number; maintenance: number };

function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

// Occupancy derived from live reservation data rather than the coarse
// Room.status field. Room.status can drift (its own model comment says booking
// truth lives in reservation date ranges), so counting it directly can disagree
// with reality. Here we compute what each physical room is doing *today*:
//   occupied  = a guest is currently checked in
//   reserved  = a pending/confirmed booking covers today but isn't checked in
//   maintenance = flagged out of service on the room record
//   available = everything else
async function computeOccupancy(): Promise<Occupancy> {
  const { start, end } = todayRange();

  const [rooms, activeToday] = await Promise.all([
    Room.find().select("_id status").lean(),
    Reservation.find({
      status: { $in: ["pending", "confirmed", "checked_in"] },
      checkIn: { $lt: end }, // starts on/before today
      checkOut: { $gt: start }, // ends after today began
    })
      .select("roomId status")
      .lean(),
  ]);

  const occupiedRooms = new Set<string>();
  const reservedRooms = new Set<string>();
  for (const res of activeToday) {
    const roomId = String(res.roomId);
    if (res.status === "checked_in") occupiedRooms.add(roomId);
    else reservedRooms.add(roomId);
  }

  const occupancy: Occupancy = { available: 0, reserved: 0, occupied: 0, maintenance: 0 };
  for (const room of rooms) {
    const roomId = String(room._id);
    if (room.status === "maintenance") occupancy.maintenance++;
    else if (occupiedRooms.has(roomId)) occupancy.occupied++;
    else if (reservedRooms.has(roomId)) occupancy.reserved++;
    else occupancy.available++;
  }
  return occupancy;
}

export async function getDashboardData() {
  await connectToDatabase();
  const { start, end } = todayRange();

  const [
    arrivals,
    departures,
    currentGuests,
    occupancy,
    walkInsToday,
    recentActivity,
  ] = await Promise.all([
    getTodaysArrivals(),
    getTodaysDepartures(),
    getCurrentGuests(),
    computeOccupancy(),
    Reservation.countDocuments({ isWalkIn: true, createdAt: { $gte: start, $lt: end } }),
    Reservation.find().sort({ createdAt: -1 }).limit(10).populate("userId").populate("roomId").lean(),
  ]);

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

  const [totalRoomsCount, occupancy, totalReservations, allReservations] =
    await Promise.all([
      Room.countDocuments(),
      computeOccupancy(),
      Reservation.countDocuments(),
      Reservation.find().sort({ createdAt: -1 }).populate("userId").populate({ path: "roomId", populate: { path: "roomTypeId" } }).lean(),
    ]);

  // Monthly REALIZED revenue: only completed (checked_out) stays count as
  // earned. Pending/confirmed future bookings are not revenue yet, and cancelled
  // ones never were — including them (as before) overstated the figure.
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
    if (res.status === "checked_out" && res.totalPrice) {
      totalRevenue += res.totalPrice;
      // Bucket by when the stay was completed.
      const completedAt = new Date(
        (res.actualCheckOut as Date) || res.checkOut || (res as unknown as { createdAt: Date }).createdAt
      );
      const mName = monthNames[completedAt.getMonth()];
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
