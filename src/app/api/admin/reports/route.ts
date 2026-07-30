import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/apiAuth";
import { connectToDatabase } from "@/backend/config/db";
import Reservation from "@/backend/models/Reservation";
import Room from "@/backend/models/Room";
import User from "@/backend/models/User";
import MaintenanceRequest from "@/backend/models/MaintenanceRequest";
import { jsonError } from "@/backend/middlewares/errorHandler";

export async function GET(request: NextRequest) {
  try {
    await requireRole("admin");
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get("type") ?? "revenue";
    const months = Math.min(12, Number(searchParams.get("months") ?? "12"));

    const now = new Date();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    if (reportType === "revenue") {
      // Revenue by month for the last N months
      const startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - months + 1);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);

      const reservations = await Reservation.find({
        status: "checked_out",
        createdAt: { $gte: startDate },
      }).lean();

      const monthMap = new Map<string, { revenue: number; count: number }>();
      for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setMonth(d.getMonth() - i);
        const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        monthMap.set(key, { revenue: 0, count: 0 });
      }

      for (const r of reservations) {
        const d = new Date((r as unknown as { actualCheckOut?: Date }).actualCheckOut ?? r.checkOut);
        const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        const entry = monthMap.get(key);
        if (entry) {
          entry.revenue += r.totalPrice ?? 0;
          entry.count += 1;
        }
      }

      const data = Array.from(monthMap.entries()).map(([month, v]) => ({ month, ...v }));
      const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
      const totalCheckouts = data.reduce((s, d) => s + d.count, 0);

      return NextResponse.json({ type: "revenue", data, totalRevenue, totalCheckouts });
    }

    if (reportType === "occupancy") {
      const totalRooms = await Room.countDocuments();

      const startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - months + 1);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);

      const reservations = await Reservation.find({
        status: { $in: ["checked_in", "checked_out"] },
        createdAt: { $gte: startDate },
      }).lean();

      const monthMap = new Map<string, number>();
      for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setMonth(d.getMonth() - i);
        const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        monthMap.set(key, 0);
      }

      for (const r of reservations) {
        const d = new Date(r.checkIn);
        const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        if (monthMap.has(key)) {
          monthMap.set(key, (monthMap.get(key) ?? 0) + 1);
        }
      }

      const daysInMonth = 30;
      const data = Array.from(monthMap.entries()).map(([month, count]) => ({
        month,
        occupancyRate:
          totalRooms > 0 ? Math.min(100, Math.round((count / (totalRooms * daysInMonth)) * 100)) : 0,
        count,
      }));

      return NextResponse.json({ type: "occupancy", data, totalRooms });
    }

    if (reportType === "summary") {
      // Full operational summary for the admin reports tab
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(todayStart);
      todayEnd.setDate(todayEnd.getDate() + 1);

      const [
        totalReservations,
        activeReservations,
        todayCheckIns,
        todayCheckOuts,
        totalRooms,
        roomsByStatus,
        totalUsers,
        newGuests30d,
        openMaintenance,
        allCheckedOut,
      ] = await Promise.all([
        Reservation.countDocuments(),
        Reservation.countDocuments({ status: { $in: ["confirmed", "checked_in"] } }),
        Reservation.countDocuments({ checkIn: { $gte: todayStart, $lt: todayEnd }, status: { $in: ["pending", "confirmed"] } }),
        Reservation.countDocuments({ checkOut: { $gte: todayStart, $lt: todayEnd }, status: "checked_in" }),
        Room.countDocuments(),
        Room.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
        User.countDocuments({ role: "guest" }),
        User.countDocuments({ role: "guest", createdAt: { $gte: thirtyDaysAgo } }),
        MaintenanceRequest.countDocuments({ status: { $in: ["open", "assigned", "in_progress"] } }),
        Reservation.find({ status: "checked_out" }).lean(),
      ]);

      const totalRevenue = allCheckedOut.reduce((s, r) => s + (r.totalPrice ?? 0), 0);
      const roomStatus = Object.fromEntries(roomsByStatus.map((r) => [r._id, r.count]));

      // Cancellation rate
      const cancelled = await Reservation.countDocuments({ status: "cancelled" });
      const cancellationRate = totalReservations > 0 ? Math.round((cancelled / totalReservations) * 100) : 0;

      // Average stay duration
      const avgStay =
        allCheckedOut.length > 0
          ? allCheckedOut.reduce((s, r) => {
              const nights = Math.max(
                1,
                Math.round(
                  (new Date(r.checkOut).getTime() - new Date(r.checkIn).getTime()) / 86400000
                )
              );
              return s + nights;
            }, 0) / allCheckedOut.length
          : 0;

      return NextResponse.json({
        type: "summary",
        totalReservations,
        activeReservations,
        todayCheckIns,
        todayCheckOuts,
        totalRooms,
        roomStatus,
        totalRevenue,
        totalGuests: totalUsers,
        newGuests30d,
        openMaintenance,
        cancellationRate,
        avgStayDuration: Math.round(avgStay * 10) / 10,
      });
    }

    return NextResponse.json({ error: "Unknown report type" }, { status: 400 });
  } catch (error) {
    return jsonError(error);
  }
}
