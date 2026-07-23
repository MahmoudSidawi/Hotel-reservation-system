import HeroSection from "./components/hero-section";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import RoomsSection from "./components/rooms-section";
import Amenities from "./components/amenities";
import Testimonials from "./components/testimonials";
import CTASection from "./components/cta-section";
import Newsletter from "./components/newsletter";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <RoomsSection />
      <Amenities />
      <Testimonials />
      <CTASection />
      <Newsletter />
      <Footer />
    </main>
  );}