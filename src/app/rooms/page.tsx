'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Users, Loader2, Filter, RotateCcw, Calendar } from 'lucide-react';
import { ApiRoomType, ApiRoomImage, getAmenityIcon, fallbackImageFor } from '@/lib/rooms-data';
import Navbar from '../components/navbar';
import Footer from '../components/footer';

export default function RoomsPage() {
  const [roomTypes, setRoomTypes]   = useState<ApiRoomType[]>([]);
  const [images, setImages]         = useState<ApiRoomImage[]>([]);
  const [loading, setLoading]       = useState(true);
  const [loadError, setLoadError]   = useState<string | null>(null);

  // Filter States
  const [selectedGuests, setSelectedGuests] = useState<number>(0);
  const [maxPrice, setMaxPrice]             = useState<number>(2000);
  const [checkInDate, setCheckInDate]       = useState<string>('');
  const [checkOutDate, setCheckOutDate]     = useState<string>('');
  const [sortBy, setSortBy]                 = useState<string>('RECOMMENDED');

  // Today's date in YYYY-MM-DD for min date constraints
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    const params = new URLSearchParams();
    if (checkInDate) params.append('checkIn', checkInDate);
    if (checkOutDate) params.append('checkOut', checkOutDate);

    const roomTypesUrl = `/api/room-types${params.toString() ? `?${params.toString()}` : ''}`;

    Promise.all([
      fetch(roomTypesUrl, { signal: controller.signal }).then((res) => res.json()),
      fetch('/api/room-images', { signal: controller.signal }).then((res) => res.json()),
    ])
      .then(([roomTypesData, imagesData]) => {
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

  const filteredRooms = roomTypes.filter((room) => {
    if (selectedGuests > 0 && room.capacity < selectedGuests) return false;
    if (room.basePrice > maxPrice) return false;
    return true;
  });

  const sortedRooms = [...filteredRooms].sort((a, b) => {
    if (sortBy === 'PRICE_LOW')  return a.basePrice - b.basePrice;
    if (sortBy === 'PRICE_HIGH') return b.basePrice - a.basePrice;
    if (sortBy === 'NAME')       return a.name.localeCompare(b.name);
    return 0;
  });

  const handleResetFilters = () => {
    setSelectedGuests(0);
    setMaxPrice(2000);
    setCheckInDate('');
    setCheckOutDate('');
    setSortBy('RECOMMENDED');
  };

  const hasActiveFilters = selectedGuests > 0 || maxPrice < 2000 || checkInDate !== '' || checkOutDate !== '';

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-[#1A1918] font-sans antialiased flex flex-col justify-between">
      {/* NAVBAR */}
      <Navbar />

      <main className="flex-grow">
        {/* HERO BANNER */}
        <section
          className="relative h-[280px] md:h-[360px] bg-cover bg-center flex items-center justify-center text-center px-4 overflow-hidden mb-8 md:mb-12"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(15,15,15,0.45), rgba(15,15,15,0.65)),
              url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=2000')`
          }}
        >
          <div className="max-w-2xl mx-auto space-y-3 z-10 text-white">
            <span className="text-[10px] md:text-xs uppercase font-medium tracking-[0.25em] text-[#E0D5BE] block">
              THE ART OF FINE LIVING
            </span>
            <h1 className="font-serif text-3xl md:text-6xl font-normal tracking-tight">Our Rooms</h1>
            <div className="w-12 h-[1px] bg-[#C5A46D] mx-auto my-3" />
            <p className="text-xs md:text-base font-light text-[#ECE7DE] tracking-wide">
              Find Your Perfect Stay
            </p>
          </div>
        </section>

        {/* MAIN SECTION: LEFT SIDEBAR + RIGHT ROOMS GRID */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pb-16 md:pb-24">
          
          {/* HEADER BAR */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-8 gap-4 border-b border-[#EAE6DF] pb-6">
            <div className="max-w-xl space-y-1">
              <h2 className="font-serif text-2xl md:text-3xl font-normal tracking-tight text-[#1A1918]">
                Curated Sanctuaries
              </h2>
              <p className="text-xs text-[#736F68] font-light leading-relaxed">
                Each space at Velora is meticulously designed to offer a unique blend of coastal charm and modern luxury.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 md:gap-4 text-xs text-[#736F68] shrink-0 pt-2 md:pt-0">
              <span>Showing {sortedRooms.length} results</span>
              <span className="text-[#C5A46D]">|</span>
              <div className="flex items-center gap-1.5">
                <span>Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-[#1A1918] font-medium focus:outline-none cursor-pointer"
                >
                  <option value="RECOMMENDED">Recommended</option>
                  <option value="PRICE_LOW">Price: Low to High</option>
                  <option value="PRICE_HIGH">Price: High to Low</option>
                  <option value="NAME">Name</option>
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
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
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

              {/* SEARCH BUTTON */}
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('sanctuaries-grid');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full bg-[#B3935B] hover:bg-[#A08149] text-white rounded-md px-4 py-2.5 text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 shadow-sm transition-all pt-3"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Apply Filters</span>
              </button>
            </aside>

            {/* RIGHT ROOMS GRID */}
            <div className="lg:col-span-3" id="sanctuaries-grid">
              {loading ? (
                <div className="flex items-center justify-center gap-2 text-xs text-[#8C8880] py-24 bg-white rounded-lg border border-[#EBE6DD]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading rooms...</span>
                </div>
              ) : loadError ? (
                <div className="text-center text-xs text-red-700 bg-red-50 border border-red-200 rounded-md py-6">
                  {loadError}
                </div>
              ) : sortedRooms.length === 0 ? (
                <div className="text-center text-xs text-[#8C8880] py-24 bg-white rounded-lg border border-[#EBE6DD]">
                  No rooms match your selected filters right now.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sortedRooms.map((room) => (
                    <div
                      key={room._id}
                      className="bg-white rounded-lg border border-[#ECE7DF] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative h-48 sm:h-56 overflow-hidden bg-neutral-100">
                          <img
                            src={imageFor(room._id)}
                            alt={room.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-5 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-serif text-lg font-normal text-[#1A1918] group-hover:text-[#A08149] transition-colors">
                              {room.name}
                            </h3>
                            <span className="text-[11px] text-[#736F68] flex items-center gap-1 shrink-0 bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#ECE7DF]">
                              <Users className="w-3 h-3 text-[#A08149]" />
                              <span>{room.capacity} Guests</span>
                            </span>
                          </div>
                          {room.description && (
                            <p className="text-xs text-[#736F68] line-clamp-2 leading-relaxed font-light">
                              {room.description}
                            </p>
                          )}
                          {room.amenities.length > 0 && (
                            <div className="flex items-center gap-2 pt-1 flex-wrap">
                              {room.amenities.slice(0, 5).map((amenity) => (
                                <span
                                  key={amenity._id}
                                  title={amenity.name}
                                  className="p-1.5 rounded bg-[#FAF8F5] border border-[#ECE7DF] text-[#736F68]"
                                >
                                  {getAmenityIcon(amenity.icon)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="px-5 pb-5 pt-3 border-t border-[#F2EEE8] flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[9px] uppercase tracking-widest text-[#8C8880] block font-semibold">STARTING FROM</span>
                          <div className="flex items-baseline gap-1">
                            <span className="font-serif text-base font-bold text-[#1A1918]">${room.basePrice}</span>
                            <span className="text-[10px] text-[#8C8880]">/ night</span>
                          </div>
                        </div>
                        <Link
                          href={`/rooms/${room._id}${checkInDate && checkOutDate ? `?checkIn=${checkInDate}&checkOut=${checkOutDate}` : ''}`}
                          className="bg-[#1A1918] hover:bg-[#2C2A29] text-white text-[10px] font-bold tracking-[0.18em] uppercase px-4 py-2.5 rounded transition-all shadow-sm hover:shadow"
                        >
                          Details
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