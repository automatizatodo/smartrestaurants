
import Header from '@/components/landing/Header';
import HeroSection from '@/components/landing/HeroSection';
import InteractiveMenu from '@/components/landing/InteractiveMenu';
import AISommelierSection from '@/components/landing/AISommelierSection';
import BookingSection from '@/components/landing/BookingSection';
import TestimonialCarousel from '@/components/landing/TestimonialCarousel';
import Footer from '@/components/landing/Footer';
import { fetchMenuFromGoogleSheet } from '@/services/menuService';
import type { MenuItemData } from '@/data/menu';

export default async function HomePage() {
  const menuItems: MenuItemData[] = await fetchMenuFromGoogleSheet();
  console.log("HOMEPAGE_LOG: Received menuItems in HomePage:", JSON.stringify(menuItems, null, 2));

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <InteractiveMenu menuItems={menuItems} />
        <AISommelierSection />
        <BookingSection />
        <TestimonialCarousel />
      </main>
      <Footer />
    </div>
  );
}
