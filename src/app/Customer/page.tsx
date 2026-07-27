"use client";

import { useState } from "react";
import Link from "next/link";

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

const IconStar = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.5l2.9 6.05 6.68.79-4.95 4.6 1.3 6.63L12 17.6l-5.93 3.07 1.3-6.63-4.95-4.6 6.68-.79L12 2.5z" />
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

const IconMenu = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

const IconClose = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

const IconCheck = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ---------------------------------------------
// Types
// ---------------------------------------------
type Stay = {
  id: string;
  status: "CONFIRMED" | "SCHEDULED";
  name: string;
  dates: string;
  location: string;
  image: string;
  guests: string;
  rate: string;
};

type Room = {
  tag: string;
  rating: string;
  name: string;
  desc: string;
  image: string;
  price: string;
  slug: string;
};

type HistoryRow = {
  id: string;
  location: string;
  dates: string;
  amount: string;
};

// ---------------------------------------------
// Static data
// ---------------------------------------------
const navLinks: { label: string; href: string }[] = [
  { label: "Rooms", href: "/rooms" },
  { label: "Reservations", href: "/reservations" },
  { label: "Settings", href: "/settings" },
];

const tabs = ["Overview", "Reservations", "Settings"] as const;
type TabName = (typeof tabs)[number];

const stats = [
  { label: "TOTAL STAYS", value: "14", sub: "4 in the last 12 months", icon: IconBuilding },
  { label: "UPCOMING BOOKINGS", value: "2", sub: "Next stay in 12 days", icon: IconCalendar },
  { label: "PENDING CREDITS", value: "$420.00", sub: "Available for next booking", icon: IconCard },
];

const upcomingStays: Stay[] = [
  {
    id: "RES-9901",
    status: "CONFIRMED",
    name: "Grand Alpine Suite",
    dates: "Dec 14 - Dec 18, 2024",
    location: "Velora Highlands",
    guests: "2 adults",
    rate: "$1,480 total",
    image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "RES-9952",
    status: "SCHEDULED",
    name: "Garden View Villa",
    dates: "Feb 02 - Feb 06, 2025",
    location: "Velora Highlands",
    guests: "3 adults, 1 child",
    rate: "$1,920 total",
    image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=800&auto=format&fit=crop",
  },
];

const rooms: Room[] = [
  {
    tag: "SIGNATURE ROOM",
    rating: "4.9",
    name: "Deluxe Ocean Suite",
    desc: "Unparalleled luxury with panoramic ocean views and private balcony access. Designed for the discerning traveler.",
    price: "$620/night",
    slug: "deluxe-ocean-suite",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop",
  },
  {
    tag: "EXCLUSIVE SUITE",
    rating: "4.8",
    name: "Premier Sky Loft",
    desc: "A two-story masterpiece featuring floor-to-ceiling glass and high-end artisanal furnishings.",
    price: "$740/night",
    slug: "premier-sky-loft",
    image: "https://images.unsplash.com/photo-1611048268330-53de574cae3b?q=80&w=800&auto=format&fit=crop",
  },
  {
    tag: "SIGNATURE ROOM",
    rating: "4.9",
    name: "Royal Garden Suite",
    desc: "Serene garden vistas paired with expansive indoor-outdoor living spaces for peak tranquility.",
    price: "$580/night",
    slug: "royal-garden-suite",
    image: "https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=800&auto=format&fit=crop",
  },
];

const allHistory: HistoryRow[] = [
  { id: "#SH-2201", location: "Velora Highlands", dates: "Nov 12 - 15, 2023", amount: "$1,240.00" },
  { id: "#SH-2202", location: "Velora Highlands", dates: "Nov 12 - 15, 2023", amount: "$1,240.00" },
  { id: "#SH-2203", location: "Velora Shores", dates: "Oct 05 - 09, 2023", amount: "$2,150.00" },
  { id: "#SH-2204", location: "Velora Urban", dates: "Aug 21 - 24, 2023", amount: "$980.00" },
  { id: "#SH-2205", location: "Velora Highlands", dates: "Jun 10 - 14, 2023", amount: "$1,650.00" },
  { id: "#SH-2206", location: "Velora Shores", dates: "Apr 02 - 05, 2023", amount: "$1,120.00" },
  { id: "#SH-2207", location: "Velora Urban", dates: "Feb 18 - 21, 2023", amount: "$890.00" },
  { id: "#SH-2208", location: "Velora Highlands", dates: "Jan 03 - 07, 2023", amount: "$1,760.00" },
];

