
import Link from 'next/link';
import { Instagram, Facebook, Twitter, Youtube, MapPin, Phone, Mail, Wine } from 'lucide-react';
import restaurantConfig from '@/config/restaurant.config'; // Import config

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-muted-foreground border-t border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-4">
                <Wine className="h-8 w-8 text-primary" />
                <span className="text-2xl font-serif font-bold text-foreground">{restaurantConfig.restaurantName}</span>
            </Link>
            <p className="text-sm">
              {/* Using tagline from config might be too long, keeping generic description */}
              Experience culinary artistry where every dish is a masterpiece and every meal an unforgettable journey.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="font-serif text-lg font-semibold text-foreground mb-4">Quick Links</h5>
            <ul className="space-y-2 text-sm">
              <li><Link href="#hero" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="#menu" className="hover:text-primary transition-colors">Menu</Link></li>
              <li><Link href="#ai-sommelier" className="hover:text-primary transition-colors">AI Sommelier</Link></li>
              <li><Link href="#booking" className="hover:text-primary transition-colors">Book a Table</Link></li>
              <li><Link href="#testimonials" className="hover:text-primary transition-colors">Testimonials</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h5 className="font-serif text-lg font-semibold text-foreground mb-4">Contact Us</h5>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 mt-0.5 text-primary shrink-0" />
                <span>{restaurantConfig.address}</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-primary shrink-0" />
                <a href={restaurantConfig.phoneHref} className="hover:text-primary transition-colors">{restaurantConfig.phone}</a>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-primary shrink-0" />
                <a href={restaurantConfig.emailHref} className="hover:text-primary transition-colors">{restaurantConfig.email}</a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h5 className="font-serif text-lg font-semibold text-foreground mb-4">Follow Us</h5>
            <div className="flex space-x-4">
              {restaurantConfig.socialMediaLinks.facebook && (
                <Link href={restaurantConfig.socialMediaLinks.facebook} aria-label="Facebook" className="text-muted-foreground hover:text-primary transition-colors">
                  <Facebook className="h-6 w-6" />
                </Link>
              )}
              {restaurantConfig.socialMediaLinks.instagram && (
                <Link href={restaurantConfig.socialMediaLinks.instagram} aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors">
                  <Instagram className="h-6 w-6" />
                </Link>
              )}
              {restaurantConfig.socialMediaLinks.twitter && (
                <Link href={restaurantConfig.socialMediaLinks.twitter} aria-label="Twitter" className="text-muted-foreground hover:text-primary transition-colors">
                  <Twitter className="h-6 w-6" />
                </Link>
              )}
               {restaurantConfig.socialMediaLinks.youtube && (
                <Link href={restaurantConfig.socialMediaLinks.youtube} aria-label="Youtube" className="text-muted-foreground hover:text-primary transition-colors">
                  <Youtube className="h-6 w-6" />
                </Link>
              )}
            </div>
            <p className="text-xs mt-6">Stay updated with our latest creations and events.</p>
          </div>
        </div>

        <div className="border-t border-border/50 pt-8 text-center text-sm">
          <p>&copy; {currentYear} {restaurantConfig.restaurantName}. All rights reserved. Designed with passion.</p>
        </div>
      </div>
    </footer>
  );
}
