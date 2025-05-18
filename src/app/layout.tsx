
import type { Metadata, Viewport } from 'next';
import { Geist, Cinzel as CinzelFont } from 'next/font/google'; // Changed Geist_Sans to Geist
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from '@/context/LanguageContext';
import AppInitializer from '@/components/AppInitializer';
import caCommon from '@/locales/ca/common.json'; 
import CookieConsentBanner from '@/components/common/CookieConsentBanner';

const geistSans = Geist({ // Use Geist directly
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const cinzel = CinzelFont({ 
  variable: '--font-cinzel',
  subsets: ['latin'],
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: {
    default: `${caCommon.seo.defaultTitleSuffix ? caCommon.seo.defaultTitleSuffix : 'Can Fanals | Restaurant a Sabadell'}`,
    template: `%s | ${caCommon.restaurantName || 'Can Fanals'}`,
  },
  description: caCommon.seo.defaultDescription || 'Descobreix Can Fanals, el teu restaurant a Sabadell especialitzat en carns a la brasa, cuina tradicional catalana i opcions sense gluten. Reserva la teva taula!',
  keywords: ['restaurant a Sabadell', 'cuina catalana', 'brasa', 'sense gluten', 'Can Fanals Sabadell', 'menjar a Sabadell'],
  authors: [{ name: 'Can Fanals', url: process.env.NEXT_PUBLIC_APP_URL }],
  openGraph: {
    title: `${caCommon.seo.defaultTitleSuffix ? caCommon.seo.defaultTitleSuffix : 'Can Fanals | Restaurant a Sabadell'}`,
    description: caCommon.seo.defaultDescription || 'Descobreix Can Fanals, el teu restaurant a Sabadell especialitzat en carns a la brasa, cuina tradicional catalana i opcions sense gluten. Reserva la teva taula!',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: caCommon.restaurantName || 'Can Fanals',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/og-image.png`, 
        width: 1200,
        height: 630,
        alt: `Logo de ${caCommon.restaurantName || 'Can Fanals'}`,
      },
    ],
    locale: 'ca_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${caCommon.seo.defaultTitleSuffix ? caCommon.seo.defaultTitleSuffix : 'Can Fanals | Restaurant a Sabadell'}`,
    description: caCommon.seo.defaultDescription || 'Descobreix Can Fanals, el teu restaurant a Sabadell especialitzat en carns a la brasa, cuina tradicional catalana i opcions sense gluten. Reserva la teva taula!',
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
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="ca" className="dark">
      <head>
        {gaId && gaId !== "YOUR_GA_MEASUREMENT_ID_HERE" && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}></script>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body
        className={`${geistSans.variable} ${cinzel.variable} antialiased`}
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
