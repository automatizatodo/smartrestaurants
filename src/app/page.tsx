
import Header from '@/components/landing/Header';
import HeroSection from '@/components/landing/HeroSection';
import AboutUsSection from '@/components/landing/AboutUsSection';
import InteractiveMenu from '@/components/landing/InteractiveMenu';
import ServicesSection from '@/components/landing/ServicesSection'; // Import the new section
import AISommelierSection from '@/components/landing/AISommelierSection';
import BookingSection from '@/components/landing/BookingSection';
import ContactMapSection from '@/components/landing/ContactMapSection';
import TestimonialCarousel from '@/components/landing/TestimonialCarousel';
import Footer from '@/components/landing/Footer';
import { fetchMenuFromGoogleSheet } from '@/services/menuService';
import type { MenuItemData } from '@/data/menu';

export const dynamic = 'force-dynamic'; // Ensures the page is always server-rendered

export default async function HomePage() {
  const menuItems: MenuItemData[] = await fetchMenuFromGoogleSheet();
  console.log("HOMEPAGE_LOG: Received menuItems in HomePage:", JSON.stringify(menuItems, null, 2));

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <AboutUsSection />
        <InteractiveMenu menuItems={menuItems} />
        <ServicesSection /> {/* Add the new section here */}
        <AISommelierSection />
        <BookingSection />
        <ContactMapSection />
        <TestimonialCarousel />
      </main>
      <Footer />
    </div>
  );
}
