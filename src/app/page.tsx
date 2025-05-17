
import Header from '@/components/landing/Header';
import HeroSection from '@/components/landing/HeroSection';
import AboutUsSection from '@/components/landing/AboutUsSection';
import InteractiveMenu from '@/components/landing/InteractiveMenu';
import ServicesSection from '@/components/landing/ServicesSection';
import AISommelierSection from '@/components/landing/AISommelierSection';
import BookingSection from '@/components/landing/BookingSection';
import ContactMapSection from '@/components/landing/ContactMapSection';
import TestimonialCarousel from '@/components/landing/TestimonialCarousel';
import Footer from '@/components/landing/Footer';
import { fetchMenuFromGoogleSheet } from '@/services/menuService';
import type { MenuItemData } from '@/data/menu';
import restaurantConfig from '@/config/restaurant.config'; // Import config
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const menuItems: MenuItemData[] = await fetchMenuFromGoogleSheet();
  console.log("HOMEPAGE_LOG: Received menuItems in HomePage:", JSON.stringify(menuItems.slice(0,2), null, 2)); // Log first 2 items for brevity

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <ServicesSection /> {/* Moved ServicesSection here */}
        <Suspense fallback={<div className="text-center py-10">Loading menu...</div>}>
          <InteractiveMenu menuItems={menuItems} />
        </Suspense>
        <AboutUsSection /> {/* Moved AboutUsSection here */}
        {restaurantConfig.showAISommelierSection && <AISommelierSection />}
        <BookingSection />
        <ContactMapSection />
        <TestimonialCarousel />
      </main>
      <Footer />
    </div>
  );
}
