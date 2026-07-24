"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const ROOMS = [
  {
    title: "Luxury Ocean Suite",
    guests: "2 Guests",
    desc: "A high-end, bright, and airy luxury hotel suite with a king-sized bed.",
    price: "$850",
    badge: "SIGNATURE SUITE",
    image: "/room1.png",
  },
  {
    title: "Deluxe Ocean View",
    guests: "2 Guests",
    desc: "Sophisticated hotel room featuring a balcony with clear ocean views and a peaceful setting.",
    price: "$650",
    badge: "OCEANFRONT",
    image: "/room2.png",
  },
  {
    title: "Garden Terrace Room",
    guests: "2 Guests",
    desc: "A cozy hotel room with direct access to a lush garden terrace, featuring premium amenities.",
    price: "$480",
    badge: "GARDEN VIEW",
    image: "room3.png",
  },
];

export default function RoomsSection() {
  const { user } = useAuth();

  return (
    <section id="rooms" className="pt-28 pb-20 bg-stone-50 text-neutral-900 px-8 md:px-16 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs uppercase tracking-widest text-amber-700 font-semibold block mb-2">
              THE COLLECTION
            </span>
            <h2 className="text-3xl md:text-5xl font-serif">Our Rooms</h2>
            <p className="text-sm text-neutral-600 max-w-lg mt-3 font-light">
              Each space at Velora is meticulously designed to offer a unique blend of coastal charm and modern luxury.
            </p>
          </div>
          <Link href="/rooms" className="mt-4 md:mt-0 text-xs font-bold uppercase tracking-widest border-b border-neutral-900 pb-1 w-fit hover:opacity-75">
            Explore All Rooms →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ROOMS.map((room, idx) => {
            const targetHref = user ? "/rooms" : "/login?callbackUrl=/rooms";

            return (
              <div key={idx} className="bg-white border border-neutral-200 overflow-hidden group flex flex-col justify-between hover:shadow-lg transition-shadow">
                <div>
                  <div className="relative h-64 overflow-hidden">
                    <span className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm text-[10px] font-semibold tracking-wider uppercase px-2 py-1 text-neutral-800">
                      {room.badge}
                    </span>
                    <img
                      src={room.image}
                      alt={room.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-serif mb-1">{room.title}</h3>
                    <p className="text-xs text-neutral-500 mb-3">{room.guests}</p>
                    <p className="text-sm text-neutral-600 font-light mb-6 leading-relaxed">
                      {room.desc}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-widest block">Starting From</span>
                    <span className="text-lg font-serif">{room.price} <span className="text-xs font-sans text-neutral-500">/ night</span></span>
                  </div>
                  
                  <Link
                    href={targetHref}
                    className="border border-neutral-900 text-neutral-900 px-4 py-2 text-xs uppercase tracking-wider hover:bg-neutral-900 hover:text-white transition-colors"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}