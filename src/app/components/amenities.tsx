const AMENITIES = [
  { title: "PRIVATE CHEF", desc: "Personalized fine dining in your suite", icon: "🍳" },
  { title: "DIGITAL CONCIERGE", desc: "24/7 service at your fingertips", icon: "📱" },
  { title: "VELORA SECURITY", desc: "Elite protection and privacy", icon: "🛡️" },
  { title: "Delicious Dinner", desc: "Seaside & Middle Eastern cuisines", icon: "🍳" },
  { title: "PRIVATE BEACH", desc: "Exclusive access to Seafront Bay", icon: "🏖️" },
  { title: "Fresh Drinks", desc: "Curated artisanal fresh & soft drinks", icon: "🍸" },
];

export default function Amenities() {
  return (
    <section id="amenities" className="py-20 bg-stone-100/50 text-neutral-900 px-8 md:px-16 lg:px-20">
      <div className="max-w-7xl mx-auto text-center">
        <span className="text-xs uppercase tracking-widest text-amber-700 font-semibold block mb-2">
          REFINED EXPERIENCES
        </span>
        <h2 className="text-3xl md:text-5xl font-serif mb-4">Hotel Amenities</h2>
        <p className="italic font-serif text-neutral-500 text-sm max-w-xl mx-auto mb-16">
          &quot;Curated touches and artisanal services designed to elevate your coastal retreat into a memory of timeless elegance.&quot;
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {AMENITIES.map((item, idx) => (
            <div
              key={idx}
              className="
                bg-white p-6 
                border border-stone-200 
                rounded-sm
                cursor-pointer
                
                /* Transition for smooth movement and border change */
                transition-all duration-300 ease-out
                
                /* Lift up effect */
                hover:-translate-y-2 
                
                /* Custom border on hover */
                hover:border-amber-700/80 
                
                /* Subtle elevation shadow */
                hover:shadow-xl
              "
            >
              <span className="text-2xl mb-3 block">{item.icon}</span>
              <h4 className="text-xs font-bold tracking-wider uppercase mb-2 text-neutral-800">
                {item.title}
              </h4>
              <p className="text-[11px] text-neutral-500 leading-snug font-light">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}