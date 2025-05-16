
"use client";
import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Facebook, Twitter, Youtube, MapPin, Phone, Mail } from 'lucide-react';
import restaurantConfig from '@/config/restaurant.config';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { t, translations } = useLanguage();
  const restaurantName = translations.common.restaurantName;
  const tagline = translations.common.tagline;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-muted-foreground border-t border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-4">
                {restaurantConfig.logoUrl ? (
                  <Image
                    src={restaurantConfig.logoUrl}
                    alt={`${restaurantName} Logo - ${t('footer.seoText', { restaurantName })}`}
                    width={432}
                    height={144}
                    className="h-36 w-auto dark:filter dark:invert"
                    style={{ objectFit: 'contain' }}
                  />
                ) : (
                  <span className="text-2xl font-serif font-bold text-foreground">{restaurantName}</span>
                )}
            </Link>
            <p className="text-sm">
              {tagline}
            </p>
          </div>

          <div>
            <h5 className="font-serif text-lg font-semibold text-foreground mb-4">{t('common:footer.quickLinks')}</h5>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-primary transition-colors">{t('common:footer.home')}</Link></li>
              <li><Link href="/menu" className="hover:text-primary transition-colors">{t('common:footer.menu')}</Link></li>
              <li><Link href="/#ai-sommelier" className="hover:text-primary transition-colors">{t('common:footer.aiSommelierLink')}</Link></li>
              <li><Link href="/#booking" className="hover:text-primary transition-colors">{t('common:footer.bookTableLink')}</Link></li>
              <li><Link href="/#testimonials" className="hover:text-primary transition-colors">{t('common:footer.testimonialsLink')}</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-serif text-lg font-semibold text-foreground mb-4">{t('common:footer.contactUs')}</h5>
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

          <div>
            <h5 className="font-serif text-lg font-semibold text-foreground mb-4">{t('common:footer.followUs')}</h5>
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
            <p className="text-xs mt-6">{t('common:footer.followUsDescription')}</p>
          </div>
        </div>

        <div className="border-t border-border/50 pt-8 text-center text-sm">
          <p className="mb-2">{t('common:footer.seoText', { restaurantName })}</p>
          <p>{t('common:footer.copyright', { year: currentYear, restaurantName: restaurantName })}</p>
          <p className="mt-2 text-xs">
            {t('common:footer.managedByText')}{' '}
            <Link href="https://automatizatodo.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
              {t('common:footer.managedByBrand')}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
