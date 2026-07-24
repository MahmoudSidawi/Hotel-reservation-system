'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Users, Loader2 } from 'lucide-react';
import { ApiRoomType, ApiRoomImage, getAmenityIcon, fallbackImageFor } from '@/lib/rooms-data';
import Navbar from '../components/navbar';
import Footer from '../components/footer';

export default function RoomsPage() {
  const [roomTypes, setRoomTypes]   = useState<ApiRoomType[]>([]);
  const [images, setImages]         = useState<ApiRoomImage[]>([]);
  const [loading, setLoading]       = useState(true);
  const [loadError, setLoadError]   = useState<string | null>(null);

  const [selectedGuests, setSelectedGuests]     = useState<number>(0);
  const [maxPrice, setMaxPrice]                 = useState<number>(2000);
  const [sortBy, setSortBy]                     = useState<string>('RECOMMENDED');
  const [newsletterEmail, setNewsletterEmail]   = useState<string>('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState<boolean>(false);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      fetch('/api/room-types', { signal: controller.signal }).then((res) => res.json()),
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
  }, []);

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

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
      setTimeout(() => setNewsletterSubscribed(false), 4000);
      setNewsletterEmail('');
    }
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-[#1A1918] font-sans antialiased flex flex-col justify-between">
      {/* NAVBAR */}
      <Navbar />

      <main className="flex-grow">
        {/* HERO BANNER */}
        <section
          className="relative h-[340px] md:h-[420px] bg-cover bg-center flex items-center justify-center text-center px-4 overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(15,15,15,0.45), rgba(15,15,15,0.65)),
              url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=2000')`
          }}
        >
          <div className="max-w-2xl mx-auto space-y-3 z-10 text-white">
            <span className="text-[10px] md:text-xs uppercase font-medium tracking-[0.25em] text-[#E0D5BE] block">
              THE ART OF FINE LIVING
            </span>
            <h1 className="font-serif text-4xl md:text-6xl font-normal tracking-tight">Our Rooms</h1>
            <div className="w-12 h-[1px] bg-[#C5A46D] mx-auto my-3" />
            <p className="text-sm md:text-base font-light text-[#ECE7DE] tracking-wide">
              Find Your Perfect Stay
            </p>
          </div>
        </section>

        {/* FILTER BAR */}
        <section className="max-w-6xl mx-auto -mt-10 relative z-20 px-4 mb-16">
          <div className="bg-white rounded-lg shadow-xl border border-[#EBE6DD] p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C8880] block">GUESTS</label>
              <select
                value={selectedGuests}
                onChange={(e) => setSelectedGuests(Number(e.target.value))}
                className="w-full bg-[#FAF8F5] border border-[#E2DDD5] rounded-md px-3 py-2 text-xs font-medium text-[#1A1918] focus:outline-none focus:border-[#C5A46D] cursor-pointer"
              >
                <option value={0}>Any Guests</option>
                <option value={1}>1 Guest</option>
                <option value={2}>2 Guests</option>
                <option value={3}>3 Guests</option>
                <option value={4}>4+ Guests</option>
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-[#8C8880]">
                <span>PRICE RANGE</span>
                <span className="text-[#1A1918] font-mono">${maxPrice}</span>
              </div>
              <input
                type="range"
                min={100} max={2000} step={50}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#1A1918] cursor-pointer h-1.5 bg-[#E2DDD5] rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('sanctuaries-grid');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full bg-[#B3935B] hover:bg-[#A08149] text-white rounded-md px-4 py-2 text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 shadow-sm transition-all md:mt-4"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Find Rooms</span>
              </button>
            </div>
          </div>
        </section>

        {/* ROOMS GRID */}
        <section id="sanctuaries-grid" className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 border-b border-[#EAE6DF] pb-6">
            <div className="max-w-2xl space-y-2">
              <h2 className="font-serif text-3xl md:text-4xl font-normal tracking-tight text-[#1A1918]">
                Curated Sanctuaries
              </h2>
              <p className="text-xs md:text-sm text-[#736F68] font-light leading-relaxed">
                Each space at Velora is meticulously designed to offer a unique blend of coastal charm and modern luxury.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-[#736F68] shrink-0">
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

          {loading ? (
            <div className="flex items-center justify-center gap-2 text-xs text-[#8C8880] py-24">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading rooms...</span>
            </div>
          ) : loadError ? (
            <div className="text-center text-xs text-red-700 bg-red-50 border border-red-200 rounded-md py-6">
              {loadError}
            </div>
          ) : sortedRooms.length === 0 ? (
            <div className="text-center text-xs text-[#8C8880] py-24">
              No rooms match your filters right now.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedRooms.map((room) => (
                <div
                  key={room._id}
                  className="bg-white rounded-lg border border-[#ECE7DF] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-60 overflow-hidden bg-neutral-100">
                      <img
                        src={imageFor(room._id)}
                        alt={room.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-serif text-xl font-normal text-[#1A1918] group-hover:text-[#A08149] transition-colors">
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
                        <div className="flex items-center gap-3 pt-1">
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
                  <div className="px-6 pb-6 pt-2 border-t border-[#F2EEE8] flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-[#8C8880] block font-semibold">STARTING FROM</span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-serif text-lg font-bold text-[#1A1918]">${room.basePrice}</span>
                        <span className="text-[10px] text-[#8C8880]">/ night</span>
                      </div>
                    </div>
                    <Link
                      href={`/rooms/${room._id}`}
                      className="bg-[#1A1918] hover:bg-[#2C2A29] text-white text-[10px] font-bold tracking-[0.18em] uppercase px-5 py-2.5 rounded transition-all shadow-sm hover:shadow"
                    >
                    Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* NEWSLETTER */}
        <section className="bg-[#FAF8F5] border-t border-[#EAE6DF] py-20 px-6 text-center">
          <div className="max-w-xl mx-auto space-y-4">
            <h2 className="font-serif text-3xl font-normal text-[#1A1918]">The Velora Collection</h2>
            <p className="text-xs text-[#736F68] font-light leading-relaxed">
              Join our list to receive exclusive offers, seasonal updates, and priority booking for our signature suites.
            </p>
            {newsletterSubscribed ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-xs font-medium">
                Thank you for subscribing to The Velora Collection.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-1 bg-[#F2EEE8] border border-[#E2DDD5] rounded px-4 py-2.5 text-xs text-[#1A1918] placeholder-[#8C8880] focus:outline-none focus:border-[#C5A46D]"
                />
                <button
                  type="submit"
                  className="bg-[#1A1918] hover:bg-[#2C2A29] text-white text-xs font-bold uppercase tracking-[0.18em] px-6 py-2.5 rounded transition-colors"
                >
                  SUBSCRIBE
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
