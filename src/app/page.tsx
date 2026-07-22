import HeroSection from "./components/hero-section";
import RoomsSection from "./components/rooms-section";
import Amenities from "./components/amenities";
import Testimonials from "./components/testimonials";
import CTASection from "./components/cta-section";
import Newsletter from "./components/newsletter";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <RoomsSection />
      <Amenities />
      <Testimonials />
      <CTASection />
      <Newsletter />
    </main>
  );}