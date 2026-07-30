'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Users, BedDouble, Calendar,
  Info, CheckCircle2, CreditCard, X, CheckCircle, Loader2
} from 'lucide-react';
import {
  ApiRoomType, ApiRoomImage, getAmenityIcon, fallbackImageFor, type BookingDetails,
} from '@/lib/rooms-data';
import { useAuth } from '@/context/AuthContext';
import { nightsBetween, todayISO } from '@/lib/dates';
import { priceQuote } from '@/lib/pricing';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';

type CurrentUser = { id: string; name: string; email: string; role: string };

// ============================================================================
// BOOKING MODAL
// ============================================================================
function BookingModal({
  roomType,
  roomTypeId,
  user,
  bookingDetails,
  onClose,
}: {
  roomType: ApiRoomType;
  roomTypeId: string;
  user: CurrentUser;
  bookingDetails: BookingDetails;
  onClose: () => void;
}) {
  const [modalCheckIn, setModalCheckIn]       = useState(bookingDetails.checkIn);
  const [modalCheckOut, setModalCheckOut]     = useState(bookingDetails.checkOut);
  const [modalGuests, setModalGuests]         = useState(bookingDetails.guests);
  const [paymentMethod, setPaymentMethod]     = useState('check_in');
  const [specialRequests, setSpecialRequests] = useState('');
  const [submitting, setSubmitting]           = useState(false);
  const [submitError, setSubmitError]         = useState<string | null>(null);
  const [confirmation, setConfirmation]       = useState<{ id: string; total: number } | null>(null);

  const calculatedNights = useMemo(
    () => nightsBetween(modalCheckIn, modalCheckOut),
    [modalCheckIn, modalCheckOut]
  );

  const basePricePerNight = roomType.basePrice || 500;
  const { subtotal: roomSubtotal, taxes: taxesAndFees, total: grandTotal } = priceQuote(
    basePricePerNight,
    calculatedNights
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    if (calculatedNights <= 0) {
      setSubmitError("Check-out date must strictly occur after check-in date.");
      setSubmitting(false);
      return;
    }

    try {
      const params = new URLSearchParams({
        checkIn: modalCheckIn,
        checkOut: modalCheckOut,
        roomTypeId,
      });
      const availableRes = await fetch(`/api/rooms/available?${params.toString()}`);
      const availableRooms = await availableRes.json();
      if (!availableRes.ok) {
        throw new Error(availableRooms.error ?? 'Failed to check room availability');
      }
      if (!Array.isArray(availableRooms) || availableRooms.length === 0) {
        throw new Error('No rooms of this type are available for the selected dates.');
      }
      const roomId = availableRooms[0]._id as string;

      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          checkIn: modalCheckIn,
          checkOut: modalCheckOut,
          guests: Number(modalGuests),
          totalPrice: grandTotal,
          specialRequests: specialRequests || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Reservation failed');

      // Trust the server's authoritative total, not the client estimate.
      setConfirmation({ id: String(data._id), total: Number(data.totalPrice ?? grandTotal) });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Reservation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FAF8F5] rounded-xl border border-[#E2DDD5] max-w-lg w-full overflow-hidden shadow-2xl my-8">
        <div className="bg-[#18181B] text-white p-5 flex items-center justify-between border-b border-[#27272A]">
          <div>
            <span className="text-[9px] uppercase tracking-[0.2em] text-[#C5A46D] font-bold block">
              VELORA LUXURY RESORT
            </span>
            <h3 className="font-serif text-lg font-normal text-white mt-0.5">
              {confirmation ? 'Reservation Confirmed' : 'Complete Your Reservation'}
            </h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmation ? (
          <div className="p-6 text-center space-y-5">
            <div className="w-14 h-14 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center mx-auto text-emerald-700">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif text-xl font-normal text-[#1A1918]">
                We look forward to welcoming you, {user.name}!
              </h4>
              <p className="text-xs text-[#6E6B65]">
                Booking Reference:{' '}
                <span className="font-mono font-bold text-[#1A1918] bg-[#EAE2D5] px-2 py-0.5 rounded">
                  {confirmation.id}
                </span>
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-[#E2DDD5] text-left text-xs space-y-2 text-[#5C5954]">
              <div className="flex justify-between border-b border-[#F2EEE8] pb-2">
                <span className="font-semibold text-[#1A1918]">Accommodation</span>
                <span>{roomType.name}</span>
              </div>
              <div className="flex justify-between border-b border-[#F2EEE8] pb-2">
                <span className="font-semibold text-[#1A1918]">Dates</span>
                <span>{modalCheckIn} → {modalCheckOut} ({calculatedNights} nights)</span>
              </div>
              <div className="flex justify-between border-b border-[#F2EEE8] pb-2">
                <span className="font-semibold text-[#1A1918]">Guests</span>
                <span>{modalGuests} Guests</span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-bold text-[#1A1918]">
                <span>Total Amount Payable</span>
                <span className="font-serif text-base">${confirmation.total.toLocaleString()}</span>
              </div>
            </div>
            <p className="text-[11px] text-[#8C8880]">
              Confirmation saved to your account (<span className="font-medium text-[#1A1918]">{user.email}</span>).
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="/reservations"
                className="w-full bg-[#1A1918] hover:bg-[#2C2A29] text-white text-xs font-bold uppercase tracking-[0.2em] py-3 rounded transition-colors text-center"
              >
                View My Reservations
              </Link>
              <button
                onClick={onClose}
                className="w-full bg-white hover:bg-[#F2ECE1] border border-[#E2DDD5] text-[#1A1918] text-xs font-bold uppercase tracking-[0.2em] py-3 rounded transition-colors"
              >
                Return to Room
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            {/* Header Suite Summary */}
            <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-[#E2DDD5]">
              <div className="space-y-0.5">
                <h4 className="font-serif text-base font-semibold text-[#1A1918]">{roomType.name}</h4>
                <p className="text-[11px] text-[#6E6B65]">
                  ${basePricePerNight} / night • Max {roomType.capacity} Guests
                </p>
              </div>
            </div>

            {/* Dates & Guests Controls */}
            <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-lg border border-[#E2DDD5]">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C8880] block mb-1">
                  CHECK-IN DATE
                </label>
                <input
                  type="date"
                  required
                  min={todayISO()}
                  value={modalCheckIn}
                  onChange={(e) => {
                    setModalCheckIn(e.target.value);
                    if (modalCheckOut && e.target.value >= modalCheckOut) setModalCheckOut('');
                  }}
                  className="w-full bg-[#FAF8F5] border border-[#E2DDD5] rounded px-2.5 py-1.5 text-xs text-[#1A1918] focus:outline-none focus:border-[#C5A46D]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C8880] block mb-1">
                  CHECK-OUT DATE
                </label>
                <input
                  type="date"
                  required
                  min={modalCheckIn || todayISO()}
                  value={modalCheckOut}
                  onChange={(e) => setModalCheckOut(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E2DDD5] rounded px-2.5 py-1.5 text-xs text-[#1A1918] focus:outline-none focus:border-[#C5A46D]"
                />
              </div>
              <div className="col-span-2 flex items-center justify-between pt-1 border-t border-[#F2EEE8]">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C8880]">
                  GUEST COUNT
                </label>
                <select
                  value={modalGuests}
                  onChange={(e) => setModalGuests(Number(e.target.value))}
                  className="bg-[#FAF8F5] border border-[#E2DDD5] rounded px-3 py-1 text-xs text-[#1A1918] focus:outline-none focus:border-[#C5A46D]"
                >
                  {Array.from({ length: roomType.capacity }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? "Guest" : "Guests"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Guest Details & Staff Warning */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C8880] block mb-1">
                RESERVATION OWNER
              </label>
              <div className="w-full bg-white border border-[#E2DDD5] rounded px-3 py-2 text-xs text-[#1A1918] flex items-center justify-between">
                <div>
                  <span className="font-semibold">{user.name}</span>{" "}
                  <span className="text-[#8C8880]">({user.email})</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-300">
                  {user.role}
                </span>
              </div>
              {(user.role === "admin" || user.role === "receptionist") && (
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 space-y-2">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Info className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Logged in as Staff ({user.role.toUpperCase()})</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-normal">
                    This reservation will be created under <strong>{user.name} ({user.email})</strong>. If you intend to book under a guest account (e.g. Mohammad), please log out first.
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      await fetch('/api/auth/logout', { method: 'POST' });
                      window.location.href = '/login';
                    }}
                    className="inline-block px-3 py-1.5 bg-amber-900 text-white text-[10px] font-bold uppercase tracking-wider rounded hover:bg-black transition-colors"
                  >
                    Log Out & Switch to Guest Account
                  </button>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C8880] block mb-1">
                PAYMENT METHOD
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-white border border-[#E2DDD5] rounded px-3 py-2 text-xs text-[#1A1918] focus:outline-none focus:border-[#C5A46D]"
              >
                <option value="check_in">Pay at Front Desk upon Check-In</option>
                <option value="card_guarantee">Credit / Debit Card (Guarantee)</option>
              </select>
            </div>

            {/* Special Requests */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C8880] block mb-1">
                SPECIAL REQUESTS (OPTIONAL)
              </label>
              <textarea
                rows={2}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Late check-in, high floor, quiet room..."
                className="w-full bg-white border border-[#E2DDD5] rounded px-3 py-2 text-xs text-[#1A1918] focus:outline-none focus:border-[#C5A46D]"
              />
            </div>

            {/* Financial Calculation Breakdown */}
            <div className="bg-[#F2ECE1] p-3.5 rounded border border-[#E2DDD5] space-y-1.5">
              <div className="flex justify-between text-xs text-[#6E6B65]">
                <span>${basePricePerNight} × {calculatedNights} Nights</span>
                <span>${roomSubtotal}</span>
              </div>
              <div className="flex justify-between text-xs text-[#6E6B65]">
                <span>Taxes & Resort Service Fees (12%)</span>
                <span>${taxesAndFees}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#E2DDD5]">
                <span className="font-bold text-[#1A1918]">Total Payable Amount:</span>
                <span className="font-serif text-lg font-bold text-[#1A1918]">${grandTotal}</span>
              </div>
            </div>

            {/* Detailed Backend Error Display */}
            {submitError && (
              <div className="text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2.5 rounded flex items-start gap-2">
                <span className="font-bold">Error:</span>
                <span>{submitError}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#1A1918] hover:bg-[#2C2A29] text-white font-bold tracking-[0.2em] text-xs uppercase py-3.5 rounded transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4 text-[#C5A46D]" />
              )}
              <span>{submitting ? 'CONFIRMING...' : 'CONFIRM RESERVATION'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// ROOM DETAIL PAGE
// ============================================================================
export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roomTypeId = params?.id as string;

  const { user: authUser, loading: authLoading } = useAuth();
  const user = authUser ? { id: authUser.id, name: authUser.name, email: authUser.email, role: authUser.role } : null;
  const authChecked = !authLoading;

  const [roomType, setRoomType]   = useState<ApiRoomType | null>(null);
  const [images, setImages]       = useState<ApiRoomImage[]>([]);
  const [loading, setLoading]     = useState(true);
  const [notFound, setNotFound]   = useState(false);

  const [checkInDate, setCheckInDate] = useState(() => {
    const inDate = new Date();
    inDate.setDate(inDate.getDate() + 7);
    return inDate.toISOString().slice(0, 10);
  });
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const outDate = new Date();
    outDate.setDate(outDate.getDate() + 10);
    return outDate.toISOString().slice(0, 10);
  });
  const [guestsCount, setGuestsCount]         = useState(2);
  const [activePhotoModal, setActivePhotoModal] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen]         = useState(false);
  const [modalDetails, setModalDetails]       = useState<BookingDetails | null>(null);
  const [availabilityNotice, setAvailabilityNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!roomTypeId) return;
    let cancelled = false;
    const controller = new AbortController();

    setLoading(true);
    setNotFound(false);
    setRoomType(null);

    fetch(`/api/room-types/${roomTypeId}`, { signal: controller.signal })
      .then(async (res) => {
        if (res.status === 404) {
          if (!cancelled) setNotFound(true);
          return null;
        }
        if (!res.ok) throw new Error('Failed to load room');
        return res.json();
      })
      .then((data: ApiRoomType | null) => {
        if (!cancelled && data) setRoomType(data);
      })
      .catch((err) => {
        if (!cancelled && err.name !== 'AbortError') setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    fetch(`/api/room-images?roomTypeId=${roomTypeId}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setImages(Array.isArray(data) ? data : []);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [roomTypeId]);

  const galleryImages = useMemo(() => {
    if (images.length === 0) return [fallbackImageFor(roomTypeId ?? 'room')];
    const sorted = [...images].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
    return sorted.map((img) => img.imageUrl);
  }, [images, roomTypeId]);

  const heroImage = galleryImages[0];

  const nightsCount  = nightsBetween(checkInDate, checkOutDate);
  const { subtotal: roomSubtotal, taxes: serviceFee, total: grandTotal } = priceQuote(
    roomType?.basePrice ?? 0,
    nightsCount
  );

  const handleReserve = async () => {
    if (!roomType) return;
    setAvailabilityNotice(null);

    if (!authChecked) return;
    if (!user) {
      const targetRoomUrl = encodeURIComponent(`/rooms/${roomTypeId}`);
      router.push(`/login?callbackUrl=${targetRoomUrl}`);
      return;
    }

    if (nightsCount <= 0) {
      setAvailabilityNotice('Please select a valid check-in and check-out date.');
      return;
    }

    const params = new URLSearchParams({ checkIn: checkInDate, checkOut: checkOutDate, roomTypeId });
    const res = await fetch(`/api/rooms/available?${params.toString()}`);
    const rooms = await res.json();
    if (!res.ok || !Array.isArray(rooms) || rooms.length === 0) {
      setAvailabilityNotice('No rooms of this type are available for those dates. Try different dates.');
      return;
    }

    setModalDetails({
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: guestsCount,
      nights: nightsCount,
      total: grandTotal,
    });
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="bg-[#FAF8F5] min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center gap-2 text-xs text-[#8C8880]">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading room...</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (notFound || !roomType) {
    return (
      <div className="bg-[#FAF8F5] min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center gap-4 text-center px-4">
          <h1 className="font-serif text-2xl text-[#1A1918]">Room not found</h1>
          <p className="text-xs text-[#736F68]">This room may no longer be available.</p>
          <Link href="/rooms" className="text-xs font-bold uppercase tracking-widest text-[#A08149] hover:underline">
            Back to Our Rooms
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-[#1A1918] font-sans antialiased">
      <Navbar />
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
          backgroundImage: `linear-gradient(to top, rgba(15,15,15,0.85), rgba(15,15,15,0.3)), url('${heroImage}')`
        }}
      >
        <div className="max-w-4xl space-y-3 z-10 text-white">
          <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-normal tracking-tight">{roomType.name}</h1>
          <div className="flex flex-wrap items-center gap-6 text-xs text-[#E5DFD5] font-light">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#C5A46D]" />
              Up to {roomType.capacity} Guests
            </span>
            <span className="text-[#C5A46D]">•</span>
            <span className="flex items-center gap-1.5">
              <BedDouble className="w-4 h-4 text-[#C5A46D]" />
              ${roomType.basePrice} / night
            </span>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-7 space-y-12">
            <div className="space-y-6">
              <h2 className="font-serif text-2xl md:text-3xl font-normal text-[#1A1918]">
                A Sanctuary of Timeless Elegance
              </h2>
              {roomType.description && (
                <p className="text-xs md:text-sm text-[#5C5954] leading-relaxed font-light">
                  {roomType.description}
                </p>
              )}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#EAE6DF]">
                <div className="bg-white p-4 rounded border border-[#ECE7DF] space-y-1">
                  <span className="text-[9px] uppercase tracking-widest text-[#8C8880] block font-bold">CAPACITY</span>
                  <p className="text-xs font-semibold text-[#1A1918]">{roomType.capacity} Guests Max</p>
                </div>
                <div className="bg-white p-4 rounded border border-[#ECE7DF] space-y-1">
                  <span className="text-[9px] uppercase tracking-widest text-[#8C8880] block font-bold">RATE</span>
                  <p className="text-xs font-semibold text-[#1A1918]">${roomType.basePrice} / night</p>
                </div>
                <div className="bg-white p-4 rounded border border-[#ECE7DF] space-y-1">
                  <span className="text-[9px] uppercase tracking-widest text-[#8C8880] block font-bold">AMENITIES</span>
                  <p className="text-xs font-semibold text-[#1A1918]">{roomType.amenities.length} Included</p>
                </div>
              </div>
            </div>

            {/* Amenities */}
            {roomType.amenities.length > 0 && (
              <div className="space-y-6 pt-6 border-t border-[#EAE6DF]">
                <div className="flex items-center gap-4">
                  <h3 className="font-serif text-xl font-normal text-[#1A1918] shrink-0">Curated Amenities</h3>
                  <div className="h-[1px] bg-[#EAE6DF] w-full" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {roomType.amenities.map((item) => (
                    <div key={item._id} className="bg-[#F4F1EA] rounded-md p-3.5 flex items-center gap-3 border border-[#E8E3DA]">
                      <div className="p-1.5 rounded bg-white shrink-0">{getAmenityIcon(item.icon)}</div>
                      <span className="text-xs font-medium text-[#2C2A29]">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery */}
            {galleryImages.length > 1 && (
              <div className="space-y-6 pt-6 border-t border-[#EAE6DF]">
                <h3 className="font-serif text-xl font-normal text-[#1A1918]">The Experience in Detail</h3>
                <div className="grid grid-cols-3 gap-3">
                  {galleryImages.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActivePhotoModal(img)}
                      className="h-28 rounded-md overflow-hidden cursor-pointer group relative border border-[#E8E3DA] bg-neutral-200"
                    >
                      <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Important Info */}
            <div className="bg-[#F2ECE1] p-6 rounded-lg border border-[#E2DDD5] space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1918] flex items-center gap-2">
                <Info className="w-4 h-4 text-[#A08149]" />
                IMPORTANT INFORMATION
              </h4>
              <ul className="space-y-2 text-xs text-[#5C5954] font-light">
                {[
                  'Check-in from 3:00 PM; Check-out before 11:00 AM.',
                  'Flexible cancellation up to 48 hours prior to arrival.',
                ].map((info, idx) => (
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
                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-3xl font-bold">${roomType.basePrice}</span>
                  <span className="text-xs text-[#A09C94]">/ NIGHT</span>
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
                        min={todayISO()}
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
                        min={checkInDate || todayISO()}
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
                    {Array.from({ length: roomType.capacity }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3 pt-2 text-xs text-[#5C5954]">
                  <div className="flex justify-between">
                    <span>${roomType.basePrice} × {nightsCount} nights</span>
                    <span className="font-medium text-[#1A1918]">${roomSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes & Service Fees (12%)</span>
                    <span className="font-medium text-[#1A1918]">${serviceFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-[#EAE6DF] font-bold text-sm text-[#1A1918]">
                    <span>Total</span>
                    <span className="font-serif text-lg">${grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                {availabilityNotice && (
                  <p className="text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded">
                    {availabilityNotice}
                  </p>
                )}

                <button
                  onClick={handleReserve}
                  disabled={!authChecked}
                  className="w-full bg-[#1A1918] hover:bg-[#2C2A29] text-white font-bold tracking-[0.2em] text-xs uppercase py-4 rounded transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
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
      {isModalOpen && modalDetails && user && (
        <BookingModal
          roomType={roomType}
          roomTypeId={roomTypeId}
          user={user}
          bookingDetails={modalDetails}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      <Footer />
    </div>
  );
}
