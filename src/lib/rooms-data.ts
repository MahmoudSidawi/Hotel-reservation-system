// ============================================================================
// SHARED TYPES & DATA — used by both /rooms and /rooms/[id]
// ============================================================================
import React from 'react';
import { Wifi, Coffee, Tv, Wind, Bath, BedDouble, Utensils, Wine, Sparkles } from 'lucide-react';

export interface VeloraAmenity {
  title: string;
  iconName: 'wifi' | 'coffee' | 'climate' | 'tv' | 'balcony' | 'bed' | 'dining' | 'minibar' | 'pool' | 'bath';
}

export interface VeloraRoom {
  id: string;
  title: string;
  badge: string;
  type: string;
  category: string;
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

// Shared amenity icon helper
export const getAmenityIcon = (iconName: string): React.ReactNode => {
  switch (iconName) {
    case 'wifi':    return React.createElement(Wifi,     { className: 'w-3.5 h-3.5 text-[#8C8880]' });
    case 'coffee':  return React.createElement(Coffee,   { className: 'w-3.5 h-3.5 text-[#8C8880]' });
    case 'tv':      return React.createElement(Tv,       { className: 'w-3.5 h-3.5 text-[#8C8880]' });
    case 'climate': return React.createElement(Wind,     { className: 'w-3.5 h-3.5 text-[#8C8880]' });
    case 'bath':    return React.createElement(Bath,     { className: 'w-3.5 h-3.5 text-[#8C8880]' });
    case 'bed':     return React.createElement(BedDouble,{ className: 'w-3.5 h-3.5 text-[#8C8880]' });
    case 'dining':  return React.createElement(Utensils, { className: 'w-3.5 h-3.5 text-[#8C8880]' });
    case 'minibar': return React.createElement(Wine,     { className: 'w-3.5 h-3.5 text-[#8C8880]' });
    default:        return React.createElement(Sparkles, { className: 'w-3.5 h-3.5 text-[#8C8880]' });
  }
};
