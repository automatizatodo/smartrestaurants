
import type { Metadata, Viewport } from 'next';
import { Geist, Cinzel as CinzelFont } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from '@/context/LanguageContext';
import AppInitializer from '@/components/AppInitializer';
import caCommon from '@/locales/ca/common.json';
import CookieConsentBanner from '@/components/common/CookieConsentBanner';

const geist = Geist({ 
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const cinzel = CinzelFont({ 
  variable: '--font-cinzel',
  subsets: ['latin'],
  weight: ['400', '700'],
});

const restaurantName = caCommon.restaurantName || 'Can Fanals';
const mainKeywords = caCommon.seo.mainKeywords || 'Restaurant a Sabadell - Brasa i Cuina Tradicional';
const defaultDescription = caCommon.seo.defaultDescription || 'Descobreix Can Fanals, el teu restaurant a Sabadell especialitzat en carns a la brasa, cuina tradicional catalana i opcions sense gluten. Reserva la teva taula!';
const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

export const metadata: Metadata = {
  title: {
    default: `${restaurantName} | ${mainKeywords}`,
    template: `%s | ${restaurantName}`,
  },
  description: defaultDescription,
  keywords: ['restaurant a Sabadell', 'cuina catalana', 'brasa', 'sense gluten', 'Can Fanals Sabadell', 'menjar a Sabadell'],
  authors: [{ name: restaurantName, url: appUrl }],
  openGraph: {
    title: `${restaurantName} | ${mainKeywords}`,
    description: defaultDescription,
    url: appUrl,
    siteName: restaurantName,
    images: [
      {
        url: `${appUrl}/og-image.png`, 
        width: 1200,
        height: 630,
        alt: `Logo de ${restaurantName}`,
      },
    ],
    locale: 'ca_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${restaurantName} | ${mainKeywords}`,
    description: defaultDescription,
    images: [`${appUrl}/twitter-image.png`], 
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
        className={`${geist.variable} ${cinzel.variable} antialiased`}
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
