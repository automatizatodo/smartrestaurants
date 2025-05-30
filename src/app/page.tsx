
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
import { fetchMenuDetails } from '@/services/menuService';
import type { MenuItemData } from '@/data/menu';
import restaurantConfig from '@/config/restaurant.config';
import { Suspense } from 'react';
import type { PriceSummary } from '@/app/api/menu/route';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { menuItems: allMenuItems, currentMenuPrice, priceSummary } = await fetchMenuDetails();

  // Filter for "Menú del Dia" items
  const menuDelDiaItems = allMenuItems.filter(item => item.isMenuDelDia && item.isVisible);

  console.log("HOMEPAGE_LOG: Received allMenuItems count:", allMenuItems.length);
  console.log("HOMEPAGE_LOG: Filtered menuDelDiaItems count:", menuDelDiaItems.length);
  // console.log("HOMEPAGE_LOG: Current Menu Price:", currentMenuPrice);
  // console.log("HOMEPAGE_LOG: Price Summary:", JSON.stringify(priceSummary, null, 2));

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <ServicesSection />
        <Suspense fallback={<div className="text-center py-10">Loading menu...</div>}>
          <InteractiveMenu
            menuItems={menuDelDiaItems}
            currentMenuPrice={currentMenuPrice}
            priceSummary={priceSummary}
          />
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
