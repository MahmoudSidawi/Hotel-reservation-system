'use client';

import React, { useState } from 'react';
import Navbar from '../components/navbar'; // Adjust this import path if needed
import Footer from '../components/footer'; // Adjust this import path if needed
import { 
  Wifi, 
  Coffee, 
  Tv, 
  Wind, 
  Sparkles, 
  Bath, 
  BedDouble, 
  Utensils, 
  Wine, 
  SlidersHorizontal, 
  Search,
  Users,
  Maximize2,
  CheckCircle2,
  Star,
  Calendar,
  ArrowLeft,
  Info,
  X,
  CreditCard,
  CheckCircle
} from 'lucide-react';

// ============================================================================
// TYPES & DATA STRUCTURES
// ============================================================================
export interface VeloraAmenity {
  title: string;
  iconName: 'wifi' | 'coffee' | 'climate' | 'tv' | 'balcony' | 'bed' | 'dining' | 'minibar' | 'pool' | 'bath';
}

export interface VeloraRoom {
  id: string;
  title: string;
  badge: string;
  type: string;
  category: string; // 'Suite' | 'Ocean' | 'Executive' | 'Garden' | 'Penthouse'
  pricePerNight: number;
  rating: number;
  reviewsCount: number;
  guestsMax: number;
  bedDetails: string;
  sizeSqFt: number;
  sizeSqM: number;
  view: string;
  heroImage: string;
  galleryImages: string[];
  shortDescription: string;
  longDescription: string[];
  amenities: VeloraAmenity[];
  importantInfo?: string[];
}

export interface BookingDetails {
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  total: number;
}

