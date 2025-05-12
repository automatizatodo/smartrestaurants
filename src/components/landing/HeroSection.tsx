
"use client";
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import restaurantConfig from '@/config/restaurant.config'; // Import config

export default function HeroSection() {
  const [offsetY, setOffsetY] = useState(0);
  const handleScroll = () => setOffsetY(window.pageYOffset);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center text-center overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{ transform: `translateY(${offsetY * 0.3}px)` }} // Parallax effect
      >
        <Image
          src={restaurantConfig.heroImageUrl} // Use config value
          alt={`${restaurantConfig.restaurantName} Ambiance`} // Use config value
          data-ai-hint={restaurantConfig.heroImageHint} // Use config value
          layout="fill"
          objectFit="cover"
          quality={80}
          priority
          className="brightness-50" // Darken image for text readability
        />
      </div>

      <div className="relative z-10 p-4 sm:p-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-6 shadow-text">
          {restaurantConfig.restaurantName} {/* Use config value */}
        </h1>
        <p className="text-xl sm:text-2xl md:text-3xl text-gray-200 mb-10 max-w-3xl mx-auto font-sans shadow-text">
          {restaurantConfig.tagline} {/* Use config value */}
        </p>
        <div className="space-x-4">
          <Link href="#menu" passHref>
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-4 rounded-md shadow-lg transition-transform hover:scale-105">
              View Our Menu
            </Button>
          </Link>
          <Link href="#booking" passHref>
            <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10 text-lg px-8 py-4 rounded-md shadow-lg transition-transform hover:scale-105">
              Book a Table
            </Button>
          </Link>
        </div>
      </div>
      <style jsx>{`
        .shadow-text {
          text-shadow: 0 2px 4px rgba(0,0,0,0.7);
        }
      `}</style>
    </section>
  );
}
