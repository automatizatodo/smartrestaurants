
import type { Metadata, Viewport } from 'next';
import { Geist, Cinzel } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from '@/context/LanguageContext';
import AppInitializer from '@/components/AppInitializer';
import caCommon from '@/locales/ca/common.json'; 
import CookieConsentBanner from '@/components/common/CookieConsentBanner';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'; // Import GA component

const geist = Geist({ 
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const cinzel = Cinzel({ 
  variable: '--font-cinzel',
  subsets: ['latin'],
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: {
    default: `${caCommon.restaurantName} | ${caCommon.seo.defaultTitleSuffix}`,
    template: `%s | ${caCommon.restaurantName}`,
  },
  description: caCommon.seo.defaultDescription,
  keywords: ['restaurant a Sabadell', 'cuina catalana', 'brasa', 'sense gluten', 'Can Fanals Sabadell', 'menjar a Sabadell'],
  authors: [{ name: 'Can Fanals', url: process.env.NEXT_PUBLIC_APP_URL }],
  openGraph: {
    title: `${caCommon.restaurantName} | ${caCommon.seo.defaultTitleSuffix}`,
    description: caCommon.seo.defaultDescription,
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: caCommon.restaurantName,
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/og-image.png`, 
        width: 1200,
        height: 630,
        alt: `Logo de ${caCommon.restaurantName}`,
      },
    ],
    locale: 'ca_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${caCommon.restaurantName} | ${caCommon.seo.defaultTitleSuffix}`,
    description: caCommon.seo.defaultDescription,
    images: [`${process.env.NEXT_PUBLIC_APP_URL || ''}/twitter-image.png`], 
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'hsl(var(--background))' },
    { media: '(prefers-color-scheme: dark)', color: 'hsl(var(--background))' },
  ],
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ca" className="dark">
      <body
        className={`${geist.variable} ${cinzel.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <LanguageProvider>
          <AppInitializer />
          {children}
          <Toaster />
          <CookieConsentBanner />
          {/* Add Google Analytics component here */}
          {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID !== "YOUR_GA_MEASUREMENT_ID_HERE" && (
            <GoogleAnalytics />
          )}
        </LanguageProvider>
      </body>
    </html>
  );
}
