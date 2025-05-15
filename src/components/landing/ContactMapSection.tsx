
"use client";

import { useLanguage } from '@/context/LanguageContext';
import restaurantConfig from '@/config/restaurant.config';
import { MapPin, Phone, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function ContactMapSection() {
  const { t } = useLanguage();

  return (
    <section id="contact-map" className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-foreground mb-4">
            {t('landing:contactMap.sectionTitle')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('landing:contactMap.sectionDescription')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Contact Information Column */}
          <div className="space-y-8 bg-card p-8 rounded-lg shadow-lg">
            <div>
              <h3 className="text-2xl font-serif font-semibold text-primary mb-4">{t('landing:contactMap.contactDetailsTitle')}</h3>
              <div className="space-y-4 text-foreground/90">
                <div className="flex items-start">
                  <MapPin className="h-6 w-6 mr-3 mt-1 text-primary shrink-0" />
                  <div>
                    <p className="font-medium">{t('landing:contactMap.addressLabel')}</p>
                    <p>{restaurantConfig.address}</p>
                    <Link href={restaurantConfig.googleMapsLink} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline inline-flex items-center mt-1">
                      {t('landing:contactMap.getDirections')} <ExternalLink className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="h-6 w-6 mr-3 text-primary shrink-0" />
                  <div>
                    <p className="font-medium">{t('landing:contactMap.phoneLabel')}</p>
                    <a href={restaurantConfig.phoneHref} className="hover:text-primary transition-colors">{restaurantConfig.phone}</a>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="h-6 w-6 mr-3 text-primary shrink-0" />
                  <div>
                    <p className="font-medium">{t('landing:contactMap.emailLabel')}</p>
                    <a href={restaurantConfig.emailHref} className="hover:text-primary transition-colors">{restaurantConfig.email}</a>
                  </div>
                </div>
              </div>
            </div>
            {/* You can add opening hours here if needed */}
            {/* <div>
              <h4 className="text-xl font-serif font-semibold text-primary mb-3">{t('landing:contactMap.openingHoursTitle')}</h4>
              <ul className="text-foreground/80 text-sm space-y-1">
                <li>{t('landing:contactMap.hours.mondayFriday')}: 12:00 PM - 10:00 PM</li>
                <li>{t('landing:contactMap.hours.saturday')}: 11:00 AM - 11:00 PM</li>
                <li>{t('landing:contactMap.hours.sunday')}: Closed</li>
              </ul>
            </div> */}
          </div>

          {/* Google Maps Embed Column */}
          <div className="h-[400px] md:h-full w-full rounded-lg overflow-hidden shadow-xl border border-border">
            {restaurantConfig.googleMapsEmbedUrl ? (
              <iframe
                src={restaurantConfig.googleMapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={t('landing:contactMap.mapTitle', { restaurantName: t('common:restaurantName') })}
              ></iframe>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                {t('landing:contactMap.mapUnavailable')}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
