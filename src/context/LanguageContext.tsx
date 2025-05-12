
"use client";

import type { Dispatch, ReactNode, SetStateAction } from 'react';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

// Import locale data
import enCommon from '@/locales/en/common.json';
import enLanding from '@/locales/en/landing.json';
import enMenu from '@/locales/en/menu.json';
import enTestimonials from '@/locales/en/testimonials.json';

import esCommon from '@/locales/es/common.json';
import esLanding from '@/locales/es/landing.json';
import esMenu from '@/locales/es/menu.json';
import esTestimonials from '@/locales/es/testimonials.json';

type Locale = 'en' | 'es';

interface Translations {
  common: Record<string, string>;
  landing: Record<string, string>;
  menu: Record<string, string>;
  testimonials: Record<string, string>;
  [key: string]: Record<string, string>; // For dynamic namespace access
}

const translationsData: Record<Locale, Translations> = {
  en: {
    common: enCommon,
    landing: enLanding,
    menu: enMenu,
    testimonials: enTestimonials,
  },
  es: {
    common: esCommon,
    landing: esLanding,
    menu: esMenu,
    testimonials: esTestimonials,
  },
};

interface LanguageContextType {
  language: Locale;
  setLanguage: Dispatch<SetStateAction<Locale>>;
  t: (keyWithNamespace: string, params?: Record<string, string | number>) => string;
  translations: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Locale>('en');
  const [currentTranslations, setCurrentTranslations] = useState<Translations>(translationsData.en);

  useEffect(() => {
    const browserLang = navigator.language.split('-')[0] as Locale;
    if (browserLang === 'es' && translationsData.es) {
      setLanguage('es');
      setCurrentTranslations(translationsData.es);
    } else {
      setLanguage('en');
      setCurrentTranslations(translationsData.en);
    }
  }, []);

  useEffect(() => {
    setCurrentTranslations(translationsData[language] || translationsData.en);
  }, [language]);

  const t = useCallback(
    (keyWithNamespace: string, params?: Record<string, string | number>) => {
      const parts = keyWithNamespace.split(':');
      let namespace: string;
      let key: string;

      if (parts.length === 2) {
        [namespace, key] = parts;
      } else {
        // Default to 'common' namespace if not specified, or handle error
        namespace = 'common';
        key = keyWithNamespace;
      }
      
      let translation = keyWithNamespace; // Fallback to the key itself

      if (currentTranslations[namespace] && typeof currentTranslations[namespace][key] === 'string') {
        translation = currentTranslations[namespace][key];
      } else if (currentTranslations.common && typeof currentTranslations.common[keyWithNamespace] === 'string') {
        // Fallback to common namespace if full key (e.g. "button.submit") is there
         translation = currentTranslations.common[keyWithNamespace];
      }


      if (params) {
        Object.keys(params).forEach(paramKey => {
          const regex = new RegExp(`{${paramKey}}`, 'g');
          translation = translation.replace(regex, String(params[paramKey]));
        });
      }
      return translation;
    },
    [currentTranslations]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations: currentTranslations }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
