"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { fallbackImageFor } from "@/lib/rooms-data";
import { nightsBetween } from "@/lib/dates";
import Navbar from "@/app/components/navbar";
import Footer from "@/app/components/footer";

// ---------------------------------------------
// Inline icon components (no external icon libraries)
// ---------------------------------------------
const IconBuilding = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M4 21V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v16M13 21h7a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1h-7M7 7h1M7 11h1M7 15h1M10 7h1M10 11h1M10 15h1M16 12h1M16 16h1"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconCalendar = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3 9.5h18M8 3v3M16 3v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconCard = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3 10h18M7 14.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconUsers = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM22 19v-1a4 4 0 0 0-3-3.87M16 4.13A4 4 0 0 1 16 11.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconPin = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M12 21s7-6.1 7-11.2A7 7 0 0 0 5 9.8C5 14.9 12 21 12 21z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="9.5" r="2.2" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const IconChevronRight = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconClose = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

// ---------------------------------------------
// Types (shapes coming from the backend)
// ---------------------------------------------
type PopulatedRoomType = {
  _id?: string;
  name?: string;
  description?: string;
  basePrice?: number;
  capacity?: number;
} | null;

type Reservation = {
  _id: string;
  status: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  createdAt?: string;
  specialRequests?: string;
  roomId?: {
    roomNumber?: string;
    floor?: number;
    roomTypeId?: PopulatedRoomType;
  } | null;
};

type RoomTypeLite = {
  _id: string;
  name: string;
  description?: string;
  basePrice: number;
  capacity: number;
};

type RoomImageLite = { roomTypeId: string; imageUrl: string; isPrimary?: boolean };

type Props = {
  user: { name: string; email: string };
  reservations: Reservation[];
  roomTypes: RoomTypeLite[];
  roomImages: RoomImageLite[];
};

const PAGE_SIZE = 5;
const UPCOMING_STATUSES = ["pending", "confirmed", "checked_in"];

// ---------------------------------------------
// Formatting helpers
// ---------------------------------------------
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const dateRange = (a: string, b: string) => `${fmtDate(a)} – ${fmtDate(b)}`;
const money = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const refCode = (id: string) => `VEL-${id.slice(-8).toUpperCase()}`;

function statusMeta(status: string): { label: string; cls: string } {
  switch (status) {
    case "confirmed":
      return { label: "CONFIRMED", cls: "bg-[#c9a15f] text-white" };
    case "checked_in":
      return { label: "CHECKED IN", cls: "bg-emerald-600 text-white" };
    case "pending":
      return { label: "PENDING", cls: "bg-neutral-800 text-white" };
    case "checked_out":
      return { label: "COMPLETED", cls: "bg-neutral-500 text-white" };
    case "cancelled":
      return { label: "CANCELLED", cls: "bg-red-600 text-white" };
    case "no_show":
      return { label: "NO SHOW", cls: "bg-orange-500 text-white" };
    default:
      return { label: status.toUpperCase(), cls: "bg-neutral-800 text-white" };
  }
}

// ---------------------------------------------
// Modal shell
// ---------------------------------------------
function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
          aria-label="Close"
        >
          <IconClose className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------
