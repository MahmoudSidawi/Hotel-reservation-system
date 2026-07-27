"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type MenuLink = { label: string; href: string };

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close the user dropdown when clicking anywhere outside it.
  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [userMenuOpen]);

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const contactElement = document.getElementById("contact");
    if (contactElement) {
      contactElement.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
  };

  // Account links shown inside the user dropdown, tailored to the role.
  const accountLinks: MenuLink[] = user
    ? user.role === "admin"
      ? [{ label: "Admin Dashboard", href: "/admin" }]
      : user.role === "receptionist"
      ? [{ label: "Reception Portal", href: "/receptionist" }]
      : [
          { label: "My Dashboard", href: "/Customer" },
          { label: "My Reservations", href: "/reservations" },
        ]
    : [];
  if (user) accountLinks.push({ label: "Account Settings", href: "/settings" });

  const firstName = user?.name.split(" ")[0] ?? "";
  const initials = user?.name.slice(0, 2).toUpperCase() ?? "";

  return (
    <header className="sticky top-0 z-50 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 text-neutral-200 w-full">
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
          <Link
            href="/"
            className={`transition-colors ${pathname === "/" ? "text-[#C5A46D] font-semibold" : "hover:text-white"}`}
          >
            Home
          </Link>
          <Link
            href="/rooms"
            className={`transition-colors ${pathname === "/rooms" ? "text-[#C5A46D] font-semibold" : "hover:text-white"}`}
          >
            Rooms
          </Link>
          <Link href="/#amenities" className="hover:text-white transition-colors">
            Amenities
          </Link>
          <Link href="/#stories" className="hover:text-white transition-colors">
            Stories
          </Link>
          <a
            href="#contact"
            onClick={handleContactClick}
            className={`transition-colors cursor-pointer ${
              pathname === "/contact" ? "text-[#C5A46D] font-semibold" : "hover:text-white"
            }`}
          >
            Contact
          </a>
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          {loading ? (
            <span className="text-xs text-neutral-400">Loading...</span>
          ) : user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
                className="flex items-center gap-2.5 rounded-full border border-neutral-700 hover:border-neutral-500 py-1.5 pl-1.5 pr-3 transition-colors"
              >
                <span className="w-7 h-7 rounded-full bg-[#C5A46D] text-neutral-900 flex items-center justify-center text-xs font-bold">
                  {initials}
                </span>
                <span className="text-xs text-neutral-200">
                  Hi, <strong className="text-white font-semibold">{firstName}</strong>
                </span>
                <svg
                  className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {userMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-60 rounded-xl bg-white text-neutral-800 shadow-2xl border border-neutral-200 overflow-hidden z-50"
                >
                  {/* Identity header */}
                  <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50">
                    <p className="text-sm font-semibold text-neutral-900 truncate">{user.name}</p>
                    <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                    <span className="mt-1 inline-block text-[10px] font-bold uppercase tracking-wider text-[#A08149] bg-[#FAF8F5] border border-[#E2DDD5] rounded px-1.5 py-0.5">
                      {user.role}
                    </span>
                  </div>

                  {/* Account links */}
                  <div className="py-1">
                    {accountLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  {/* Logout */}
                  <div className="border-t border-neutral-100 py-1">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="border border-neutral-400 px-5 py-2 text-xs font-semibold tracking-widest uppercase text-white hover:bg-white hover:text-black transition-all rounded"
            >
              Log in
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          className="md:hidden text-neutral-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A46D] rounded"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-neutral-900 border-b border-neutral-800 px-6 py-4 flex flex-col gap-4 text-sm">
          <Link href="/" onClick={() => setMobileMenuOpen(false)}>
            Home
          </Link>
          <Link href="/rooms" onClick={() => setMobileMenuOpen(false)}>
            Rooms
          </Link>
          <Link href="/#amenities" onClick={() => setMobileMenuOpen(false)}>
            Amenities
          </Link>
          <Link href="/#stories" onClick={() => setMobileMenuOpen(false)}>
            Stories
          </Link>
          <a href="#contact" onClick={handleContactClick} className="cursor-pointer">
            Contact
          </a>

          <hr className="border-neutral-800 my-1" />

          {user ? (
            <>
              <div className="flex items-center gap-3 py-1">
                <span className="w-8 h-8 rounded-full bg-[#C5A46D] text-neutral-900 flex items-center justify-center text-xs font-bold">
                  {initials}
                </span>
                <div>
                  <p className="text-xs font-semibold text-white">{user.name}</p>
                  <p className="text-[10px] text-neutral-500">{user.email}</p>
                </div>
              </div>
              {accountLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[#C5A46D] hover:text-white font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="text-left text-red-400 font-medium"
              >
                Log out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center border border-neutral-500 py-2 uppercase text-xs tracking-widest text-white rounded"
            >
              Log in
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
