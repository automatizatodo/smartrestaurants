
"use client";

import { useLanguage } from '@/context/LanguageContext';
import { useEffect } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import { Lora } from 'next/font/google';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
const lora = Lora({ variable: '--font-lora', subsets: ['latin'], weight: ['400', '700'] });

export default function AppInitializer({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Set initial lang attribute, will be updated by useEffect after hydration
  // This helps avoid a flash of incorrect lang if server render defaults to 'en'
  // and client detects 'es'.
  return (
    <html lang={typeof window === 'undefined' ? 'en' : language} className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
