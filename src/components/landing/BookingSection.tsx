
"use client";

import { useState, useEffect, useRef }
// Remove useActionState for simplified test
// import { useActionState } from "react";
// Remove useFormStatus for simplified test
// import { useFormStatus } from "react-dom";
from "react";
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
import { submitBooking, type BookingFormState } from "@/lib/actions"; // Keep type for state, action for submit
import { useToast } from "@/hooks/use-toast";
import restaurantConfig from '@/config/restaurant.config';
import { useLanguage } from "@/context/LanguageContext";
import { es, enUS as en } from 'date-fns/locale';

// Original SubmitButton commented out for simplified test
// function SubmitButton() {
//   const { pending } = useFormStatus();
//   const { t } = useLanguage();
//   return (
//     <Button type="submit" disabled={pending} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
//       {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
//       {t('landing:booking.buttonText')}
//     </Button>
//   );
// }

export default function BookingSection() {
  const { t, language } = useLanguage();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [selectedGuests, setSelectedGuests] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const dateLocale = language === 'es' ? es : en;

  // State for simplified response handling (not using useActionState temporarily)
  const [formState, setFormState] = useState<BookingFormState | null>(null);


  // Simplified handler for testing
  const handleSimplifiedSubmit = async () => {
    console.log("CLIENT_BOOKING: Simplified submit button clicked!");
    if (!formRef.current) {
      console.error("CLIENT_BOOKING: Form reference is not available.");
      return;
    }
    const formData = new FormData(formRef.current);
    
    // Append date, time, guests if they are not directly in formData or need specific formatting
    if (date) formData.set('date', format(date, "yyyy-MM-dd")); // Ensure date is in formData
    if (selectedTime) formData.set('time', selectedTime); // Ensure time is in formData
    if (selectedGuests) formData.set('guests', selectedGuests); // Ensure guests are in formData
    
    console.log("CLIENT_BOOKING: FormData created:", Object.fromEntries(formData.entries()));

    try {
      const result = await submitBooking(null, formData); // Call the server action
      console.log("CLIENT_BOOKING: Action response:", result);
      setFormState(result); // Update local state with the response

      if (result?.messageKey) {
        toast({
          title: result.success ? t('landing:booking.toast.successTitle') : t('landing:booking.toast.errorTitle'),
          description: t(result.messageKey, result.messageParams || undefined),
          variant: result.success ? "default" : "destructive",
        });
        if (result.success) {
          formRef.current?.reset();
          setDate(new Date());
          setSelectedTime(undefined);
          setSelectedGuests(undefined);
        }
      }
    } catch (error) {
      console.error("CLIENT_BOOKING: Error submitting form:", error);
      toast({
        title: t('landing:booking.toast.errorTitle'),
        description: t('common:form.error.generic'),
        variant: "destructive",
      });
    }
  };
  
  // Effect to react to formState changes (similar to original useEffect for state)
  useEffect(() => {
    if (formState?.messageKey) {
      // Toasting logic is now inside handleSimplifiedSubmit or can be triggered here
      // This effect is mostly for observing state changes if needed
    }
  }, [formState, toast, t]);


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
          {/* Form tag is still useful for grouping inputs and FormData creation */}
          {/* We prevent default submission with type="button" on the button and manual handling */}
          <form ref={formRef} className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <CardHeader>
              <CardTitle className="font-serif text-2xl">{t('landing:booking.cardTitle')}</CardTitle>
              <CardDescription>
                {t('landing:booking.cardDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">{t('landing:booking.label.name')}</Label>
                  <Input id="name" name="name" placeholder={t('landing:booking.placeholder.name')} className="bg-input mt-1" />
                  {formState?.errors?.name && <p className="text-sm text-destructive mt-1">{formState.errors.name.map(errKey => t(errKey)).join(", ")}</p>}
                </div>
                <div>
                  <Label htmlFor="email">{t('landing:booking.label.email')}</Label>
                  <Input id="email" name="email" type="email" placeholder={t('landing:booking.placeholder.email')} className="bg-input mt-1" />
                  {formState?.errors?.email && <p className="text-sm text-destructive mt-1">{formState.errors.email.map(errKey => t(errKey)).join(", ")}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="phone">{t('landing:booking.label.phone')}</Label>
                <Input id="phone" name="phone" type="tel" placeholder={t('landing:booking.placeholder.phone')} className="bg-input mt-1" />
                {formState?.errors?.phone && <p className="text-sm text-destructive mt-1">{formState.errors.phone.map(errKey => t(errKey)).join(", ")}</p>}
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
                  {/* Hidden input for date is less critical now as we manually add it, but good for FormData if not explicitly set */}
                  <input type="hidden" name="date" value={date ? format(date, "yyyy-MM-dd") : ""} />
                  {formState?.errors?.date && <p className="text-sm text-destructive mt-1">{formState.errors.date.map(errKey => t(errKey)).join(", ")}</p>}
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
                  {formState?.errors?.time && <p className="text-sm text-destructive mt-1">{formState.errors.time.map(errKey => t(errKey)).join(", ")}</p>}
                </div>
                <div>
                  <Label htmlFor="guests">{t('landing:booking.label.guests')}</Label>
                  <Select name="guests" value={selectedGuests} onValueChange={setSelectedGuests}>
                    <SelectTrigger id="guests" className="w-full mt-1 bg-input">
                      <Users className="mr-2 h-4 w-4 inline-block" />
                      <SelectValue placeholder={t('landing:booking.placeholder.guests')} />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(8)].map((_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1} {t(i === 0 ? 'common:guestSingular' : 'common:guestsPlural', {count: i+1})}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formState?.errors?.guests && <p className="text-sm text-destructive mt-1">{formState.errors.guests.map(errKey => t(errKey)).join(", ")}</p>}
                </div>
              </div>
               {/* General errors can be displayed here */}
              {formState?.errors?.general && (
                <p className="text-sm text-destructive mt-1 text-center">
                  {formState.errors.general.map(errKey => t(errKey, formState.messageParams || undefined )).join(' ')}
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                type="button" // Changed from "submit"
                onClick={handleSimplifiedSubmit} // Added onClick handler
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {t('landing:booking.buttonText')} (Simplified Test)
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </section>
  );
}

