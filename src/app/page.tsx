
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
import { fetchMenuData } from '@/services/menuService'; // Updated function name
import type { MenuItemData } from '@/data/menu';
import restaurantConfig from '@/config/restaurant.config';
import { Suspense } from 'react';
// import type { PriceSummary } from '@/app/api/menu/route'; // No longer needed

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // const { menuItems, currentMenuPrice, priceSummary } = await fetchMenuDataWithPrice(); // Old call
  const menuItems = await fetchMenuData(); // New call, only gets menuItems

  // console.log("HOMEPAGE_LOG: Received menuItems in HomePage:", JSON.stringify(menuItems, null, 2));

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <ServicesSection />
        <Suspense fallback={<div className="text-center py-10">Loading menu...</div>}>
          {/* InteractiveMenu no longer needs currentMenuPrice or priceSummary as props */}
          <InteractiveMenu menuItems={menuItems} />
        </Suspense>
        <AboutUsSection />
        {restaurantConfig.showAISommelierSection && <AISommelierSection />}
        <BookingSection />
        <ContactMapSection />
        <TestimonialCarousel />
      </main>
      <Footer />
    </div>
  );
}
