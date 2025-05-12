
import Header from '@/components/landing/Header';
import HeroSection from '@/components/landing/HeroSection';
import InteractiveMenu from '@/components/landing/InteractiveMenu';
import AISommelierSection from '@/components/landing/AISommelierSection';
import BookingSection from '@/components/landing/BookingSection';
import TestimonialCarousel from '@/components/landing/TestimonialCarousel';
import Footer from '@/components/landing/Footer';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <InteractiveMenu />
        <AISommelierSection />
        <BookingSection />
        <TestimonialCarousel />
      </main>
      <Footer />
    </div>
  );
}