// Page
// ---------------------------------------------
export default function CustomerDashboardClient({ user, reservations, roomTypes, roomImages }: Props) {
  const [selectedStay, setSelectedStay] = useState<Reservation | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Primary image per room type (falls back to a deterministic stock photo).
  const imageForType = useMemo(() => {
    const map = new Map<string, string>();
    for (const img of roomImages) {
      if (!map.has(img.roomTypeId) || img.isPrimary) map.set(img.roomTypeId, img.imageUrl);
    }
    return (typeId?: string) => (typeId && map.get(typeId)) || fallbackImageFor(typeId || "room");
  }, [roomImages]);

  const now = Date.now();

  const upcoming = useMemo(
    () =>
      reservations
        .filter((r) => UPCOMING_STATUSES.includes(r.status) && new Date(r.checkOut).getTime() >= now)
        .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime()),
    [reservations, now]
  );

  const completed = useMemo(
    () =>
      reservations
        .filter((r) => r.status === "checked_out")
        .sort((a, b) => new Date(b.checkOut).getTime() - new Date(a.checkOut).getTime()),
    [reservations]
  );

  // Stats
  const activeReservations = reservations.filter((r) => r.status !== "cancelled" && r.status !== "no_show");
  const totalSpent = activeReservations.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
  const yearAgo = now - 365 * 24 * 60 * 60 * 1000;
  const staysLastYear = completed.filter((r) => new Date(r.checkOut).getTime() >= yearAgo).length;
  const nextStayDays =
    upcoming.length > 0
      ? Math.max(0, Math.ceil((new Date(upcoming[0].checkIn).getTime() - now) / (24 * 60 * 60 * 1000)))
      : null;

  const stats = [
    {
      label: "TOTAL STAYS",
      value: String(completed.length),
      sub: `${staysLastYear} in the last 12 months`,
      icon: IconBuilding,
    },
    {
      label: "UPCOMING BOOKINGS",
      value: String(upcoming.length),
      sub: nextStayDays === null ? "No upcoming stays" : `Next stay in ${nextStayDays} day${nextStayDays === 1 ? "" : "s"}`,
      icon: IconCalendar,
    },
    {
      label: "TOTAL SPENT",
      value: money(totalSpent),
      sub: `Across ${activeReservations.length} reservation${activeReservations.length === 1 ? "" : "s"}`,
      icon: IconCard,
    },
  ];

  const visibleHistory = completed.slice(0, visibleCount);
  const hasMoreHistory = visibleCount < completed.length;
  const firstName = user.name.split(" ")[0];

  // Featured room = the real top-tier room type (highest nightly rate).
  const featured = useMemo(
    () => [...roomTypes].sort((a, b) => b.basePrice - a.basePrice)[0] ?? null,
    [roomTypes]
  );

  return (
    <div className="min-h-screen bg-[#f5f4f2] font-serif text-[#1c1b19] flex flex-col">
      {/* Shared site navigation — same navbar (with account dropdown) as the rest of the site */}
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-grow px-5 pb-20 pt-8 sm:px-8">
        {/* -------------------- Welcome + quick actions -------------------- */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl leading-tight sm:text-5xl">Welcome, {firstName}</h1>
            <p className="mt-2 font-sans text-sm text-neutral-500">
              Your next exceptional experience begins here.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 font-sans text-xs font-semibold uppercase tracking-widest">
            <Link
              href="/rooms"
              className="rounded-md bg-[#1c1b19] px-5 py-2.5 text-white transition-colors hover:bg-black"
            >
              Browse Rooms
            </Link>
            <Link
              href="/reservations"
              className="rounded-md border border-neutral-300 bg-white px-5 py-2.5 text-neutral-700 transition-colors hover:border-neutral-400"
            >
              My Reservations
            </Link>
          </div>
        </div>

        {/* ==================== OVERVIEW TAB ==================== */}
        {/* Featured room — our real top-tier room type, straight from the catalog */}
        {featured && (
          <div className="relative mb-10 overflow-hidden rounded-2xl">
            <img
              src={imageForType(featured._id)}
              alt={featured.name}
              className="h-[280px] w-full object-cover sm:h-[400px] md:h-[460px]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12">
              <div className="mb-3 flex items-center gap-2 font-sans text-xs font-semibold tracking-[0.2em] text-amber-300">
                <span className="h-px w-6 bg-amber-300" />
                OUR FINEST · FROM ${featured.basePrice}/NIGHT
              </div>
              <h2 className="max-w-md text-4xl leading-tight text-white sm:text-5xl">{featured.name}</h2>
              <p className="mt-4 max-w-sm font-sans text-sm text-white/85">
                {featured.description || "Experience the pinnacle of Velora hospitality."}
              </p>
              <Link
                href={`/rooms/${featured._id}`}
                className="mt-6 w-fit rounded-md bg-[#c9a15f] px-6 py-2.5 font-sans text-sm font-semibold text-[#1c1b19] transition-colors hover:bg-[#b8914f]"
              >
                View &amp; Book
              </Link>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-start justify-between rounded-xl border border-neutral-200 bg-white p-5"
            >
              <div>
                <p className="font-sans text-xs font-medium tracking-widest text-neutral-500">{stat.label}</p>
                <p className="mt-2 text-3xl">{stat.value}</p>
                <p className="mt-1 font-sans text-xs text-neutral-500">{stat.sub}</p>
              </div>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-amber-50 text-amber-600">
                <stat.icon className="h-4 w-4" />
              </span>
            </div>
          ))}
        </div>

        {/* Upcoming stays */}
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-2xl">Upcoming Stays</h3>
            <Link
              href="/reservations"
              className="flex items-center gap-1 font-sans text-xs font-semibold tracking-widest text-[#c9a15f] hover:underline"
            >
              VIEW ALL <IconChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-12 text-center">
              <p className="font-sans text-sm text-neutral-500">You have no upcoming stays.</p>
              <Link
                href="/rooms"
                className="mt-4 inline-block rounded-md bg-[#1c1b19] px-5 py-2.5 font-sans text-xs font-semibold uppercase tracking-widest text-white hover:bg-black"
              >
                Explore Rooms
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {upcoming.slice(0, 4).map((stay) => {
                const rt = stay.roomId?.roomTypeId;
                const meta = statusMeta(stay.status);
                return (
                  <div
                    key={stay._id}
                    className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white sm:flex-row"
                  >
                    <img
                      src={imageForType(rt?._id)}
                      alt={rt?.name || "Room"}
                      className="h-48 w-full object-cover sm:h-auto sm:w-40"
                    />
                    <div className="flex flex-1 flex-col justify-between p-5">
                      <div>
                        <div className="mb-2 flex items-center justify-between font-sans">
                          <span className="text-xs text-neutral-500">{refCode(stay._id)}</span>
                          <span className={`rounded px-2 py-0.5 text-[10px] font-semibold tracking-wide ${meta.cls}`}>
                            {meta.label}
                          </span>
                        </div>
                        <p className="text-lg font-semibold">{rt?.name || "Reserved Room"}</p>
                        <div className="mt-2 flex items-center gap-2 font-sans text-sm text-neutral-500">
                          <IconCalendar className="h-4 w-4" />
                          {dateRange(stay.checkIn, stay.checkOut)}
                        </div>
                        <div className="mt-1 flex items-center gap-2 font-sans text-sm text-neutral-500">
                          <IconPin className="h-4 w-4" />
                          Room {stay.roomId?.roomNumber ?? "TBD"}
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 font-sans text-xs">
                        <button
                          onClick={() => setSelectedStay(stay)}
                          className="font-semibold tracking-wide text-[#c9a15f] hover:underline"
                        >
                          VIEW DETAILS
                        </button>
                        <span className="font-semibold text-neutral-800">{money(stay.totalPrice)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Explore rooms */}
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-2xl">Explore Our Rooms</h3>
            <Link
              href="/rooms"
              className="flex items-center gap-1 font-sans text-xs font-semibold tracking-widest text-[#c9a15f] hover:underline"
            >
              VIEW ALL ROOMS <IconChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {roomTypes.length === 0 ? (
            <p className="font-sans text-sm text-neutral-500">No rooms are available to show right now.</p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {roomTypes.slice(0, 3).map((room) => (
                <Link
                  key={room._id}
                  href={`/rooms/${room._id}`}
                  className="group overflow-hidden rounded-xl border border-neutral-200 bg-white transition-shadow hover:shadow-lg"
                >
                  <img src={imageForType(room._id)} alt={room.name} className="h-48 w-full object-cover" />
                  <div className="p-5">
                    <div className="mb-1 flex items-center justify-between font-sans text-xs">
                      <span className="flex items-center gap-1 font-semibold tracking-wide text-[#c9a15f]">
                        <IconUsers className="h-3.5 w-3.5" />
                        Up to {room.capacity} guest{room.capacity === 1 ? "" : "s"}
                      </span>
                    </div>
                    <p className="mt-1 text-lg font-semibold group-hover:underline">{room.name}</p>
                    <p className="mt-2 line-clamp-2 font-sans text-sm text-neutral-500">
                      {room.description || "Elegantly appointed accommodation designed for a restful stay."}
                    </p>
                    <p className="mt-3 font-sans text-sm font-semibold text-neutral-800">${room.basePrice}/night</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Stay history */}
        <section>
          <h3 className="mb-4 text-2xl">Stay History</h3>
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <div className="hidden grid-cols-4 border-b border-neutral-200 px-5 py-3 font-sans text-xs font-medium tracking-widest text-neutral-400 sm:grid">
              <span>BOOKING</span>
              <span>ROOM</span>
              <span>DATES</span>
              <span className="text-right">AMOUNT</span>
            </div>

            {completed.length === 0 ? (
              <div className="px-5 py-10 text-center font-sans text-sm text-neutral-500">
                No completed stays yet.
              </div>
            ) : (
              <>
                {visibleHistory.map((row, idx) => (
                  <div
                    key={row._id}
                    className={`flex flex-col gap-1 px-5 py-4 font-sans text-sm sm:grid sm:grid-cols-4 sm:items-center sm:gap-0 ${
                      idx !== visibleHistory.length - 1 ? "border-b border-neutral-100" : ""
                    }`}
                  >
                    <span className="font-medium text-neutral-800">{refCode(row._id)}</span>
                    <span className="flex items-center gap-1 text-neutral-500">
                      <IconPin className="h-3.5 w-3.5" />
                      Room {row.roomId?.roomNumber ?? "—"}
                    </span>
                    <span className="text-neutral-500">{dateRange(row.checkIn, row.checkOut)}</span>
                    <span className="font-semibold text-neutral-900 sm:text-right">{money(row.totalPrice)}</span>
                  </div>
                ))}

                <div className="border-t border-neutral-100 py-4 text-center">
                  {hasMoreHistory ? (
                    <button
                      onClick={() => setVisibleCount((c) => Math.min(c + PAGE_SIZE, completed.length))}
                      className="font-sans text-xs font-semibold tracking-widest text-neutral-500 hover:text-neutral-800"
                    >
                      LOAD MORE HISTORY
                    </button>
                  ) : (
                    <span className="font-sans text-xs tracking-widest text-neutral-300">ALL STAYS LOADED</span>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      {/* Shared site footer */}
      <Footer />

      {/* -------------------- Stay details modal -------------------- */}
      <Modal open={!!selectedStay} onClose={() => setSelectedStay(null)}>
        {selectedStay && (
          <div>
            <img
              src={imageForType(selectedStay.roomId?.roomTypeId?._id)}
              alt={selectedStay.roomId?.roomTypeId?.name || "Room"}
              className="mb-4 h-40 w-full rounded-md object-cover"
            />
            <div className="mb-2 flex items-center justify-between font-sans text-xs">
              <span className="text-neutral-500">{refCode(selectedStay._id)}</span>
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-semibold tracking-wide ${statusMeta(selectedStay.status).cls}`}
              >
                {statusMeta(selectedStay.status).label}
              </span>
            </div>
            <h4 className="text-lg font-semibold">{selectedStay.roomId?.roomTypeId?.name || "Reserved Room"}</h4>
            <div className="mt-3 space-y-2 font-sans text-sm text-neutral-600">
              <div className="flex items-center gap-2">
                <IconCalendar className="h-4 w-4" /> {dateRange(selectedStay.checkIn, selectedStay.checkOut)} ·{" "}
                {nightsBetween(selectedStay.checkIn, selectedStay.checkOut)} nights
              </div>
              <div className="flex items-center gap-2">
                <IconPin className="h-4 w-4" /> Room {selectedStay.roomId?.roomNumber ?? "TBD"}
              </div>
              <div className="flex items-center gap-2">
                <IconUsers className="h-4 w-4" /> {selectedStay.guests} guest{selectedStay.guests === 1 ? "" : "s"}
              </div>
              {selectedStay.specialRequests && (
                <div className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  {selectedStay.specialRequests}
                </div>
              )}
              <div className="font-semibold text-neutral-900">{money(selectedStay.totalPrice)} total</div>
            </div>
            <div className="mt-5 flex gap-2">
              <Link
                href="/reservations"
                className="flex-1 rounded-md bg-[#1c1b19] px-6 py-2.5 text-center font-sans text-sm font-semibold text-white hover:bg-black"
              >
                Manage Booking
              </Link>
              <button
                onClick={() => setSelectedStay(null)}
                className="rounded-md border border-neutral-300 px-6 py-2.5 font-sans text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
