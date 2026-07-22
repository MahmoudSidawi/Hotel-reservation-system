"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 text-neutral-200 w-full">
      {/* Changed max-w-7xl mx-auto to w-full px-6 md:px-12 */}
      <div className="w-full px-6 md:px-12 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 text-2xl font-serif tracking-wider text-white">
          <span className="w-8 h-8 rounded-full border border-neutral-400 flex items-center justify-center text-xs font-sans">
            V
          </span>
          Velora
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm tracking-wide text-neutral-300">
          <Link href="/#rooms" className="hover:text-white transition-colors">Rooms</Link>
          <Link href="/#amenities" className="hover:text-white transition-colors">Amenities</Link>
          <Link href="/#gallery" className="hover:text-white transition-colors">Gallery</Link>
          <Link href="/#stories" className="hover:text-white transition-colors">Stories</Link>
          <Link href="/#contact" className="hover:text-white transition-colors">Contact</Link>
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link 
            href="/login" 
            className="text-sm font-medium hover:text-white px-3 py-2 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/#book"
            className="border border-neutral-400 px-5 py-2.5 text-xs tracking-widest uppercase text-white hover:bg-white hover:text-black transition-all"
          >
            Home
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-neutral-300 focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 18h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-neutral-900 border-b border-neutral-800 px-6 py-4 flex flex-col gap-4 text-sm">
          <Link href="/#rooms" onClick={() => setMobileMenuOpen(false)}>Rooms</Link>
          <Link href="/#amenities" onClick={() => setMobileMenuOpen(false)}>Amenities</Link>
          <Link href="/#gallery" onClick={() => setMobileMenuOpen(false)}>Gallery</Link>
          <Link href="/#stories" onClick={() => setMobileMenuOpen(false)}>Stories</Link>
          <Link href="/#contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
          <hr className="border-neutral-800 my-1" />
          <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-amber-200 font-medium">Login</Link>
          <Link href="/#book" onClick={() => setMobileMenuOpen(false)} className="text-center border border-white py-2 uppercase text-xs">Book Now</Link>
        </div>
      )}
    </header>
  );
}