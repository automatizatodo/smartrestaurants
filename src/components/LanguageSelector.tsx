
"use client";

import { useLanguage } from '@/context/LanguageContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageSelectorProps {
  variant?: 'default' | 'transparent-header';
}

export default function LanguageSelector({ variant = 'default' }: LanguageSelectorProps) {
  const { language, setLanguage, t } = useLanguage();

  const languages = [
    { code: 'ca', name: 'Català' },
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' },
  ];

  const handleLanguageChange = (value: string) => {
    setLanguage(value as 'en' | 'es' | 'ca');
  };

  const isTransparentHeader = variant === 'transparent-header';

  return (
    <div className="flex items-center space-x-2">
      <Select value={language} onValueChange={handleLanguageChange}>
        <SelectTrigger
          className={cn(
            "w-auto border-none focus:ring-0 focus:ring-offset-0",
            isTransparentHeader 
              ? "bg-transparent text-primary-foreground hover:bg-white/10" 
              : "bg-transparent text-sidebar-foreground hover:bg-sidebar-accent/50"
          )}
          aria-label={t('common:languageSelector.label')}
        >
          <Globe className={cn(
            "h-5 w-5",
            isTransparentHeader ? "text-primary-foreground/80" : "text-sidebar-foreground/80"
            )} />
          <SelectValue 
            placeholder={t('common:languageSelector.selectPlaceholder')} 
            className={cn(isTransparentHeader ? "text-primary-foreground" : "text-sidebar-foreground")}
          />
        </SelectTrigger>
        <SelectContent 
            align="end" 
            className={cn(
                "min-w-[120px]",
                isTransparentHeader ? "bg-background text-foreground" : "bg-sidebar-background text-sidebar-foreground" // Ensure dropdown matches header context
            )}
        >
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
