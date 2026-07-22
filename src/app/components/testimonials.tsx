const REVIEWS = [
  {
    quote: "The level of attention at Velora is unmatched. I've stayed at the finest hotels in Paris and New York, but nothing compares to the quiet peace found here by the shore.",
    name: "JULIANNE VANCE",
    role: "Oceanfront Resident",
  },
  {
    quote: "Waking up to the sound of the sea through floor-to-ceiling windows is a transformational experience. The Lumière dining experience was a true gastronomic journey.",
    name: "MARC-ANTOINE DUPONT",
    role: "Signature Suite Guest",
  },
  {
    quote: "A true sanctuary of stillness. The private wellness sessions at sunrise were the highlight of my stay. I left feeling more grounded than I have in years.",
    name: "SIENNA MILLER",
    role: "Wellness Retreat",
  },
];

export default function Testimonials() {
  return (
    <section id="stories" className="py-20 bg-stone-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-5xl font-serif mb-2">Guest Stories</h2>
            <p className="text-xs text-neutral-500 uppercase tracking-wider">
              Discover the experiences shared by our distinguished guests from around the globe.
            </p>
          </div>
          <div className="hidden sm:flex gap-2">
            <button className="w-10 h-10 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-900 hover:text-white transition-colors">←</button>
            <button className="w-10 h-10 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-900 hover:text-white transition-colors">→</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {REVIEWS.map((rev, idx) => (
            <div key={idx} className="bg-white p-8 border border-neutral-200 flex flex-col justify-between">
              <div>
                <div className="text-amber-500 text-xs mb-4">★★★★★</div>
                <p className="text-sm font-serif italic text-neutral-700 leading-relaxed mb-6">
                  &quot;{rev.quote}&quot;
                </p>
              </div>
              <div className="border-t border-neutral-100 pt-4">
                <p className="text-xs font-bold tracking-widest uppercase text-neutral-900">{rev.name}</p>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider">{rev.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}