const PAGE_SIZE = 5;

// ---------------------------------------------
// Small reusable modal shell
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
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden
      />
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
export default function VeloraDashboard() {
  const [activeTab, setActiveTab] = useState<TabName>("Overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Book Now flow
  const [bookOpen, setBookOpen] = useState(false);
  const [bookConfirmed, setBookConfirmed] = useState(false);

  // Stay details modal
  const [selectedStay, setSelectedStay] = useState<Stay | null>(null);

  // Stay history pagination
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visibleHistory = allHistory.slice(0, visibleCount);
  const hasMoreHistory = visibleCount < allHistory.length;

  const goToTab = (tab: TabName) => {
    setActiveTab(tab);
    setMobileNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f4f2] font-serif text-[#1c1b19]">
      {/* -------------------- Header -------------------- */}
      <header className="sticky top-0 z-30 bg-[#141312] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/Customer" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10">
              <IconBuilding className="h-4 w-4 text-white" />
            </span>
            <span className="text-lg tracking-wide">Velora</span>
          </Link>

          <nav className="hidden items-center gap-10 text-xs font-sans font-medium tracking-widest text-white/80 md:flex">
            {navLinks.map((link) =>
              link.href ? (
                <Link
                  key={link.label}
                  href={link.href}
                  className="uppercase transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ) : (
                <button
                  key={link.label}
                  onClick={() => goToTab(link.label as TabName)}
                  className={`uppercase transition-colors hover:text-white ${
                    activeTab === link.label ? "text-white" : ""
                  }`}
                >
                  {link.label}
                </button>
              )
            )}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              className="hidden items-center gap-2 sm:flex"
            >
              <span className="text-sm font-sans">Eleanor</span>
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop"
                alt="Eleanor avatar"
                className="h-9 w-9 rounded-full object-cover ring-2 ring-white/20"
              />
            </Link>
            <button
              onClick={() => setMobileNavOpen((v) => !v)}
              className="ml-1 flex h-9 w-9 items-center justify-center rounded-md text-white md:hidden"
              aria-label="Toggle navigation"
            >
              {mobileNavOpen ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {mobileNavOpen && (
          <div className="border-t border-white/10 bg-[#141312] px-5 py-3 font-sans text-sm md:hidden">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) =>
                link.href ? (
                  <Link key={link.label} href={link.href} className="uppercase tracking-widest text-white/80">
                    {link.label}
                  </Link>
                ) : (
                  <button
                    key={link.label}
                    onClick={() => goToTab(link.label as TabName)}
                    className="text-left uppercase tracking-widest text-white/80"
                  >
                    {link.label}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-5 pb-20 pt-8 sm:px-8">
        {/* -------------------- Welcome + tabs -------------------- */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl leading-tight sm:text-5xl">Welcome, Eleanor</h1>
            <p className="mt-2 font-sans text-sm text-neutral-500">
              Your next exceptional experience begins here.
            </p>
          </div>

          <div className="flex w-full max-w-xs rounded-full border border-neutral-200 bg-white p-1 font-sans text-sm sm:w-auto">
            {tabs.map((tab) =>
              tab === "Overview" ? (
                <button
                  key={tab}
                  onClick={() => goToTab(tab)}
                  className={`flex-1 rounded-full px-4 py-1.5 transition-colors sm:flex-none ${
                    activeTab === tab ? "bg-[#1c1b19] text-white" : "text-neutral-500 hover:text-neutral-800"
                  }`}
                >
                  {tab}
                </button>
              ) : (
                <Link
                  key={tab}
                  href={tab === "Reservations" ? "/reservations" : "/settings"}
                  className="flex-1 rounded-full px-4 py-1.5 text-center text-neutral-500 transition-colors hover:text-neutral-800 sm:flex-none"
                >
                  {tab}
                </Link>
              )
            )}
          </div>
        </div>

        {/* ==================== OVERVIEW TAB ==================== */}
        {activeTab === "Overview" && (
          <>
            {/* Hero banner */}
            <div className="relative mb-10 overflow-hidden rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1600&auto=format&fit=crop"
                alt="Velora Penthouse lounge"
                className="h-[280px] w-full object-cover sm:h-[400px] md:h-[460px]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12">
                <div className="mb-3 flex items-center gap-2 font-sans text-xs font-semibold tracking-[0.2em] text-amber-300">
                  <span className="h-px w-6 bg-amber-300" />
                  EXCLUSIVE OFFER
                </div>
                <h2 className="max-w-md text-4xl leading-tight text-white sm:text-5xl">
                  Escape to the Velora Penthouse
                </h2>
                <p className="mt-4 max-w-sm font-sans text-sm text-white/85">
                  Enjoy exclusive seasonal rates on our signature Velora Penthouse suites. Experience luxury
                  redefined.
                </p>
                <button
                  onClick={() => {
                    setBookConfirmed(false);
                    setBookOpen(true);
                  }}
                  className="mt-6 w-fit rounded-md bg-[#c9a15f] px-6 py-2.5 font-sans text-sm font-semibold text-[#1c1b19] transition-colors hover:bg-[#b8914f]"
                >
                  Book Now
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-start justify-between rounded-xl border border-neutral-200 bg-white p-5"
                >
                  <div>
                    <p className="font-sans text-xs font-medium tracking-widest text-neutral-500">
                      {stat.label}
                    </p>
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
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {upcomingStays.map((stay) => (
                  <div
                    key={stay.id}
                    className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white sm:flex-row"
                  >
                    <img
                      src={stay.image}
                      alt={stay.name}
                      className="h-48 w-full object-cover sm:h-auto sm:w-40"
                    />
                    <div className="flex flex-1 flex-col justify-between p-5">
                      <div>
                        <div className="mb-2 flex items-center justify-between font-sans">
                          <span className="text-xs text-neutral-500">{stay.id}</span>
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
                              stay.status === "CONFIRMED"
                                ? "bg-[#c9a15f] text-white"
                                : "bg-neutral-800 text-white"
                            }`}
                          >
                            {stay.status}
                          </span>
                        </div>
                        <p className="text-lg font-semibold">{stay.name}</p>
                        <div className="mt-2 flex items-center gap-2 font-sans text-sm text-neutral-500">
                          <IconCalendar className="h-4 w-4" />
                          {stay.dates}
                        </div>
                        <div className="mt-1 flex items-center gap-2 font-sans text-sm text-neutral-500">
                          <IconPin className="h-4 w-4" />
                          {stay.location}
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 font-sans text-xs">
                        <button
                          onClick={() => setSelectedStay(stay)}
                          className="font-semibold tracking-wide text-[#c9a15f] hover:underline"
                        >
                          VIEW DETAILS
                        </button>
                        <span className="italic text-neutral-400">{stay.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {rooms.map((room) => (
                  <Link
                    key={room.name}
                    href={`/rooms/${room.slug}`}
                    className="group overflow-hidden rounded-xl border border-neutral-200 bg-white transition-shadow hover:shadow-lg"
                  >
                    <img src={room.image} alt={room.name} className="h-48 w-full object-cover" />
                    <div className="p-5">
                      <div className="mb-1 flex items-center justify-between font-sans text-xs">
                        <span className="font-semibold tracking-wide text-[#c9a15f]">{room.tag}</span>
                        <span className="flex items-center gap-1 text-neutral-700">
                          <IconStar className="h-3.5 w-3.5 text-amber-500" />
                          {room.rating}
                        </span>
                      </div>
                      <p className="mt-1 text-lg font-semibold group-hover:underline">{room.name}</p>
                      <p className="mt-2 font-sans text-sm text-neutral-500">{room.desc}</p>
                      <p className="mt-3 font-sans text-sm font-semibold text-neutral-800">{room.price}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Stay history */}
            <section>
              <h3 className="mb-4 text-2xl">Stay History</h3>
              <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                <div className="hidden grid-cols-4 border-b border-neutral-200 px-5 py-3 font-sans text-xs font-medium tracking-widest text-neutral-400 sm:grid">
                  <span>STAY ID</span>
                  <span>LOCATION</span>
                  <span>DATES</span>
                  <span className="text-right">AMOUNT</span>
                </div>

                {visibleHistory.map((row, idx) => (
                  <div
                    key={row.id}
                    className={`flex flex-col gap-1 px-5 py-4 font-sans text-sm sm:grid sm:grid-cols-4 sm:items-center sm:gap-0 ${
                      idx !== visibleHistory.length - 1 ? "border-b border-neutral-100" : ""
                    }`}
                  >
                    <span className="font-medium text-neutral-800">{row.id}</span>
                    <span className="flex items-center gap-1 text-neutral-500">
                      <IconPin className="h-3.5 w-3.5" />
                      {row.location}
                    </span>
                    <span className="text-neutral-500">{row.dates}</span>
                    <span className="font-semibold text-neutral-900 sm:text-right">{row.amount}</span>
                  </div>
                ))}

                <div className="border-t border-neutral-100 py-4 text-center">
                  {hasMoreHistory ? (
                    <button
                      onClick={() => setVisibleCount((c) => Math.min(c + PAGE_SIZE, allHistory.length))}
                      className="font-sans text-xs font-semibold tracking-widest text-neutral-500 hover:text-neutral-800"
                    >
                      LOAD MORE HISTORY
                    </button>
                  ) : (
                    <span className="font-sans text-xs tracking-widest text-neutral-300">
                      ALL STAYS LOADED
                    </span>
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* -------------------- Footer -------------------- */}
      <footer className="border-t border-neutral-200 py-6">
        <p className="text-center font-sans text-xs text-neutral-400">© 2024 Velora Hospitality Group.</p>
      </footer>

      {/* -------------------- Book Now modal -------------------- */}
      <Modal open={bookOpen} onClose={() => setBookOpen(false)}>
        {!bookConfirmed ? (
          <>
            <h4 className="mb-1 text-xl">Book the Velora Penthouse</h4>
            <p className="mb-4 font-sans text-sm text-neutral-500">
              Confirm your interest and our concierge team will follow up to finalize dates.
            </p>
            <button
              onClick={() => setBookConfirmed(true)}
              className="w-full rounded-md bg-[#c9a15f] px-6 py-2.5 font-sans text-sm font-semibold text-[#1c1b19] hover:bg-[#b8914f]"
            >
              Confirm Request
            </button>
          </>
        ) : (
          <div className="py-2 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <IconCheck className="h-6 w-6" />
            </div>
            <h4 className="text-lg font-semibold">Request sent</h4>
            <p className="mt-1 font-sans text-sm text-neutral-500">
              A member of our team will reach out shortly to confirm your Penthouse dates.
            </p>
          </div>
        )}
      </Modal>

      {/* -------------------- Stay details modal -------------------- */}
      <Modal open={!!selectedStay} onClose={() => setSelectedStay(null)}>
        {selectedStay && (
          <div>
            <img
              src={selectedStay.image}
              alt={selectedStay.name}
              className="mb-4 h-40 w-full rounded-md object-cover"
            />
            <div className="mb-2 flex items-center justify-between font-sans text-xs">
              <span className="text-neutral-500">{selectedStay.id}</span>
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
                  selectedStay.status === "CONFIRMED" ? "bg-[#c9a15f] text-white" : "bg-neutral-800 text-white"
                }`}
              >
                {selectedStay.status}
              </span>
            </div>
            <h4 className="text-lg font-semibold">{selectedStay.name}</h4>
            <div className="mt-3 space-y-2 font-sans text-sm text-neutral-600">
              <div className="flex items-center gap-2">
                <IconCalendar className="h-4 w-4" /> {selectedStay.dates}
              </div>
              <div className="flex items-center gap-2">
                <IconPin className="h-4 w-4" /> {selectedStay.location}
              </div>
              <div>Guests: {selectedStay.guests}</div>
              <div className="font-semibold text-neutral-900">{selectedStay.rate}</div>
            </div>
            <button
              onClick={() => setSelectedStay(null)}
              className="mt-5 w-full rounded-md bg-[#1c1b19] px-6 py-2.5 font-sans text-sm font-semibold text-white hover:bg-black"
            >
              Close
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
