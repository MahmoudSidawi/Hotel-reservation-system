'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, Users, BedDouble, Star, Calendar,
  Maximize2, Info, CheckCircle2, CreditCard, X, CheckCircle
} from 'lucide-react';
import { VELORA_ROOMS, getAmenityIcon, type VeloraRoom, type BookingDetails } from '@/lib/rooms-data';

// ============================================================================
// BOOKING MODAL
// ============================================================================
function BookingModal({
  room,
  bookingDetails,
  onClose,
}: {
  room: VeloraRoom;
  bookingDetails: BookingDetails;
  onClose: () => void;
}) {
  const [guestName, setGuestName]             = useState('');
  const [guestEmail, setGuestEmail]           = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isConfirmed, setIsConfirmed]         = useState(false);
  const [resCode, setResCode]                 = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = 'RES-' + Math.floor(1000 + Math.random() * 9000);
    setResCode(code);
    setIsConfirmed(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FAF8F5] rounded-xl border border-[#E2DDD5] max-w-lg w-full overflow-hidden shadow-2xl">
        <div className="bg-[#18181B] text-white p-6 flex items-center justify-between border-b border-[#27272A]">
          <div>
            <span className="text-[9px] uppercase tracking-[0.2em] text-[#C5A46D] font-bold block">
              VELORA LUXURY RESORT
            </span>
            <h3 className="font-serif text-xl font-normal text-white mt-1">
              {isConfirmed ? 'Reservation Confirmed' : 'Complete Your Reservation'}
            </h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isConfirmed ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center mx-auto text-emerald-700">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h4 className="font-serif text-2xl font-normal text-[#1A1918]">
                We look forward to welcoming you, {guestName}!
              </h4>
              <p className="text-xs text-[#6E6B65]">
                Your booking reference is{' '}
                <span className="font-mono font-bold text-[#1A1918] bg-[#EAE2D5] px-2 py-0.5 rounded">
                  {resCode}
                </span>
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-[#E2DDD5] text-left text-xs space-y-2 text-[#5C5954]">
              <div className="flex justify-between border-b border-[#F2EEE8] pb-2">
                <span className="font-semibold text-[#1A1918]">Accommodation</span>
                <span>{room.title}</span>
              </div>
              <div className="flex justify-between border-b border-[#F2EEE8] pb-2">
                <span className="font-semibold text-[#1A1918]">Dates</span>
                <span>{bookingDetails.checkIn} → {bookingDetails.checkOut} ({bookingDetails.nights} nights)</span>
              </div>
              <div className="flex justify-between border-b border-[#F2EEE8] pb-2">
                <span className="font-semibold text-[#1A1918]">Guests</span>
                <span>{bookingDetails.guests} Guests</span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-bold text-[#1A1918]">
                <span>Total Amount Payable</span>
                <span className="font-serif text-base">${bookingDetails.total}</span>
              </div>
            </div>
            <p className="text-[11px] text-[#8C8880]">
              A confirmation email has been dispatched to{' '}
              <span className="font-medium text-[#1A1918]">{guestEmail}</span>.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-[#1A1918] hover:bg-[#2C2A29] text-white text-xs font-bold uppercase tracking-[0.2em] py-3 rounded transition-colors"
            >
              Return to Rooms
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
            <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-[#E2DDD5]">
              <img src={room.heroImage} alt={room.title} className="w-16 h-16 object-cover rounded" />
              <div className="space-y-1">
                <h4 className="font-serif text-base font-semibold text-[#1A1918]">{room.title}</h4>
                <div className="flex items-center gap-3 text-[11px] text-[#6E6B65]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#A08149]" />
                    <span>{bookingDetails.nights} Nights</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-[#A08149]" />
                    <span>{bookingDetails.guests} Guests</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C8880] block mb-1">FULL NAME</label>
                <input
                  type="text" required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Eleanor Vance"
                  className="w-full bg-white border border-[#E2DDD5] rounded px-3 py-2 text-xs text-[#1A1918] focus:outline-none focus:border-[#C5A46D]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C8880] block mb-1">EMAIL ADDRESS</label>
                <input
                  type="email" required
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="e.vance@example.com"
                  className="w-full bg-white border border-[#E2DDD5] rounded px-3 py-2 text-xs text-[#1A1918] focus:outline-none focus:border-[#C5A46D]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C8880] block mb-1">SPECIAL REQUESTS (OPTIONAL)</label>
                <textarea
                  rows={2}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="High floor, champagne on arrival..."
                  className="w-full bg-white border border-[#E2DDD5] rounded px-3 py-2 text-xs text-[#1A1918] focus:outline-none focus:border-[#C5A46D]"
                />
              </div>
            </div>

            <div className="bg-[#F2ECE1] p-3.5 rounded border border-[#E2DDD5] flex justify-between items-center">
              <span className="font-semibold text-[#1A1918]">Total Payable Due at Check-In:</span>
              <span className="font-serif text-lg font-bold text-[#1A1918]">${bookingDetails.total}</span>
            </div>

            <button
              type="submit"
              className="w-full bg-[#1A1918] hover:bg-[#2C2A29] text-white font-bold tracking-[0.2em] text-xs uppercase py-3.5 rounded transition-all shadow-md flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4 text-[#C5A46D]" />
              <span>CONFIRM RESERVATION</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// ROOM DETAIL PAGE — /rooms/[id]
// ============================================================================
export default function RoomDetailPage() {
  const params    = useParams();
  const roomId    = params?.id as string;
  const room      = VELORA_ROOMS.find((r) => r.id === roomId) ?? VELORA_ROOMS[0];

  const [checkInDate, setCheckInDate]         = useState('2026-10-24');
  const [checkOutDate, setCheckOutDate]       = useState('2026-10-27');
  const [guestsCount, setGuestsCount]         = useState(2);
  const [activePhotoModal, setActivePhotoModal] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen]         = useState(false);
  const [modalDetails, setModalDetails]       = useState<BookingDetails | null>(null);

  const calculateNights = (): number => {
    try {
      const d1 = new Date(checkInDate);
      const d2 = new Date(checkOutDate);
      const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 1;
    } catch { return 3; }
  };

  const nightsCount   = calculateNights();
  const roomSubtotal  = room.pricePerNight * nightsCount;
  const serviceFee    = 120;
  const grandTotal    = roomSubtotal + serviceFee;

  const handleReserve = () => {
    setModalDetails({
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: guestsCount,
      nights: nightsCount,
      total: grandTotal,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-[#1A1918] font-sans antialiased">

      {/* BACK BAR */}
      <div className="bg-[#18181B] border-b border-[#27272A] px-6 md:px-12 py-2.5">
        <Link
          href="/rooms"
          className="text-xs text-[#A09C94] hover:text-white flex items-center gap-2 transition-colors group w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Our Rooms</span>
        </Link>
      </div>

      {/* HERO */}
      <section
        className="relative h-[380px] md:h-[480px] bg-cover bg-center flex items-end justify-start p-6 md:p-16 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to top, rgba(15,15,15,0.85), rgba(15,15,15,0.3)), url('${room.heroImage}')`
        }}
      >
        <div className="max-w-4xl space-y-3 z-10 text-white">
          <span className="bg-[#C5A46D] text-[#1A1918] text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded inline-block">
            {room.badge}
          </span>
          <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-normal tracking-tight">{room.title}</h1>
          <div className="flex flex-wrap items-center gap-6 text-xs text-[#E5DFD5] font-light">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#C5A46D]" />
              Up to {room.guestsMax} Guests
            </span>
            <span className="text-[#C5A46D]">•</span>
            <span className="flex items-center gap-1.5">
              <BedDouble className="w-4 h-4 text-[#C5A46D]" />
              {room.bedDetails}
            </span>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-7 space-y-12">

            {/* Description */}
            <div className="space-y-6">
              <h2 className="font-serif text-2xl md:text-3xl font-normal text-[#1A1918]">
                A Sanctuary of Timeless Elegance
              </h2>
              <div className="space-y-4 text-xs md:text-sm text-[#5C5954] leading-relaxed font-light">
                {room.longDescription.map((p, idx) => <p key={idx}>{p}</p>)}
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#EAE6DF]">
                <div className="bg-white p-4 rounded border border-[#ECE7DF] space-y-1">
                  <span className="text-[9px] uppercase tracking-widest text-[#8C8880] block font-bold">SIZE</span>
                  <p className="text-xs font-semibold text-[#1A1918]">{room.sizeSqFt} sq ft / {room.sizeSqM} m²</p>
                </div>
                <div className="bg-white p-4 rounded border border-[#ECE7DF] space-y-1">
                  <span className="text-[9px] uppercase tracking-widest text-[#8C8880] block font-bold">OCCUPANCY</span>
                  <p className="text-xs font-semibold text-[#1A1918]">{room.guestsMax} Adults Max</p>
                </div>
                <div className="bg-white p-4 rounded border border-[#ECE7DF] space-y-1">
                  <span className="text-[9px] uppercase tracking-widest text-[#8C8880] block font-bold">VIEW</span>
                  <p className="text-xs font-semibold text-[#1A1918]">{room.view}</p>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-6 pt-6 border-t border-[#EAE6DF]">
              <div className="flex items-center gap-4">
                <h3 className="font-serif text-xl font-normal text-[#1A1918] shrink-0">Curated Amenities</h3>
                <div className="h-[1px] bg-[#EAE6DF] w-full" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {room.amenities.map((item, idx) => (
                  <div key={idx} className="bg-[#F4F1EA] rounded-md p-3.5 flex items-center gap-3 border border-[#E8E3DA]">
                    <div className="p-1.5 rounded bg-white shrink-0">{getAmenityIcon(item.iconName)}</div>
                    <span className="text-xs font-medium text-[#2C2A29]">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gallery */}
            <div className="space-y-6 pt-6 border-t border-[#EAE6DF]">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-normal text-[#1A1918]">The Experience in Detail</h3>
                <button
                  onClick={() => setActivePhotoModal(room.heroImage)}
                  className="bg-white hover:bg-[#F4F1EA] border border-[#E2DDD5] text-[#1A1918] text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded flex items-center gap-1.5"
                >
                  <Maximize2 className="w-3 h-3 text-[#A08149]" />
                  <span>View All Photos</span>
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {room.galleryImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActivePhotoModal(img)}
                    className="h-28 rounded-md overflow-hidden cursor-pointer group relative border border-[#E8E3DA] bg-neutral-200"
                  >
                    <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Maximize2 className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Info */}
            <div className="bg-[#F2ECE1] p-6 rounded-lg border border-[#E2DDD5] space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1918] flex items-center gap-2">
                <Info className="w-4 h-4 text-[#A08149]" />
                IMPORTANT INFORMATION
              </h4>
              <ul className="space-y-2 text-xs text-[#5C5954] font-light">
                {(room.importantInfo ?? [
                  'Check-in from 3:00 PM; Check-out before 11:00 AM.',
                  'Flexible cancellation up to 48 hours prior to arrival.',
                ]).map((info, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#A08149] shrink-0 mt-0.5" />
                    <span>{info}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* RIGHT STICKY BOOKING CARD */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="bg-white rounded-lg border border-[#E2DDD5] shadow-2xl overflow-hidden">
              <div className="bg-[#18181B] text-white p-6 space-y-2">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-3xl font-bold">${room.pricePerNight}</span>
                    <span className="text-xs text-[#A09C94]">/ NIGHT</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#E5DFD5]">
                    <Star className="w-3.5 h-3.5 fill-[#C5A46D] text-[#C5A46D]" />
                    <span className="font-bold">{room.rating}</span>
                    <span className="text-[#A09C94]">({room.reviewsCount} REVIEWS)</span>
                  </div>
                </div>
                <p className="text-[11px] text-[#A09C94] font-light">Best price guaranteed for your stay</p>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 bg-[#FAF8F5] border border-[#E2DDD5] rounded-md overflow-hidden text-xs">
                  <div className="p-3 border-r border-[#E2DDD5] space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-[#8C8880] block">CHECK-IN</label>
                    <div className="flex items-center gap-1.5 text-[#1A1918]">
                      <Calendar className="w-3.5 h-3.5 text-[#A08149]" />
                      <input
                        type="date"
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        className="bg-transparent font-medium focus:outline-none cursor-pointer w-full text-xs"
                      />
                    </div>
                  </div>
                  <div className="p-3 space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-[#8C8880] block">CHECK-OUT</label>
                    <div className="flex items-center gap-1.5 text-[#1A1918]">
                      <Calendar className="w-3.5 h-3.5 text-[#A08149]" />
                      <input
                        type="date"
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        className="bg-transparent font-medium focus:outline-none cursor-pointer w-full text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-[#8C8880] block">GUESTS</label>
                  <select
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(Number(e.target.value))}
                    className="w-full bg-[#FAF8F5] border border-[#E2DDD5] rounded-md p-3 text-xs font-medium text-[#1A1918] focus:outline-none focus:border-[#C5A46D] cursor-pointer"
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3 pt-2 text-xs text-[#5C5954]">
                  <div className="flex justify-between">
                    <span>${room.pricePerNight} × {nightsCount} nights</span>
                    <span className="font-medium text-[#1A1918]">${roomSubtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Resort & Service Fee</span>
                    <span className="font-medium text-[#1A1918]">${serviceFee}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-[#EAE6DF] font-bold text-sm text-[#1A1918]">
                    <span>Total</span>
                    <span className="font-serif text-lg">${grandTotal}</span>
                  </div>
                </div>

                <button
                  onClick={handleReserve}
                  className="w-full bg-[#1A1918] hover:bg-[#2C2A29] text-white font-bold tracking-[0.2em] text-xs uppercase py-4 rounded transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4 text-[#C5A46D]" />
                  <span>RESERVE NOW</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PHOTO LIGHTBOX */}
      {activePhotoModal && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <button
            onClick={() => setActivePhotoModal(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>
          <img src={activePhotoModal} alt="Expanded view" className="max-w-full max-h-[85vh] object-contain rounded" />
        </div>
      )}

      {/* BOOKING MODAL */}
      {isModalOpen && modalDetails && (
        <BookingModal
          room={room}
          bookingDetails={modalDetails}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