// Initial Mock Rooms Data matching Velora Luxury Resort
export const VELORA_ROOMS: VeloraRoom[] = [
  {
    id: 'luxury-oceanfront-suite',
    title: 'Luxury Oceanfront Suite',
    badge: 'SIGNATURE EXPERIENCE',
    type: 'Luxury Suite',
    category: 'Suite',
    pricePerNight: 850,
    rating: 4.9,
    reviewsCount: 128,
    guestsMax: 3,
    bedDetails: '1 King, 1 Sofa Bed',
    sizeSqFt: 850,
    sizeSqM: 79,
    view: 'Unobstructed Ocean',
    heroImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1600',
    galleryImages: [
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=800',
    ],
    shortDescription: 'A high-end, bright, and airy luxury hotel suite with a king-sized bed, premium linens, and breathtaking coastal panoramas.',
    longDescription: [
      'The Luxury Oceanfront Suite at Velora offers an unparalleled retreat where sophisticated modernity meets the tranquil rhythm of the sea. Spanning 850 square feet of meticulously designed space, this suite serves as a coastal sanctuary for those who appreciate the finer nuances of hospitality.',
      'Floor-to-ceiling windows bathe the interior in soft, natural light, highlighting the premium textures of Egyptian cotton linens and artisan-crafted furniture. Your private balcony provides the ultimate vantage point for sunrises over the Pacific, accompanied by the gentle sound of breaking waves.'
    ],
    amenities: [
      { title: 'Ultra-fast WiFi', iconName: 'wifi' },
      { title: 'Nespresso Vertuo', iconName: 'coffee' },
      { title: 'Silent Climate Control', iconName: 'climate' },
      { title: '65" OLED Smart TV', iconName: 'tv' },
      { title: 'Ocean-facing Balcony', iconName: 'balcony' },
      { title: 'King Size CloudBed', iconName: 'bed' },
      { title: '24/7 Fine Dining', iconName: 'dining' },
      { title: 'Complimentary Mini Bar', iconName: 'minibar' }
    ],
    importantInfo: [
      'Check-in from 3:00 PM; Check-out before 11:00 AM.',
      'Flexible cancellation up to 48 hours prior to arrival.',
      'Complimentary valet parking included for signature suites.'
    ]
  },
  {
    id: 'deluxe-ocean-view',
    title: 'Deluxe Ocean View',
    badge: 'OCEANFRONT',
    type: 'Ocean View',
    category: 'Ocean',
    pricePerNight: 650,
    rating: 4.8,
    reviewsCount: 94,
    guestsMax: 2,
    bedDetails: '1 King Bed',
    sizeSqFt: 620,
    sizeSqM: 58,
    view: 'Panoramic Coastline',
    heroImage: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=1600',
    galleryImages: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=800'
    ],
    shortDescription: 'Sophisticated hotel room featuring a balcony with clear ocean views and a serene, calming interior palette.',
    longDescription: [
      'Immerse yourself in gentle coastal breezes and natural sunlight in our Deluxe Ocean View sanctuary. Crafted with warm neutral wood tones, organic linens, and custom artwork.',
      'Enjoy morning coffee on your private glass-walled terrace, overlooking serene tidepools and endless horizon.'
    ],
    amenities: [
      { title: 'High-speed WiFi', iconName: 'wifi' },
      { title: 'Espresso Bar', iconName: 'coffee' },
      { title: 'Ocean Balcony', iconName: 'balcony' },
      { title: 'Smart Room Control', iconName: 'climate' },
      { title: 'Rain Shower', iconName: 'bath' },
      { title: 'King CloudBed', iconName: 'bed' }
    ],
    importantInfo: [
      'Check-in from 3:00 PM; Check-out before 11:00 AM.',
      'Cancellation free up to 24 hours prior.'
    ]
  },
  {
    id: 'junior-executive-suite',
    title: 'Junior Executive Suite',
    badge: 'EXECUTIVE',
    type: 'Executive Suite',
    category: 'Executive',
    pricePerNight: 520,
    rating: 4.7,
    reviewsCount: 76,
    guestsMax: 3,
    bedDetails: '1 King, 1 Daybed',
    sizeSqFt: 710,
    sizeSqM: 66,
    view: 'Skyline & Resort Gardens',
    heroImage: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=1600',
    galleryImages: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=800'
    ],
    shortDescription: 'A spacious executive suite with a dedicated seating area, plush armchair, and refined architectural details.',
    longDescription: [
      'Designed for modern travelers seeking productivity and relaxation, the Junior Executive Suite features an ergonomic workstation, custom reading nook, and separate lounge.',
      'Savor peaceful garden views and effortless access to Velora Executive Lounge.'
    ],
    amenities: [
      { title: 'Gigabit WiFi', iconName: 'wifi' },
      { title: 'Executive Workstation', iconName: 'tv' },
      { title: 'Gourmet Coffee', iconName: 'coffee' },
      { title: 'Acoustic Soundproofing', iconName: 'climate' },
      { title: '24/7 Room Service', iconName: 'dining' }
    ]
  },
  {
    id: 'garden-terrace-room',
    title: 'Garden Terrace Room',
    badge: 'GARDEN VIEW',
    type: 'Garden Room',
    category: 'Garden',
    pricePerNight: 480,
    rating: 4.8,
    reviewsCount: 88,
    guestsMax: 2,
    bedDetails: '1 Queen Plush Bed',
    sizeSqFt: 540,
    sizeSqM: 50,
    view: 'Botanical Gardens',
    heroImage: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&q=80&w=1600',
    galleryImages: [
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=800'
    ],
    shortDescription: 'A cozy hotel room with direct access to a lush garden terrace, featuring natural wood accents and botanical scents.',
    longDescription: [
      'Step directly onto your secluded private courtyard patio surrounded by scented jasmine, bamboo, and coastal flora.',
      'Features custom teak loungers and soothing indoor-outdoor flow.'
    ],
    amenities: [
      { title: 'Private Courtyard', iconName: 'balcony' },
      { title: 'Organic Tea Station', iconName: 'coffee' },
      { title: 'Soaking Tub', iconName: 'bath' },
      { title: 'High-speed WiFi', iconName: 'wifi' }
    ]
  },
  {
    id: 'premium-king-room',
    title: 'Premium King Room',
    badge: 'PREMIUM',
    type: 'Standard Luxury',
    category: 'Standard',
    pricePerNight: 420,
    rating: 4.6,
    reviewsCount: 62,
    guestsMax: 2,
    bedDetails: '1 King CloudBed',
    sizeSqFt: 480,
    sizeSqM: 45,
    view: 'Courtyard Palms',
    heroImage: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80&w=1600',
    galleryImages: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800'
    ],
    shortDescription: 'A premium king room with elegant bedside lamps, high-quality bedding, and a clean, understated aesthetic.',
    longDescription: [
      'A serene space tailored for ultimate sleep comfort. Features acoustic insulation, blackout velvet drapery, and custom ambient lighting.'
    ],
    amenities: [
      { title: 'Plush Bedding', iconName: 'bed' },
      { title: 'WiFi', iconName: 'wifi' },
      { title: 'Espresso Bar', iconName: 'coffee' },
      { title: 'Mini Bar', iconName: 'minibar' }
    ]
  },
  {
    id: 'grand-penthouse-suite',
    title: 'Grand Penthouse Suite',
    badge: 'THE COLLECTION',
    type: 'Penthouse',
    category: 'Penthouse',
    pricePerNight: 1950,
    rating: 5.0,
    reviewsCount: 42,
    guestsMax: 4,
    bedDetails: '2 Emperor Kings, Dining for 8',
    sizeSqFt: 1800,
    sizeSqM: 167,
    view: '360° Coast & City Panorama',
    heroImage: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1600',
    galleryImages: [
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800'
    ],
    shortDescription: 'A luxurious penthouse suite with floor-to-ceiling windows, panoramic views, and opulent, bespoke furnishings.',
    longDescription: [
      'Occupying the entire top level, the Grand Penthouse Suite represents the pinnacle of luxury hospitality. Features a private glass elevator entrance, crystal chandelier dining room, outdoor firepit terrace, and dedicated butler.'
    ],
    amenities: [
      { title: '360° Terrace', iconName: 'balcony' },
      { title: 'Dedicated Butler', iconName: 'dining' },
      { title: 'Private Jacuzzi', iconName: 'pool' },
      { title: 'Smart Automation', iconName: 'climate' },
      { title: 'Complimentary Premium Bar', iconName: 'minibar' },
      { title: 'Grand Piano', iconName: 'tv' }
    ]
  }
];

