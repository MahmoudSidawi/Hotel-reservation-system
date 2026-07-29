'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Users, Loader2, Filter, RotateCcw, Calendar, Building2, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { ApiRoomType, ApiRoomImage, getAmenityIcon, fallbackImageFor } from '@/lib/rooms-data';
import Navbar from '../components/navbar';
import Footer from '../components/footer';

type PhysicalRoom = {
  _id: string;
  roomNumber: string;
  floor: number;
  status: 'available' | 'reserved' | 'occupied' | 'maintenance' | 'needs_cleaning' | 'cleaning';
  notes?: string;
  roomTypeId: ApiRoomType;
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  available:      { label: 'AVAILABLE',      bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  reserved:       { label: 'RESERVED',       bg: 'bg-[#FAF5E6]',  text: 'text-[#96742E]',   border: 'border-[#EAE0C8]' },
  occupied:       { label: 'OCCUPIED',       bg: 'bg-amber-50',   text: 'text-amber-800',   border: 'border-amber-200' },
  needs_cleaning: { label: 'NEEDS CLEANING', bg: 'bg-orange-50',  text: 'text-orange-800',  border: 'border-orange-200' },
  cleaning:       { label: 'CLEANING',       bg: 'bg-blue-50',    text: 'text-blue-800',    border: 'border-blue-200' },
  maintenance:    { label: 'MAINTENANCE',    bg: 'bg-rose-50',    text: 'text-rose-800',    border: 'border-rose-200' },
};

export default function RoomsPage() {
  const [physicalRooms, setPhysicalRooms] = useState<PhysicalRoom[]>([]);
  const [roomTypes, setRoomTypes]         = useState<ApiRoomType[]>([]);
  const [images, setImages]               = useState<ApiRoomImage[]>([]);
  const [loading, setLoading]             = useState(true);
  const [loadError, setLoadError]         = useState<string | null>(null);

  // View Mode: 'all_rooms' (shows #101, #102, #103...) vs 'categories'
  const [viewMode, setViewMode]           = useState<'all_rooms' | 'categories'>('all_rooms');

  // Filter States
  const [selectedGuests, setSelectedGuests] = useState<number>(0);
  const [maxPrice, setMaxPrice]             = useState<number>(2000);
  const [checkInDate, setCheckInDate]       = useState<string>('');
  const [checkOutDate, setCheckOutDate]     = useState<string>('');
  const [sortBy, setSortBy]                 = useState<string>('ROOM_NUMBER');

  // Today's date in YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    Promise.all([
      fetch('/api/rooms', { signal: controller.signal }).then((res) => res.json()),
      fetch('/api/room-types', { signal: controller.signal }).then((res) => res.json()),
      fetch('/api/room-images', { signal: controller.signal }).then((res) => res.json()),
    ])
      .then(([roomsData, roomTypesData, imagesData]) => {
        setPhysicalRooms(Array.isArray(roomsData) ? roomsData : []);
        setRoomTypes(Array.isArray(roomTypesData) ? roomTypesData : []);
        setImages(Array.isArray(imagesData) ? imagesData : []);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setLoadError('Failed to load rooms. Please try again.');
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [checkInDate, checkOutDate]);

  const imageFor = (roomTypeId: string): string => {
    const forType = images.filter((img) => img.roomTypeId === roomTypeId);
    const primary = forType.find((img) => img.isPrimary) ?? forType[0];
    return primary?.imageUrl ?? fallbackImageFor(roomTypeId);
  };

  // Filter physical rooms
  const filteredPhysicalRooms = physicalRooms.filter((room) => {
    const rt = typeof room.roomTypeId === 'object' ? room.roomTypeId : null;
    const capacity = rt?.capacity ?? 2;
    const basePrice = rt?.basePrice ?? 120;

    if (selectedGuests > 0 && capacity < selectedGuests) return false;
    if (basePrice > maxPrice) return false;
    return true;
  });

  const sortedPhysicalRooms = [...filteredPhysicalRooms].sort((a, b) => {
    const rtA = typeof a.roomTypeId === 'object' ? a.roomTypeId : null;
    const rtB = typeof b.roomTypeId === 'object' ? b.roomTypeId : null;
    const priceA = rtA?.basePrice ?? 0;
    const priceB = rtB?.basePrice ?? 0;

    if (sortBy === 'PRICE_LOW')  return priceA - priceB;
    if (sortBy === 'PRICE_HIGH') return priceB - priceA;
    if (sortBy === 'FLOOR')      return a.floor - b.floor;
    return a.roomNumber.localeCompare(b.roomNumber);
  });

  const handleResetFilters = () => {
    setSelectedGuests(0);
    setMaxPrice(2000);
    setCheckInDate('');
    setCheckOutDate('');
    setSortBy('ROOM_NUMBER');
  };

  const hasActiveFilters = selectedGuests > 0 || maxPrice < 2000 || checkInDate !== '' || checkOutDate !== '';

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-[#1A1918] font-sans antialiased flex flex-col justify-between">
      {/* NAVBAR */}
      <Navbar />

      <main className="flex-grow">
        {/* HERO BANNER */}
        <section
          className="relative h-[260px] md:h-[320px] bg-cover bg-center flex items-center justify-center text-center px-4 overflow-hidden mb-8 md:mb-12"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(15,15,15,0.45), rgba(15,15,15,0.65)),
              url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=2000')`
          }}
        >
          <div className="max-w-2xl mx-auto space-y-3 z-10 text-white">
            <span className="text-[10px] md:text-xs uppercase font-medium tracking-[0.25em] text-[#E0D5BE] block">
              THE ART OF FINE LIVING
            </span>
            <h1 className="font-serif text-3xl md:text-5xl font-normal tracking-tight">Rooms &amp; Suites</h1>
            <div className="w-12 h-[1px] bg-[#C5A46D] mx-auto my-2" />
            <p className="text-xs md:text-sm font-light text-[#ECE7DE] tracking-wide">
              Select your specific room or suite for an unforgettable stay
            </p>
          </div>
        </section>

        {/* MAIN CONTAINER */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pb-16 md:pb-24">
          
          {/* HEADER & VIEW TOGGLE */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-8 gap-4 border-b border-[#EAE6DF] pb-6">
            <div className="max-w-xl space-y-1">
              <h2 className="font-serif text-2xl md:text-3xl font-normal tracking-tight text-[#1A1918]">
                Hotel Accommodations
              </h2>
              <p className="text-xs text-[#736F68] font-light leading-relaxed">
                Choose from our available individual rooms across all floors, each styled for luxury and comfort.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 text-xs shrink-0 pt-2 md:pt-0">
              {/* VIEW TOGGLE */}
              <div className="flex bg-[#EAE6DF] p-1 rounded-lg border border-[#DDD8CF]">
                <button
                  onClick={() => setViewMode('all_rooms')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                    viewMode === 'all_rooms'
                      ? 'bg-white text-[#1A1918] shadow-sm'
                      : 'text-[#736F68] hover:text-[#1A1918]'
                  }`}
                >
                  🏢 All Rooms ({physicalRooms.length})
                </button>
                <button
                  onClick={() => setViewMode('categories')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                    viewMode === 'categories'
                      ? 'bg-white text-[#1A1918] shadow-sm'
                      : 'text-[#736F68] hover:text-[#1A1918]'
                  }`}
                >
                  ✨ Categories ({roomTypes.length})
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-[#736F68]">
                <span>Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-[#1A1918] font-medium focus:outline-none cursor-pointer"
                >
                  <option value="ROOM_NUMBER">Room #</option>
                  <option value="FLOOR">Floor Level</option>
                  <option value="PRICE_LOW">Price: Low to High</option>
                  <option value="PRICE_HIGH">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* TWO COLUMN LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

            {/* LEFT SIDEBAR FILTERS */}
            <aside className="lg:col-span-1 bg-white rounded-lg border border-[#EBE6DD] p-5 md:p-6 shadow-sm lg:sticky lg:top-28 space-y-6">
              <div className="flex items-center justify-between border-b border-[#F2EEE8] pb-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#A08149]" />
                  <h3 className="font-serif text-lg font-normal text-[#1A1918]">Filter Rooms</h3>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="text-[10px] uppercase font-semibold text-[#A08149] hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                )}
              </div>

              {/* DATE RANGE FILTER */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C8880] flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-[#A08149]" />
                  <span>STAY DATES</span>
                </label>
                
                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <span className="text-[10px] text-[#736F68] block mb-1">Check-in</span>
                    <input
                      type="date"
                      min={today}
                      value={checkInDate}
                      onChange={(e) => {
                        setCheckInDate(e.target.value);
                        if (checkOutDate && e.target.value >= checkOutDate) {
                          setCheckOutDate('');
                        }
                      }}
                      className="w-full bg-[#FAF8F5] border border-[#E2DDD5] rounded-md px-3 py-2 text-xs font-medium text-[#1A1918] focus:outline-none focus:border-[#C5A46D] cursor-pointer"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-[#736F68] block mb-1">Check-out</span>
                    <input
                      type="date"
                      min={checkInDate || today}
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#E2DDD5] rounded-md px-3 py-2 text-xs font-medium text-[#1A1918] focus:outline-none focus:border-[#C5A46D] cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* GUESTS FILTER */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C8880] block">
                  GUESTS CAPACITY
                </label>
                <select
                  value={selectedGuests}
                  onChange={(e) => setSelectedGuests(Number(e.target.value))}
                  className="w-full bg-[#FAF8F5] border border-[#E2DDD5] rounded-md px-3 py-2 text-xs font-medium text-[#1A1918] focus:outline-none focus:border-[#C5A46D] cursor-pointer"
                >
                  <option value={0}>Any Capacity</option>
                  <option value={1}>1 Guest</option>
                  <option value={2}>2 Guests</option>
                  <option value={3}>3 Guests</option>
                  <option value={4}>4+ Guests</option>
                </select>
              </div>

              {/* PRICE FILTER */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-[#8C8880]">
                  <span>MAX PRICE</span>
                  <span className="text-[#1A1918] font-mono text-xs">${maxPrice}</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={2000}
                  step={50}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#1A1918] cursor-pointer h-1.5 bg-[#E2DDD5] rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-[#8C8880] font-mono pt-1">
                  <span>$100</span>
                  <span>$2000</span>
                </div>
              </div>
            </aside>

            {/* RIGHT ROOMS GRID */}
            <div className="lg:col-span-3" id="sanctuaries-grid">
              {loading ? (
                <div className="flex items-center justify-center gap-2 text-xs text-[#8C8880] py-24 bg-white rounded-lg border border-[#EBE6DD]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading hotel rooms...</span>
                </div>
              ) : loadError ? (
                <div className="text-center text-xs text-red-700 bg-red-50 border border-red-200 rounded-md py-6">
                  {loadError}
                </div>
              ) : viewMode === 'all_rooms' ? (
                /* PHYSICAL ROOMS VIEW (#101, #102, #103...) */
                sortedPhysicalRooms.length === 0 ? (
                  <div className="text-center text-xs text-[#8C8880] py-24 bg-white rounded-lg border border-[#EBE6DD]">
                    No physical rooms match your selected filters right now.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sortedPhysicalRooms.map((room) => {
                      const rt = typeof room.roomTypeId === 'object' ? room.roomTypeId : null;
                      const roomTypeName = rt?.name ?? 'Standard Room';
                      const basePrice = rt?.basePrice ?? 120;
                      const capacity = rt?.capacity ?? 2;
                      const description = rt?.description ?? '';
                      const typeId = rt?._id ?? room._id;
                      const statusCfg = STATUS_CONFIG[room.status] ?? STATUS_CONFIG.available;
                      const isBookable = room.status === 'available' || room.status === 'reserved';

                      return (
                        <div
                          key={room._id}
                          className="bg-white rounded-lg border border-[#ECE7DF] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col justify-between"
                        >
                          <div>
                            {/* IMAGE & BADGES */}
                            <div className="relative h-48 sm:h-56 overflow-hidden bg-neutral-100">
                              <img
                                src={imageFor(typeId)}
                                alt={roomTypeName}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                loading="lazy"
                              />
                              {/* ROOM NUMBER BADGE */}
                              <div className="absolute top-3 left-3 bg-[#1A1918] text-white px-3 py-1 rounded-md text-xs font-bold font-mono shadow-md border border-white/20">
                                Room #{room.roomNumber}
                              </div>
                              {/* FLOOR BADGE */}
                              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-[#1A1918] px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shadow">
                                Floor {room.floor}
                              </div>
                              {/* STATUS BADGE */}
                              <div className={`absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                                {statusCfg.label}
                              </div>
                            </div>

                            {/* CARD DETAILS */}
                            <div className="p-5 space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h3 className="font-serif text-lg font-normal text-[#1A1918] group-hover:text-[#A08149] transition-colors">
                                    Room #{room.roomNumber} — {roomTypeName}
                                  </h3>
                                  <p className="text-[11px] text-[#A08149] font-medium">Floor Level {room.floor}</p>
                                </div>
                                <span className="text-[11px] text-[#736F68] flex items-center gap-1 shrink-0 bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#ECE7DF]">
                                  <Users className="w-3 h-3 text-[#A08149]" />
                                  <span>{capacity} Guests</span>
                                </span>
                              </div>

                              {description && (
                                <p className="text-xs text-[#736F68] line-clamp-2 leading-relaxed font-light">
                                  {description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* FOOTER & BUTTON */}
                          <div className="px-5 pb-5 pt-3 border-t border-[#F2EEE8] flex items-center justify-between gap-2">
                            <div>
                              <span className="text-[9px] uppercase tracking-widest text-[#8C8880] block font-semibold">RATE</span>
                              <div className="flex items-baseline gap-1">
                                <span className="font-serif text-base font-bold text-[#1A1918]">${basePrice}</span>
                                <span className="text-[10px] text-[#8C8880]">/ night</span>
                              </div>
                            </div>

                            {isBookable ? (
                              <Link
                                href={`/rooms/${typeId}${checkInDate && checkOutDate ? `?checkIn=${checkInDate}&checkOut=${checkOutDate}` : ''}`}
                                className="bg-[#1A1918] hover:bg-[#2C2A29] text-white text-[10px] font-bold tracking-[0.18em] uppercase px-4 py-2.5 rounded transition-all shadow-sm hover:shadow"
                              >
                                Reserve Room #{room.roomNumber}
                              </Link>
                            ) : (
                              <span className="bg-zinc-100 text-zinc-400 text-[10px] font-bold tracking-wider uppercase px-3 py-2 rounded cursor-not-allowed border border-zinc-200">
                                Currently Unavailable
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                /* ROOM CATEGORIES VIEW (Standard, Deluxe, Executive) */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {roomTypes.map((rt) => (
                    <div
                      key={rt._id}
                      className="bg-white rounded-lg border border-[#ECE7DF] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative h-48 sm:h-56 overflow-hidden bg-neutral-100">
                          <img
                            src={imageFor(rt._id)}
                            alt={rt.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-5 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-serif text-lg font-normal text-[#1A1918] group-hover:text-[#A08149] transition-colors">
                              {rt.name}
                            </h3>
                            <span className="text-[11px] text-[#736F68] flex items-center gap-1 shrink-0 bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#ECE7DF]">
                              <Users className="w-3 h-3 text-[#A08149]" />
                              <span>{rt.capacity} Guests</span>
                            </span>
                          </div>
                          {rt.description && (
                            <p className="text-xs text-[#736F68] line-clamp-2 leading-relaxed font-light">
                              {rt.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="px-5 pb-5 pt-3 border-t border-[#F2EEE8] flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[9px] uppercase tracking-widest text-[#8C8880] block font-semibold">STARTING FROM</span>
                          <div className="flex items-baseline gap-1">
                            <span className="font-serif text-base font-bold text-[#1A1918]">${rt.basePrice}</span>
                            <span className="text-[10px] text-[#8C8880]">/ night</span>
                          </div>
                        </div>
                        <Link
                          href={`/rooms/${rt._id}${checkInDate && checkOutDate ? `?checkIn=${checkInDate}&checkOut=${checkOutDate}` : ''}`}
                          className="bg-[#1A1918] hover:bg-[#2C2A29] text-white text-[10px] font-bold tracking-[0.18em] uppercase px-4 py-2.5 rounded transition-all shadow-sm hover:shadow"
                        >
                          View Category
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </section>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}