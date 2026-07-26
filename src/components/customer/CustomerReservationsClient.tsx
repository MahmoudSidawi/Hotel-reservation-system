"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Printer,
  X,
  Bed,
  Sparkles,
  RefreshCw,
  Eye,
  Building,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import StatusBadge from "@/components/receptionist/StatusBadge";
import { useRealtimeReservations } from "@/lib/hooks/useRealtimeReservations";
import { nightsBetween } from "@/lib/dates";

type CustomerReservation = {
  _id: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: string;
  createdAt?: string;
  specialRequests?: string;
  isWalkIn?: boolean;
  roomId?: {
    _id: string;
    roomNumber: string;
    status: string;
    roomTypeId?: {
      _id: string;
      name: string;
      description?: string;
      basePrice?: number;
      capacity?: number;
      images?: string[];
    } | null;
  } | null;
  userId?: {
    _id: string;
    name: string;
    email: string;
  } | null;
};

type TabType = "ALL" | "UPCOMING" | "COMPLETED" | "CANCELLED";

export default function CustomerReservationsClient({
  initialReservations,
  currentUserId,
  userName,
}: {
  initialReservations: CustomerReservation[];
  currentUserId: string;
  userName: string;
}) {
  const [reservations, setReservations] = useState<CustomerReservation[]>(initialReservations);
  const [activeTab, setActiveTab] = useState<TabType>("ALL");
  const [selectedRes, setSelectedRes] = useState<CustomerReservation | null>(null);
  const [printModalRes, setPrintModalRes] = useState<CustomerReservation | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const fetchMyReservations = useCallback(async () => {
    try {
      const res = await fetch("/api/reservations");
      if (res.ok) {
        const data = await res.json();
        // Filter strictly by user ID
        const myData = data.filter((r: any) => {
          const uId = r.userId?._id || r.userId;
          return String(uId) === String(currentUserId);
        });
        setReservations(myData);
      }
    } catch (err) {
      console.error("Failed to refresh user reservations", err);
    }
  }, [currentUserId]);

  // Real-time synchronization
  const { isConnected } = useRealtimeReservations((event) => {
    if (event.userId && String(event.userId) !== String(currentUserId)) {
      return;
    }
    fetchMyReservations();
  });

  const handleCancel = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this reservation?")) return;
    setCancellingId(id);
    setCancelError(null);
    try {
      const res = await fetch(`/api/reservations/${id}/cancel`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to cancel reservation");
      
      // Update local state instantly
      setReservations((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, status: "cancelled" } : item
        )
      );
      if (selectedRes?._id === id) {
        setSelectedRes((prev) => (prev ? { ...prev, status: "cancelled" } : null));
      }
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : "Failed to cancel");
    } finally {
      setCancellingId(null);
    }
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const nights = nightsBetween(checkIn, checkOut);
    return nights > 0 ? nights : 1;
  };

  const getFilteredReservations = () => {
    const now = new Date();
    return reservations.filter((r) => {
      if (activeTab === "UPCOMING") {
        return (
          ["pending", "confirmed"].includes(r.status) ||
          (r.status === "checked_in" && new Date(r.checkOut) >= now)
        );
      }
      if (activeTab === "COMPLETED") {
        return r.status === "checked_out";
      }
      if (activeTab === "CANCELLED") {
        return r.status === "cancelled";
      }
      return true;
    });
  };

  const filtered = getFilteredReservations();

  return (
    <div className="space-y-8">
      {/* Real-time Indicator Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ECE7DF] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#A08149] font-bold">
              PORTAL & HISTORY
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isConnected
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-amber-100 text-amber-800 border border-amber-300"
              }`}
            >
              <Zap className="w-3 h-3 fill-current animate-pulse" />
              {isConnected ? "Live Sync Active" : "Connecting..."}
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-normal tracking-tight text-[#1A1918]">
            My Reservations
          </h1>
        </div>

        <Link
          href="/rooms"
          className="inline-flex items-center gap-2 bg-[#1A1918] hover:bg-[#2C2A29] text-white text-xs font-bold uppercase tracking-[0.18em] px-5 py-3 rounded transition-colors self-start sm:self-auto"
        >
          <Bed className="w-4 h-4 text-[#D4AF37]" />
          Book Another Room
        </Link>
      </div>

      {cancelError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex justify-between items-center">
          <span>{cancelError}</span>
          <button onClick={() => setCancelError(null)} className="text-rose-500 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#ECE7DF]">
        {(
          [
            { id: "ALL", label: "All Bookings", count: reservations.length },
            {
              id: "UPCOMING",
              label: "Upcoming & Active",
              count: reservations.filter((r) =>
                ["pending", "confirmed", "checked_in"].includes(r.status)
              ).length,
            },
            {
              id: "COMPLETED",
              label: "Completed Stays",
              count: reservations.filter((r) => r.status === "checked_out").length,
            },
            {
              id: "CANCELLED",
              label: "Cancelled",
              count: reservations.filter((r) => r.status === "cancelled").length,
            },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? "border-[#A08149] text-[#A08149] bg-white/50"
                : "border-transparent text-[#736F68] hover:text-[#1A1918]"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === tab.id
                  ? "bg-[#A08149] text-white"
                  : "bg-[#ECE7DF] text-[#736F68]"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Reservations List */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-[#ECE7DF] rounded-xl p-12 text-center space-y-4">
          <div className="w-12 h-12 bg-[#FAF8F5] border border-[#ECE7DF] rounded-full flex items-center justify-center mx-auto text-[#A08149]">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-lg text-[#1A1918]">No reservations found</h3>
            <p className="text-xs text-[#736F68] mt-1 max-w-md mx-auto">
              {activeTab === "ALL"
                ? "You haven't made any reservations yet. Explore our luxury suites and reserve your luxury stay."
                : `You currently have no ${activeTab.toLowerCase()} reservations.`}
            </p>
          </div>
          <Link
            href="/rooms"
            className="inline-block bg-[#1A1918] text-white text-xs font-bold uppercase tracking-[0.18em] px-6 py-3 rounded hover:bg-[#2C2A29] transition-colors"
          >
            Explore Luxury Rooms
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filtered.map((reservation) => {
            const room = reservation.roomId;
            const roomType = room?.roomTypeId;
            const nights = calculateNights(reservation.checkIn, reservation.checkOut);
            const refCode = `VEL-${reservation._id.slice(-8).toUpperCase()}`;
            const isCanCancel = ["pending", "confirmed"].includes(reservation.status);

            // Default fallback image if none provided
            const roomImage =
              roomType?.images?.[0] ||
              "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80";

            return (
              <div
                key={reservation._id}
                className="bg-white border border-[#ECE7DF] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Room Image */}
                  <div className="lg:w-72 h-48 lg:h-auto relative bg-[#FAF8F5] flex-shrink-0">
                    <img
                      src={roomImage}
                      alt={roomType?.name || "Hotel Room"}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-[#1A1918]/80 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1 rounded tracking-wider uppercase">
                      Room {room?.roomNumber || "TBD"}
                    </div>
                  </div>

                  {/* Content Info */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {/* Top bar: Code & Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#A08149]">
                            {refCode}
                          </span>
                          <span className="text-[10px] text-[#8C8880] uppercase tracking-wider">
                            • Booking Ref
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={reservation.status} />
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              reservation.status === "checked_out"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            Payment: {reservation.status === "checked_out" ? "Paid" : "Guaranteed"}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-serif text-xl font-normal text-[#1A1918] mb-1">
                        {roomType?.name || "Luxury Suite"}
                      </h3>
                      <p className="text-xs text-[#736F68] line-clamp-1">
                        {roomType?.description || "Comfortable and elegantly appointed accommodation."}
                      </p>
                    </div>

                    {/* Key Details Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#FAF8F5] rounded-lg border border-[#F2EEE8] text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#8C8880] block mb-0.5">
                          CHECK-IN
                        </span>
                        <span className="font-semibold text-[#1A1918]">
                          {new Date(reservation.checkIn).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#8C8880] block mb-0.5">
                          CHECK-OUT
                        </span>
                        <span className="font-semibold text-[#1A1918]">
                          {new Date(reservation.checkOut).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#8C8880] block mb-0.5">
                          DURATION & GUESTS
                        </span>
                        <span className="font-semibold text-[#1A1918]">
                          {nights} {nights === 1 ? "Night" : "Nights"} • {reservation.guests}{" "}
                          {reservation.guests === 1 ? "Guest" : "Guests"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#8C8880] block mb-0.5">
                          TOTAL PRICE
                        </span>
                        <span className="font-serif text-sm font-bold text-[#A08149]">
                          ${reservation.totalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedRes(reservation)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#FAF8F5] hover:bg-[#F2EEE8] text-[#1A1918] border border-[#ECE7DF] rounded text-xs font-bold transition"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#A08149]" />
                          View Full Details
                        </button>
                        <button
                          onClick={() => setPrintModalRes(reservation)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#FAF8F5] hover:bg-[#F2EEE8] text-[#1A1918] border border-[#ECE7DF] rounded text-xs font-bold transition"
                        >
                          <Printer className="w-3.5 h-3.5 text-[#A08149]" />
                          Confirmation Voucher
                        </button>
                      </div>

                      {isCanCancel && (
                        <button
                          disabled={cancellingId === reservation._id}
                          onClick={() => handleCancel(reservation._id)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded text-xs font-bold transition disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          {cancellingId === reservation._id ? "Cancelling..." : "Cancel Booking"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL DETAILS MODAL */}
      {selectedRes && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#ECE7DF] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-start border-b border-[#ECE7DF] pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#A08149]">
                  RESERVATION BREAKDOWN
                </span>
                <h3 className="font-serif text-2xl font-normal text-[#1A1918]">
                  {selectedRes.roomId?.roomTypeId?.name || "Luxury Suite"}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRes(null)}
                className="p-1 text-[#8C8880] hover:text-[#1A1918] rounded-full hover:bg-[#FAF8F5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-[#5C5954]">
              <div className="grid grid-cols-2 gap-4 bg-[#FAF8F5] p-4 rounded-xl border border-[#F2EEE8]">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#8C8880] block">
                    Booking Reference
                  </span>
                  <span className="font-mono font-bold text-sm text-[#A08149]">
                    VEL-{selectedRes._id.slice(-8).toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#8C8880] block">
                    Current Status
                  </span>
                  <div className="mt-1">
                    <StatusBadge status={selectedRes.status} />
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#8C8880] block">
                    Assigned Room
                  </span>
                  <span className="font-semibold text-[#1A1918]">
                    Room {selectedRes.roomId?.roomNumber || "TBD"} (
                    {selectedRes.roomId?.status || "reserved"})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#8C8880] block">
                    Guest Name
                  </span>
                  <span className="font-semibold text-[#1A1918]">{userName}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border border-[#ECE7DF] p-4 rounded-xl">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#8C8880] block mb-1">
                    Check-in
                  </span>
                  <p className="font-bold text-[#1A1918]">
                    {new Date(selectedRes.checkIn).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-[10px] text-[#8C8880]">From 3:00 PM</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#8C8880] block mb-1">
                    Check-out
                  </span>
                  <p className="font-bold text-[#1A1918]">
                    {new Date(selectedRes.checkOut).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-[10px] text-[#8C8880]">Until 11:00 AM</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#8C8880] block mb-1">
                    Duration & Capacity
                  </span>
                  <p className="font-bold text-[#1A1918]">
                    {calculateNights(selectedRes.checkIn, selectedRes.checkOut)} Nights
                  </p>
                  <p className="text-[10px] text-[#8C8880]">{selectedRes.guests} Guests</p>
                </div>
              </div>

              {selectedRes.specialRequests && (
                <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-amber-900 block mb-1">
                    Special Requests
                  </span>
                  <p className="text-xs text-amber-800">{selectedRes.specialRequests}</p>
                </div>
              )}

              <div className="p-4 bg-[#1A1918] text-white rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] block">
                    Total Amount
                  </span>
                  <p className="text-xs text-zinc-400">Taxes & fees included</p>
                </div>
                <span className="font-serif text-2xl font-normal text-white">
                  ${selectedRes.totalPrice.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#ECE7DF] pt-4">
              <button
                onClick={() => setSelectedRes(null)}
                className="px-5 py-2.5 bg-[#FAF8F5] hover:bg-[#F2EEE8] text-[#1A1918] text-xs font-bold rounded uppercase tracking-wider"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT CONFIRMATION VOUCHER MODAL */}
      {printModalRes && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#ECE7DF] rounded-2xl max-w-xl w-full p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-2 border-b border-[#ECE7DF] pb-6">
              <span className="font-serif text-2xl tracking-widest text-[#1A1918] uppercase block">
                VELORA LUXURY HOTEL
              </span>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#A08149]">
                OFFICIAL BOOKING CONFIRMATION VOUCHER
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center bg-[#FAF8F5] p-4 rounded-lg">
                <div>
                  <span className="text-[10px] text-[#8C8880] uppercase font-bold">
                    RESERVATION REFERENCE
                  </span>
                  <p className="font-mono text-base font-bold text-[#A08149]">
                    VEL-{printModalRes._id.slice(-8).toUpperCase()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#8C8880] uppercase font-bold">STATUS</span>
                  <div className="mt-0.5">
                    <StatusBadge status={printModalRes.status} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border border-[#ECE7DF] p-4 rounded-lg">
                <div>
                  <span className="text-[10px] text-[#8C8880] uppercase font-bold">GUEST NAME</span>
                  <p className="font-bold text-[#1A1918]">{userName}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#8C8880] uppercase font-bold">ROOM TYPE</span>
                  <p className="font-bold text-[#1A1918]">
                    {printModalRes.roomId?.roomTypeId?.name || "Standard Room"} (Room{" "}
                    {printModalRes.roomId?.roomNumber || "TBD"})
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-[#8C8880] uppercase font-bold">CHECK-IN</span>
                  <p className="font-semibold text-[#1A1918]">
                    {new Date(printModalRes.checkIn).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-[#8C8880] uppercase font-bold">CHECK-OUT</span>
                  <p className="font-semibold text-[#1A1918]">
                    {new Date(printModalRes.checkOut).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-[#FAF8F5] rounded-lg font-bold">
                <span>TOTAL AMOUNT PAID / GUARANTEED</span>
                <span className="font-serif text-lg text-[#A08149]">
                  ${printModalRes.totalPrice.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#ECE7DF]">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-[#1A1918] text-white text-xs font-bold uppercase tracking-wider rounded flex items-center gap-2 hover:bg-[#2C2A29]"
              >
                <Printer className="w-4 h-4 text-[#D4AF37]" />
                Print Voucher
              </button>
              <button
                onClick={() => setPrintModalRes(null)}
                className="px-5 py-2.5 bg-[#FAF8F5] text-[#1A1918] text-xs font-bold uppercase tracking-wider rounded border border-[#ECE7DF]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
