import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center items-center bg-neutral-900 text-white overflow-hidden pb-12">
      {/* Background Image with Subtle Dark Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-65 scale-105 transition-transform duration-1000" 
        style={{ backgroundImage: `url('/hero.png')` }}
      />
      
      {/* Soft Vignette Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900/30 to-neutral-950/60" />

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center pt-16">
        
        {/* Golden Badge */}
        <div className="bg-[#d4af37]/90 text-neutral-950 text-[10px] uppercase font-bold tracking-[0.25em] px-4 py-1.5 mb-8 rounded-xs shadow-md">
          ★ FIVE-STAR LUXURY • EST. 1924
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl md:text-7xl font-serif font-normal leading-tight mb-6 tracking-wide drop-shadow-md">
          Where Stillness <br /> Meets the Sea
        </h1>

        <div className="w-16 h-[1px] bg-amber-200/60 mb-6" />

        {/* Subtitle */}
        <p className="text-sm md:text-base text-neutral-200 max-w-lg font-light leading-relaxed mb-10 text-stone-200/90">
          An intimate coastal sanctuary offering timeless hospitality, curated experiences, and suites designed for quiet indulgence.
        </p>

        {/* Replacement: Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/login"
            className="w-full sm:w-auto bg-stone-100 text-neutral-900 hover:bg-amber-100 px-8 py-3.5 text-xs font-semibold uppercase tracking-widest transition-all shadow-lg hover:scale-105"
          >
            Book Your Stay
          </Link>
          
          <a
            href="#rooms"
            className="w-full sm:w-auto bg-neutral-900/60 backdrop-blur-md border border-stone-300/40 text-stone-100 hover:bg-neutral-800/80 px-8 py-3.5 text-xs font-semibold uppercase tracking-widest transition-all hover:border-white"
          >
            Explore Suites
          </a>
        </div>

        {/* Subtle Highlight Pills Below Buttons */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-6 md:gap-12 text-[11px] font-light text-stone-300/80 uppercase tracking-widest border-t border-white/10 pt-8 w-full max-w-2xl">
          <span className="flex items-center gap-2">
            <span className="text-amber-400">✦</span> Private Beachfront
          </span>
          <span className="flex items-center gap-2">
            <span className="text-amber-400">✦</span> Michelin-Star Dining
          </span>
          <span className="flex items-center gap-2">
            <span className="text-amber-400">✦</span> Bespoke Concierge
          </span>
        </div>

      </div>
    </section>
  );
}