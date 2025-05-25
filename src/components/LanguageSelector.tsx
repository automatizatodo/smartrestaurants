
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

  const isTransparent = variant === 'transparent-header';

  return (
    <div className="flex items-center space-x-2">
      <Select value={language} onValueChange={handleLanguageChange}>
        <SelectTrigger
          className={cn(
            "w-auto bg-transparent border-none focus:ring-0 focus:ring-offset-0",
            isTransparent ? "text-white/90 hover:bg-white/10" : "text-foreground/80 hover:bg-accent/50"
          )}
          aria-label={t('common:languageSelector.label')}
        >
          <Globe className={cn("h-5 w-5", isTransparent ? "text-white/90" : "text-foreground/80")} />
          <SelectValue 
            placeholder={t('common:languageSelector.selectPlaceholder')} 
            className={cn(isTransparent ? "text-white/90 placeholder:text-white/70" : "text-foreground placeholder:text-muted-foreground")}
          />
        </SelectTrigger>
        <SelectContent align="end" className="min-w-[120px]">
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
