// ============================================================================
// SHARED TYPES & HELPERS — used by /rooms and /rooms/[id] to render data
// coming from the real backend (/api/room-types, /api/room-images, /api/rooms).
// ============================================================================
import React from 'react';
import { Wifi, Coffee, Wine, Waves, Car, Snowflake, Sparkles } from 'lucide-react';

export interface ApiAmenity {
  _id: string;
  name: string;
  icon?: string;
}

export interface ApiRoomType {
  _id: string;
  name: string;
  description?: string;
  basePrice: number;
  capacity: number;
  amenities: ApiAmenity[];
}

export interface ApiRoomImage {
  _id: string;
  roomTypeId: string;
  imageUrl: string;
  isPrimary?: boolean;
}

export interface ApiRoom {
  _id: string;
  roomNumber: string;
  floor: number;
  status: string;
  roomTypeId: ApiRoomType | string;
}

export interface BookingDetails {
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  total: number;
}

// Decorative fallback photos for room types that don't have an uploaded
// RoomImage yet — picked deterministically so a given room always shows the
// same fallback instead of flickering between renders.
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=1600',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1600',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1600',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=1600',
];

export function fallbackImageFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return FALLBACK_IMAGES[hash % FALLBACK_IMAGES.length];
}

// Shared amenity icon helper — keys match the `icon` string stored on
// Amenity documents (see scripts/seed-data.ts).
export const getAmenityIcon = (iconName?: string): React.ReactNode => {
  switch (iconName) {
    case 'wifi':      return React.createElement(Wifi,      { className: 'w-3.5 h-3.5 text-[#8C8880]' });
    case 'coffee':    return React.createElement(Coffee,    { className: 'w-3.5 h-3.5 text-[#8C8880]' });
    case 'wine':      return React.createElement(Wine,      { className: 'w-3.5 h-3.5 text-[#8C8880]' });
    case 'waves':     return React.createElement(Waves,     { className: 'w-3.5 h-3.5 text-[#8C8880]' });
    case 'car':       return React.createElement(Car,       { className: 'w-3.5 h-3.5 text-[#8C8880]' });
    case 'snowflake': return React.createElement(Snowflake, { className: 'w-3.5 h-3.5 text-[#8C8880]' });
    default:          return React.createElement(Sparkles,  { className: 'w-3.5 h-3.5 text-[#8C8880]' });
  }
};
