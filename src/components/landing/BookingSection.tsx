
"use client";

import { useState, useEffect, useRef, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Users, Clock, Loader2 } from "lucide-react";
import { submitBooking, type BookingFormState } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import restaurantConfig from '@/config/restaurant.config';
import { useLanguage } from "@/context/LanguageContext";
import { es, enUS as en, ca } from 'date-fns/locale';

// WhatsApp Icon SVG
const WhatsAppIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="mr-2"
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.487 5.235 3.487 8.413 0 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.712-1.002z" />
  </svg>
);


function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useLanguage();

  if (restaurantConfig.bookingMethod === 'whatsapp') {
    return (
      <Button 
        type="submit" 
        disabled={pending} 
        className="w-full bg-[#25D366] text-white hover:bg-[#1DA851] focus:ring-2 focus:ring-offset-2 focus:ring-[#25D366]/50"
      >
        {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <WhatsAppIcon />}
        {t('landing:booking.buttonTextWhatsapp')}
      </Button>
    );
  }

  return (
    <Button type="submit" disabled={pending} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {t('landing:booking.buttonText')}
    </Button>
  );
}

export default function BookingSection() {
  const { t, language, translations } = useLanguage();
  const restaurantName = translations.common.restaurantName;
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [selectedGuests, setSelectedGuests] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  
  let dateLocale;
  if (language === 'es') dateLocale = es;
  else if (language === 'ca') dateLocale = ca;
  else dateLocale = en;


  const initialState: BookingFormState = { 
    messageKey: null, 
    success: false, 
    errors: null, 
    messageParams: null 
  };
  const [state, formAction] = useActionState(submitBooking, initialState);

  useEffect(() => {
    if (state?.messageKey) {
      toast({
        title: state.success ? t('landing:booking.toast.successTitle') : t('landing:booking.toast.errorTitle'),
        description: t(state.messageKey, state.messageParams || undefined),
        variant: state.success ? "default" : "destructive",
      });

      if (state.success) {
        if (state.bookingMethod === 'whatsapp' && state.whatsappNumber && state.whatsappMessage) {
          const whatsappUrl = `https://wa.me/${state.whatsappNumber}?text=${encodeURIComponent(state.whatsappMessage)}`;
          console.log("CLIENT_BOOKING: Opening WhatsApp URL:", whatsappUrl);
          window.open(whatsappUrl, '_blank');
        }
        formRef.current?.reset();
        setDate(new Date());
        setSelectedTime(undefined);
        setSelectedGuests(undefined);
      }
    }
  }, [state, toast, t]);


  return (
    <section id="booking" className="py-16 sm:py-24 bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-foreground mb-4">
            {t('landing:booking.sectionTitle')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('landing:booking.sectionDescription')}
          </p>
        </div>

        <Card className="max-w-2xl mx-auto shadow-xl">
          <form action={formAction} ref={formRef} className="space-y-6">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">{t('landing:booking.cardTitle')}</CardTitle>
              <CardDescription>
                {t(restaurantConfig.bookingMethod === 'whatsapp' ? 'landing:booking.cardDescriptionWhatsapp' : 'landing:booking.cardDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">{t('landing:booking.label.name')}</Label>
                  <Input id="name" name="name" placeholder={t('landing:booking.placeholder.name')} className="bg-input mt-1" />
                  {state?.errors?.name && <p className="text-sm text-destructive mt-1">{state.errors.name.map(errKey => t(errKey)).join(", ")}</p>}
                </div>
                <div>
                  <Label htmlFor="email">{t('landing:booking.label.email')}</Label>
                  <Input id="email" name="email" type="email" placeholder={t('landing:booking.placeholder.email')} className="bg-input mt-1" />
                  {state?.errors?.email && <p className="text-sm text-destructive mt-1">{state.errors.email.map(errKey => t(errKey)).join(", ")}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="phone">{t('landing:booking.label.phone')}</Label>
                <Input id="phone" name="phone" type="tel" placeholder={t('landing:booking.placeholder.phone')} className="bg-input mt-1" />
                {state?.errors?.phone && <p className="text-sm text-destructive mt-1">{state.errors.phone.map(errKey => t(errKey)).join(", ")}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="date-popover">{t('landing:booking.label.date')}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date-popover"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1 bg-input",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP", { locale: dateLocale }) : <span>{t('landing:booking.placeholder.date')}</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        disabled={(d) => d < new Date(new Date().setDate(new Date().getDate() -1))}
                        locale={dateLocale}
                      />
                    </PopoverContent>
                  </Popover>
                  <input type="hidden" name="date" value={date ? format(date, "yyyy-MM-dd") : ""} />
                  {state?.errors?.date && <p className="text-sm text-destructive mt-1">{state.errors.date.map(errKey => t(errKey)).join(", ")}</p>}
                </div>
                <div>
                  <Label htmlFor="time">{t('landing:booking.label.time')}</Label>
                  <Select name="time" value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger id="time" className="w-full mt-1 bg-input">
                      <Clock className="mr-2 h-4 w-4 inline-block" />
                      <SelectValue placeholder={t('landing:booking.placeholder.time')} />
                    </SelectTrigger>
                    <SelectContent>
                      {restaurantConfig.bookingTimeSlots.map(slot => (
                        <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {state?.errors?.time && <p className="text-sm text-destructive mt-1">{state.errors.time.map(errKey => t(errKey)).join(", ")}</p>}
                </div>
                <div>
                  <Label htmlFor="guests">{t('landing:booking.label.guests')}</Label>
                  <Select name="guests" value={selectedGuests} onValueChange={setSelectedGuests}>
                    <SelectTrigger id="guests" className="w-full mt-1 bg-input">
                      <Users className="mr-2 h-4 w-4 inline-block" />
                      <SelectValue placeholder={t('landing:booking.placeholder.guests')} />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(restaurantConfig.bookingMaxGuestsPerSlot || 8)].map((_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1} {t(i === 0 ? 'common:guestSingular' : 'common:guestsPlural', {count: i+1})}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {state?.errors?.guests && <p className="text-sm text-destructive mt-1">{state.errors.guests.map(errKey => t(errKey)).join(", ")}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="notes">{t('landing:booking.label.notes', { restaurantName })}</Label>
                <Input id="notes" name="notes" placeholder={t('landing:booking.placeholder.notes')} className="bg-input mt-1" />
                {state?.errors?.notes && <p className="text-sm text-destructive mt-1">{state.errors.notes.map(errKey => t(errKey)).join(", ")}</p>}
              </div>
              {state?.errors?.general && (
                <p className="text-sm text-destructive mt-1 text-center">
                  {state.errors.general.map(errKey => t(errKey, state.messageParams || undefined )).join(' ')}
                </p>
              )}
            </CardContent>
            <CardFooter>
              <SubmitButton />
            </CardFooter>
          </form>
        </Card>
      </div>
    </section>
  );
}
