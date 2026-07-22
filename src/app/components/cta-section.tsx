export default function CTASection() {
  return (
    <section className="relative py-32 bg-neutral-900 text-white text-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30" 
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000')` }}
      />
      <div className="relative z-10 max-w-3xl mx-auto px-4">
        <span className="text-xs uppercase tracking-widest text-amber-200 font-semibold block mb-3">
          YOUR ESCAPE AWAITS
        </span>
        <h2 className="text-3xl md:text-5xl font-serif mb-4">
          Begin Your Velora Experience
        </h2>
        <p className="italic font-serif text-neutral-300 text-sm mb-8">
          &quot;Reserve your stay and let us craft an unforgettable escape designed around your rhythm.&quot;
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="w-full sm:w-auto bg-amber-200 text-neutral-900 px-8 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-amber-300 transition-colors">
            Book Your Stay
          </button>
          <button className="w-full sm:w-auto border border-white text-white px-8 py-3 text-xs uppercase tracking-widest hover:bg-white hover:text-neutral-900 transition-colors">
            Explore Amenities
          </button>
        </div>
      </div>
    </section>
  );
}