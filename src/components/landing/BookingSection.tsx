
"use client";

import { useState, useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
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
import restaurantConfig from '@/config/restaurant.config'; // Import config

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Request Booking
    </Button>
  );
}

export default function BookingSection() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [selectedGuests, setSelectedGuests] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const initialState: BookingFormState = { message: null, success: false, errors: null };
  const [state, formAction] = useFormState(submitBooking, initialState);

  useEffect(() => {
    if (state?.message) {
      toast({
        title: state.success ? "Booking Request Sent!" : "Booking Error",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      });
      if (state.success) {
        formRef.current?.reset();
        setDate(new Date());
        setSelectedTime(undefined);
        setSelectedGuests(undefined);
      }
    }
  }, [state, toast]);

  return (
    <section id="booking" className="py-16 sm:py-24 bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-foreground mb-4">
            Book Your Table
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Reserve your spot for an unforgettable dining experience. We look forward to welcoming you.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto shadow-xl">
          <form action={formAction} ref={formRef} className="space-y-6">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Reservation Details</CardTitle>
              <CardDescription>
                Fill in your details to request a table. We'll confirm your booking via email or phone.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" placeholder="John Doe" className="bg-input mt-1" />
                  {state?.errors?.name && <p className="text-sm text-destructive mt-1">{state.errors.name.join(", ")}</p>}
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" name="email" type="email" placeholder="you@example.com" className="bg-input mt-1" />
                  {state?.errors?.email && <p className="text-sm text-destructive mt-1">{state.errors.email.join(", ")}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" type="tel" placeholder="(123) 456-7890" className="bg-input mt-1" />
                {state?.errors?.phone && <p className="text-sm text-destructive mt-1">{state.errors.phone.join(", ")}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1 bg-input",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        disabled={(d) => d < new Date(new Date().setDate(new Date().getDate() -1))} // Disable past dates
                      />
                    </PopoverContent>
                  </Popover>
                  <input type="hidden" name="date" value={date ? format(date, "yyyy-MM-dd") : ""} />
                  {state?.errors?.date && <p className="text-sm text-destructive mt-1">{state.errors.date.join(", ")}</p>}
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Select name="time" value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger className="w-full mt-1 bg-input">
                      <Clock className="mr-2 h-4 w-4 inline-block" />
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {restaurantConfig.bookingTimeSlots.map(slot => ( // Use config value
                        <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {state?.errors?.time && <p className="text-sm text-destructive mt-1">{state.errors.time.join(", ")}</p>}
                </div>
                <div>
                  <Label htmlFor="guests">Guests</Label>
                  <Select name="guests" value={selectedGuests} onValueChange={setSelectedGuests}>
                    <SelectTrigger className="w-full mt-1 bg-input">
                      <Users className="mr-2 h-4 w-4 inline-block" />
                      <SelectValue placeholder="Number of guests" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(8)].map((_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1} Guest{i > 0 ? 's' : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {state?.errors?.guests && <p className="text-sm text-destructive mt-1">{state.errors.guests.join(", ")}</p>}
                </div>
              </div>
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
