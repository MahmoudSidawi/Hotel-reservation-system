import Link from "next/link";

export default function Footer() {
  return (
    <footer id="contact" className="w-full bg-[#FAF8F5] text-xs text-neutral-600 border-t border-[#EAE6DF]">
      {/* Upper Footer */}
      <div className="py-16 px-8 md:px-16 lg:px-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-12">

          {/* Brand & Socials */}
          <div className="space-y-4">
            <div>
              <h4 className="text-2xl font-serif text-neutral-900 tracking-wide">Velora</h4>
              <span className="block w-10 h-px bg-[#C5A46D] mt-3" />
            </div>
            <p className="leading-relaxed font-light text-neutral-500 max-w-xs">
              Experience timeless hospitality and curated comfort at our coastal sanctuary, designed for quiet indulgence.
            </p>
            <div className="flex gap-3 pt-2">
              {["Instagram", "Facebook", "Twitter"].map((label) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-8 h-8 rounded-full border border-[#E2DDD5] flex items-center justify-center text-neutral-500 hover:border-[#C5A46D] hover:text-[#A08149] transition-colors"
                >
                  {label === "Instagram" && (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  )}
                  {label === "Facebook" && (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                    </svg>
                  )}
                  {label === "Twitter" && (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                    </svg>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Explore Links */}
          <div>
            <h5 className="text-[11px] font-bold tracking-widest text-neutral-800 uppercase mb-4">Explore</h5>
            <ul className="space-y-2.5 font-light">
              <li><Link href="/rooms" className="hover:text-[#A08149] transition-colors">Luxury Suites</Link></li>
              <li><a href="/#amenities" className="hover:text-[#A08149] transition-colors">Amenities</a></li>
              <li><a href="/#gallery" className="hover:text-[#A08149] transition-colors">Gallery</a></li>
              <li><a href="/#stories" className="hover:text-[#A08149] transition-colors">Stories</a></li>
            </ul>
          </div>

          {/* Assistance Links */}
          <div>
            <h5 className="text-[11px] font-bold tracking-widest text-neutral-800 uppercase mb-4">Assistance</h5>
            <ul className="space-y-2.5 font-light">
              <li><Link href="/reservations" className="hover:text-[#A08149] transition-colors">My Reservations</Link></li>
              <li><Link href="/contact" className="hover:text-[#A08149] transition-colors">Contact Us</Link></li>
              <li><Link href="/rooms" className="hover:text-[#A08149] transition-colors">Book a Stay</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h5 className="text-[11px] font-bold tracking-widest text-neutral-800 uppercase mb-4">Contact</h5>
            <ul className="space-y-3 font-light text-neutral-600">
              <li className="flex items-start gap-2.5">
                <svg className="w-4 h-4 mt-0.5 text-[#A08149] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span>123 Coastal Way, Seafront, CA 90210</span>
              </li>
              <li className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-[#A08149] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <a href="tel:+15550123456" className="hover:text-[#A08149] transition-colors">+1 (555) 012-3456</a>
              </li>
              <li className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-[#A08149] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <a href="mailto:hello@velora.com" className="hover:text-[#A08149] transition-colors">hello@velora.com</a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="bg-[#171717] text-neutral-400 py-6 px-8 md:px-16 lg:px-20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-lg font-serif text-white tracking-wider">Velora</span>
            <span className="hidden sm:inline w-px h-4 bg-neutral-700" />
            <span className="text-[10px] tracking-widest text-neutral-500 uppercase">
              © 2026 Velora Hotel. All rights reserved.
            </span>
          </div>

          <div className="flex gap-5 text-[10px] uppercase tracking-widest text-neutral-500">
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link href="/rooms" className="hover:text-white transition-colors">Rooms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
