"use client";
export default function Newsletter() {
  return (
    <section className="py-16 bg-stone-50 border-t border-neutral-200 text-center px-4">
      <div className="max-w-xl mx-auto">
        <h3 className="text-2xl font-serif mb-2">The Velora Collection</h3>
        <p className="text-xs text-neutral-500 mb-6">
          Join our list to receive exclusive offers, seasonal updates, and priority booking for our signature suites.
        </p>
        <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="Your email address"
            className="bg-white border border-neutral-300 text-sm px-4 py-2.5 flex-1 focus:outline-none"
          />
          <button className="bg-neutral-900 text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}