// Helper icon mapping function
const getAmenityIcon = (iconName: string) => {
  switch (iconName) {
    case 'wifi': return <Wifi className="w-3.5 h-3.5 text-[#8C8880]" />;
    case 'coffee': return <Coffee className="w-3.5 h-3.5 text-[#8C8880]" />;
    case 'tv': return <Tv className="w-3.5 h-3.5 text-[#8C8880]" />;
    case 'climate': return <Wind className="w-3.5 h-3.5 text-[#8C8880]" />;
    case 'bath': return <Bath className="w-3.5 h-3.5 text-[#8C8880]" />;
    case 'bed': return <BedDouble className="w-3.5 h-3.5 text-[#8C8880]" />;
    case 'dining': return <Utensils className="w-3.5 h-3.5 text-[#8C8880]" />;
    case 'minibar': return <Wine className="w-3.5 h-3.5 text-[#8C8880]" />;
    default: return <Sparkles className="w-3.5 h-3.5 text-[#8C8880]" />;
  }
};

// ============================================================================
// SUB-COMPONENT: BOOKING CONFIRMATION MODAL
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
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [resCode, setResCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = 'RES-' + Math.floor(1000 + Math.random() * 9000);
    setResCode(code);
    setIsConfirmed(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FAF8F5] rounded-xl border border-[#E2DDD5] max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="bg-[#18181B] text-white p-6 relative flex items-center justify-between border-b border-[#27272A]">
          <div>
            <span className="text-[9px] uppercase tracking-[0.2em] text-[#C5A46D] font-bold block">
              VELORA LUXURY RESORT
            </span>
            <h3 className="font-serif text-xl font-normal text-white mt-1">
              {isConfirmed ? 'Reservation Confirmed' : 'Complete Your Reservation'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
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
                Your booking reference is <span className="font-mono font-bold text-[#1A1918] bg-[#EAE2D5] px-2 py-0.5 rounded">{resCode}</span>
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-[#E2DDD5] text-left text-xs space-y-2 font-light text-[#5C5954]">
              <div className="flex justify-between border-b border-[#F2EEE8] pb-2">
                <span className="font-semibold text-[#1A1918]">Accommodation</span>
                <span>{room.title}</span>
              </div>
              <div className="flex justify-between border-b border-[#F2EEE8] pb-2">
                <span className="font-semibold text-[#1A1918]">Dates</span>
                <span>{bookingDetails.checkIn} to {bookingDetails.checkOut} ({bookingDetails.nights} nights)</span>
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
              A confirmation email has been dispatched to <span className="font-medium text-[#1A1918]">{guestEmail}</span>.
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
              <img
                src={room.heroImage}
                alt={room.title}
                className="w-16 h-16 object-cover rounded"
              />
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
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C8880] block mb-1">
                  FULL NAME
                </label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Eleanor Vance"
                  className="w-full bg-white border border-[#E2DDD5] rounded px-3 py-2 text-xs text-[#1A1918] focus:outline-none focus:border-[#C5A46D]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C8880] block mb-1">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  required
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="e.vance@example.com"
                  className="w-full bg-white border border-[#E2DDD5] rounded px-3 py-2 text-xs text-[#1A1918] focus:outline-none focus:border-[#C5A46D]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C8880] block mb-1">
                  SPECIAL REQUESTS (OPTIONAL)
                </label>
                <textarea
                  rows={2}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="High floor, champagne on arrival, pillow options..."
                  className="w-full bg-white border border-[#E2DDD5] rounded px-3 py-2 text-xs text-[#1A1918] focus:outline-none focus:border-[#C5A46D]"
                />
              </div>
            </div>

            <div className="bg-[#F2ECE1] p-3.5 rounded border border-[#E2DDD5] flex justify-between items-center text-xs">
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
// PAGE 1: CATALOG LISTING VIEW ("Our Rooms")
// ============================================================================
function RoomsCatalogPage({
  onSelectRoom,
}: {
  onSelectRoom: (roomId: string) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedGuests, setSelectedGuests] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [sortBy, setSortBy] = useState<string>('RECOMMENDED');
  const [showAmenitiesFilter, setShowAmenitiesFilter] = useState<boolean>(false);
  const [newsletterEmail, setNewsletterEmail] = useState<string>('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState<boolean>(false);

  const filteredRooms = VELORA_ROOMS.filter((room) => {
    if (selectedCategory !== 'ALL' && room.category.toUpperCase() !== selectedCategory) {
      return false;
    }
    if (selectedGuests > 0 && room.guestsMax < selectedGuests) {
      return false;
    }
    if (room.pricePerNight > maxPrice) {
      return false;
    }
    return true;
  });

  const sortedRooms = [...filteredRooms].sort((a, b) => {
    if (sortBy === 'PRICE_LOW') return a.pricePerNight - b.pricePerNight;
    if (sortBy === 'PRICE_HIGH') return b.pricePerNight - a.pricePerNight;
    if (sortBy === 'RATING') return b.rating - a.rating;
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
    <div className="bg-[#FAF8F5] min-h-screen text-[#1A1918] font-sans antialiased">
      {/* HERO BANNER */}
      <section 
        className="relative h-[340px] md:h-[420px] bg-cover bg-center flex items-center justify-center text-center px-4 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(15, 15, 15, 0.45), rgba(15, 15, 15, 0.65)), url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=2000')`
        }}
      >
        <div className="max-w-2xl mx-auto space-y-3 z-10 text-white">
          <span className="text-[10px] md:text-xs uppercase font-medium tracking-[0.25em] text-[#E0D5BE] block">
            THE ART OF FINE LIVING
          </span>
          <h1 className="font-serif text-4xl md:text-6xl font-normal tracking-tight text-white">
            Our Rooms
          </h1>
          <div className="w-12 h-[1px] bg-[#C5A46D] mx-auto my-3" />
          <p className="text-sm md:text-base font-light text-[#ECE7DE] tracking-wide">
            Find Your Perfect Stay
          </p>
        </div>
      </section>

      {/* FILTER SEARCH OVERLAY BAR */}
      <section className="max-w-6xl mx-auto -mt-10 relative z-20 px-4 mb-16">
        <div className="bg-white rounded-lg shadow-xl border border-[#EBE6DD] p-4 md:p-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C8880] block">ROOM TYPE</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E2DDD5] rounded-md px-3 py-2 text-xs font-medium text-[#1A1918] focus:outline-none focus:border-[#C5A46D] cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="SUITE">Signature Suites</option>
              <option value="OCEAN">Ocean View</option>
              <option value="EXECUTIVE">Executive Suites</option>
              <option value="GARDEN">Garden Terrace</option>
              <option value="PENTHOUSE">Penthouse Collection</option>
            </select>
          </div>

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
              min={300}
              max={2500}
              step={50}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#1A1918] cursor-pointer h-1.5 bg-[#E2DDD5] rounded-lg"
            />
          </div>

          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setShowAmenitiesFilter(!showAmenitiesFilter)}
              className="w-full bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#E2DDD5] rounded-md px-3 py-2 text-xs font-medium text-[#1A1918] flex items-center justify-center gap-2 transition-colors md:mt-4"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#8C8880]" />
              <span>Amenities</span>
            </button>
          </div>

          <div className="space-y-1">
            <button
              type="button"
              onClick={() => {
                const element = document.getElementById('sanctuaries-grid');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
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
              Each space at Velora is meticulously designed to offer a unique blend of coastal charm and modern luxury. From expansive suites to intimate garden rooms, your comfort is our singular focus.
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
                <option value="RATING">Highest Rating</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedRooms.map((room) => (
            <div
              key={room.id}
              onClick={() => onSelectRoom(room.id)}
              className="bg-white rounded-lg border border-[#ECE7DF] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="relative h-60 overflow-hidden bg-neutral-100">
                  <img
                    src={room.heroImage}
                    alt={room.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  <span className="absolute top-3 right-3 bg-[#1A1918]/85 backdrop-blur-md text-[#E0D5BE] text-[9px] font-bold uppercase tracking-[0.18em] px-2.5 py-1 rounded">
                    {room.badge}
                  </span>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-serif text-xl font-normal text-[#1A1918] group-hover:text-[#A08149] transition-colors">
                      {room.title}
                    </h3>
                    <span className="text-[11px] text-[#736F68] flex items-center gap-1 shrink-0 bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#ECE7DF]">
                      <Users className="w-3 h-3 text-[#A08149]" />
                      <span>{room.guestsMax} Guests</span>
                    </span>
                  </div>

                  <p className="text-xs text-[#736F68] line-clamp-2 leading-relaxed font-light">
                    {room.shortDescription}
                  </p>

                  <div className="flex items-center gap-3 pt-1">
                    {room.amenities.slice(0, 5).map((amenity, idx) => (
                      <span
                        key={idx}
                        title={amenity.title}
                        className="p-1.5 rounded bg-[#FAF8F5] border border-[#ECE7DF] text-[#736F68]"
                      >
                        {getAmenityIcon(amenity.iconName)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2 border-t border-[#F2EEE8] flex items-center justify-between gap-2">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-[#8C8880] block font-semibold">
                    STARTING FROM
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-lg font-bold text-[#1A1918]">
                      ${room.pricePerNight}
                    </span>
                    <span className="text-[10px] text-[#8C8880]">/ night</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectRoom(room.id);
                  }}
                  className="bg-[#1A1918] hover:bg-[#2C2A29] text-white text-[10px] font-bold tracking-[0.18em] uppercase px-5 py-2.5 rounded transition-all shadow-sm hover:shadow"
                >
                  BOOK NOW
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded border border-[#C5A46D] bg-[#C5A46D] text-white text-xs font-semibold flex items-center justify-center">1</button>
            <button className="w-9 h-9 rounded border border-[#ECE7DF] bg-white text-[#1A1918] text-xs font-semibold hover:bg-[#FAF8F5] flex items-center justify-center">2</button>
            <button className="w-9 h-9 rounded border border-[#ECE7DF] bg-white text-[#1A1918] text-xs font-semibold hover:bg-[#FAF8F5] flex items-center justify-center">3</button>
            <button className="px-4 h-9 rounded border border-[#ECE7DF] bg-white text-[#1A1918] text-xs font-semibold hover:bg-[#FAF8F5]">Next</button>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8C8880]">
            SHOWING 6 OF 24 EXCEPTIONAL SPACES
          </span>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="bg-[#FAF8F5] border-t border-[#EAE6DF] py-20 px-6 text-center">
        <div className="max-w-xl mx-auto space-y-4">
          <h2 className="font-serif text-3xl font-normal text-[#1A1918]">
            The Velora Collection
          </h2>
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
    </div>
  );
}

// ============================================================================
// PAGE 2: ROOM DETAILS VIEW ("Luxury Oceanfront Suite")
// ============================================================================
function RoomDetailPage({
  roomId,
  onBackToRooms,
  onSelectRoom,
  onOpenReserveModal,
}: {
  roomId: string;
  onBackToRooms: () => void;
  onSelectRoom: (roomId: string) => void;
  onOpenReserveModal: (room: VeloraRoom, details: BookingDetails) => void;
}) {
  const room = VELORA_ROOMS.find((r) => r.id === roomId) || VELORA_ROOMS[0];
  const [checkInDate, setCheckInDate] = useState<string>('2026-10-24');
  const [checkOutDate, setCheckOutDate] = useState<string>('2026-10-27');
  const [guestsCount, setGuestsCount] = useState<number>(2);
  const [activePhotoModal, setActivePhotoModal] = useState<string | null>(null);

  const calculateNights = (): number => {
    try {
      const d1 = new Date(checkInDate);
      const d2 = new Date(checkOutDate);
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
    } catch {
      return 3;
    }
  };

  const nightsCount = calculateNights();
  const roomSubtotal = room.pricePerNight * nightsCount;
  const serviceFee = 120;
  const grandTotal = roomSubtotal + serviceFee;

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-[#1A1918] font-sans antialiased">
      <div className="bg-[#18181B] border-b border-[#27272A] px-6 md:px-12 py-2.5">
        <button
          onClick={onBackToRooms}
          className="text-xs text-[#A09C94] hover:text-white flex items-center gap-2 transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Our Rooms</span>
        </button>
      </div>

      {/* HERO BANNER */}
      <section 
        className="relative h-[380px] md:h-[480px] bg-cover bg-center flex items-end justify-start p-6 md:p-16 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to top, rgba(15, 15, 15, 0.85), rgba(15, 15, 15, 0.3)), url('${room.heroImage}')`
        }}
      >
        <div className="max-w-4xl space-y-3 z-10 text-white">
          <span className="bg-[#C5A46D] text-[#1A1918] text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-xs inline-block">
            {room.badge}
          </span>
          <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-normal tracking-tight text-white">
            {room.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-xs text-[#E5DFD5] font-light">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#C5A46D]" />
              <span>Up to {room.guestsMax} Guests</span>
            </span>
            <span className="text-[#C5A46D]">•</span>
            <span className="flex items-center gap-1.5">
              <BedDouble className="w-4 h-4 text-[#C5A46D]" />
              <span>{room.bedDetails}</span>
            </span>
          </div>
        </div>
      </section>

      {/* DETAILS GRID */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          <div className="lg:col-span-7 space-y-12">
            <div className="space-y-6">
              <h2 className="font-serif text-2xl md:text-3xl font-normal text-[#1A1918]">
                A Sanctuary of Timeless Elegance
              </h2>
              <div className="space-y-4 text-xs md:text-sm text-[#5C5954] leading-relaxed font-light">
                {room.longDescription.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
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

            {/* CURATED AMENITIES */}
            <div className="space-y-6 pt-6 border-t border-[#EAE6DF]">
              <div className="flex items-center gap-4">
                <h3 className="font-serif text-xl font-normal text-[#1A1918] shrink-0">
                  Curated Amenities
                </h3>
                <div className="h-[1px] bg-[#EAE6DF] w-full" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {room.amenities.map((item, idx) => (
                  <div key={idx} className="bg-[#F4F1EA] rounded-md p-3.5 flex items-center gap-3 border border-[#E8E3DA]">
                    <div className="p-1.5 rounded bg-white text-[#1A1918] shrink-0">
                      {getAmenityIcon(item.iconName)}
                    </div>
                    <span className="text-xs font-medium text-[#2C2A29]">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* EXPERIENCE PHOTOS */}
            <div className="space-y-6 pt-6 border-t border-[#EAE6DF]">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-normal text-[#1A1918]">
                  The Experience in Detail
                </h3>
                <button
                  type="button"
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
                    className="h-28 rounded-md overflow-hidden bg-neutral-200 cursor-pointer group relative border border-[#E8E3DA]"
                  >
                    <img src={img} alt={`Gallery item ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Maximize2 className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* IMPORTANT INFO BOX */}
            <div className="bg-[#F2ECE1] p-6 rounded-lg border border-[#E2DDD5] space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1918] flex items-center gap-2">
                <Info className="w-4 h-4 text-[#A08149]" />
                <span>IMPORTANT INFORMATION</span>
              </h4>
              <ul className="space-y-2 text-xs text-[#5C5954] font-light">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#A08149] shrink-0 mt-0.5" />
                  <span>Check-in from 3:00 PM; Check-out before 11:00 AM.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#A08149] shrink-0 mt-0.5" />
                  <span>Flexible cancellation up to 48 hours prior to arrival.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#A08149] shrink-0 mt-0.5" />
                  <span>Complimentary valet parking included for signature suites.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* RIGHT COLUMN STICKY CARD */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="bg-white rounded-lg border border-[#E2DDD5] shadow-2xl overflow-hidden">
              <div className="bg-[#18181B] text-white p-6 space-y-2">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-3xl font-bold text-white">${room.pricePerNight}</span>
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
                    <option value={1}>1 Guest</option>
                    <option value={2}>2 Guests</option>
                    <option value={3}>3 Guests</option>
                    <option value={4}>4 Guests</option>
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
                  onClick={() =>
                    onOpenReserveModal(room, {
                      checkIn: checkInDate,
                      checkOut: checkOutDate,
                      guests: guestsCount,
                      nights: nightsCount,
                      total: grandTotal,
                    })
                  }
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

      {/* PHOTO LIGHTBOX MODAL */}
      {activePhotoModal && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <button
            onClick={() => setActivePhotoModal(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={activePhotoModal}
            alt="Expanded view"
            className="max-w-full max-h-[85vh] object-contain rounded"
          />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN PAGE WRAPPER COMPONENT
// ============================================================================
export default function VeloraRoomsApp() {
  const [currentView, setCurrentView] = useState<'CATALOG' | 'DETAIL'>('CATALOG');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('luxury-oceanfront-suite');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalBookingDetails, setModalBookingDetails] = useState<BookingDetails>({
    checkIn: '2026-10-24',
    checkOut: '2026-10-27',
    guests: 2,
    nights: 3,
    total: 2670,
  });

  const activeRoom = VELORA_ROOMS.find((r) => r.id === selectedRoomId) || VELORA_ROOMS[0];

  const handleSelectRoom = (id: string) => {
    setSelectedRoomId(id);
    setCurrentView('DETAIL');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenReserveModal = (room: VeloraRoom, details: BookingDetails) => {
    setSelectedRoomId(room.id);
    setModalBookingDetails(details);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF8F5]">
      {/* Top Main Navbar imported from external file */}
      <Navbar />

      <main className="flex-grow">
        {currentView === 'CATALOG' ? (
          <RoomsCatalogPage onSelectRoom={handleSelectRoom} />
        ) : (
          <RoomDetailPage
            roomId={selectedRoomId}
            onBackToRooms={() => {
              setCurrentView('CATALOG');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectRoom={handleSelectRoom}
            onOpenReserveModal={handleOpenReserveModal}
          />
        )}
      </main>

      {/* Bottom Main Footer imported from external file */}
      <Footer />

      {/* Global Booking Modal */}
      {isModalOpen && (
        <BookingModal
          room={activeRoom}
          bookingDetails={modalBookingDetails}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}