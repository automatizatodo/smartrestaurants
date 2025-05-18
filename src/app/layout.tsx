
import type { Metadata, Viewport } from 'next';
import { Geist, Cinzel } from 'next/font/google'; // Changed from Geist_Sans
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from '@/context/LanguageContext';
import AppInitializer from '@/components/AppInitializer';
import caCommon from '@/locales/ca/common.json'; // For default metadata
import CookieConsentBanner from '@/components/common/CookieConsentBanner';

const geist = Geist({ // Changed from geistSans and GeistSansFont
  variable: '--font-geist-sans', // CSS variable name can remain
  subsets: ['latin'],
});

const cinzel = Cinzel({ // Changed from cinzelFont
  variable: '--font-cinzel',
  subsets: ['latin'],
  weight: ['400', '700'],
});

// Default metadata, primarily in Catalan as it's the default language
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
        url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/og-image.png`, // Default OG image
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
    images: [`${process.env.NEXT_PUBLIC_APP_URL || ''}/twitter-image.png`], // Default Twitter image
    // site: '@yourTwitterHandle', // Uncomment and replace if you have a Twitter handle
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
    // apple: '/apple-touch-icon.png', // Add if you have an apple touch icon
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
        className={`${geist.variable} ${cinzel.variable} antialiased`} // Updated to use geist.variable
        suppressHydrationWarning={true}
      >
        <LanguageProvider>
          <AppInitializer />
          {children}
          <Toaster />
          <CookieConsentBanner />
        </LanguageProvider>
      </body>
    </html>
  );
}
