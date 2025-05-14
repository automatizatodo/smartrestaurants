
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Lora } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from '@/context/LanguageContext';
import AppInitializer from '@/components/AppInitializer';

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

export const metadata: Metadata = {
  // Title and description can be set dynamically if needed, or statically here.
  // Example:
  // title: "Restaurant Title",
  // description: "Restaurant Description"
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
    <html lang="en" className="dark"> {/* Default lang, AppInitializer will update */}
      <body className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} antialiased`}>
        <LanguageProvider>
          <AppInitializer /> {/* Runs client-side effects like setting lang */}
          {children}
          <Toaster />
        </LanguageProvider>
      </body>
    </html>
  );
}
