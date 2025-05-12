
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Lora } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from '@/context/LanguageContext';
import AppInitializer from '@/components/AppInitializer';
// Import a default set of translations for metadata, assuming 'en' as fallback or initial.
// In a more advanced setup, this could be dynamic based on URL or other detection.
import enCommon from '@/locales/en/common.json';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const lora = Lora({
  variable: '--font-lora',
  subsets: ['latin'],
  weight: ['400', '700'],
});

// generateMetadata can't easily access browser language, so we use default English.
// For fully dynamic metadata based on user lang, a different strategy (e.g. path-based i18n) is needed.
export const metadata: Metadata = {
  title: enCommon.restaurantName,
  description: enCommon.tagline,
};

export const viewport: Viewport = {
  themeColor: [ // Example theme colors, adjust as needed
    { media: '(prefers-color-scheme: light)', color: 'hsl(var(--background))' },
    { media: '(prefers-color-scheme: dark)', color: 'hsl(var(--background))' },
  ],
  // Add other viewport settings if necessary
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LanguageProvider>
      <AppInitializer>
        {children}
        <Toaster />
      </AppInitializer>
    </LanguageProvider>
  );
}
