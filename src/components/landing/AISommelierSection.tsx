
"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getAISommelierRecommendations, type SommelierFormState } from "@/lib/actions";
import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Bot, Loader2 } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
      Get Recommendations
    </Button>
  );
}

export default function AISommelierSection() {
  const initialState: SommelierFormState = { message: null, recommendations: null, errors: null };
  const [state, formAction] = useFormState(getAISommelierRecommendations, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.message && !state.errors && state.recommendations) {
      toast({
        title: "Sommelier's Choice!",
        description: state.message,
      });
    } else if (state?.message && (state.errors || !state.recommendations)) {
       toast({
        title: "Oops!",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, toast]);
  
  useEffect(() => {
    if (state?.message && !state.errors && state.recommendations) {
      formRef.current?.reset(); // Reset form on successful recommendation
    }
  }, [state]);


  return (
    <section id="ai-sommelier" className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-foreground mb-4">
            AI Sommelier
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tell us your taste preferences, and our AI Sommelier will suggest the perfect dishes for you.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto shadow-xl">
          <form action={formAction} ref={formRef}>
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Discover Your Next Favorite Dish</CardTitle>
              <CardDescription>
                Describe your preferred flavors, ingredients, or cuisine types (e.g., "spicy, love seafood, Italian cuisine").
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tastePreferences" className="sr-only">Taste Preferences</Label>
                <Textarea
                  id="tastePreferences"
                  name="tastePreferences"
                  placeholder="E.g., I love spicy food, enjoy seafood, and am looking for something light..."
                  rows={5}
                  className="bg-input"
                  aria-describedby="preferences-error"
                />
                {state?.errors?.tastePreferences && (
                  <p id="preferences-error" className="text-sm text-destructive mt-1">
                    {state.errors.tastePreferences.join(", ")}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-end">
              <SubmitButton />
            </CardFooter>
          </form>
        </Card>

        {state?.recommendations && (
          <div className="mt-12 animate-fade-in-up">
            <Card className="max-w-2xl mx-auto bg-secondary shadow-lg">
              <CardHeader>
                <CardTitle className="font-serif text-2xl text-primary">Our Chef Suggests...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm sm:prose dark:prose-invert max-w-none">
                  {state.recommendations.split('\n').map((line, index) => (
                    <p key={index} className="mb-2">{line}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}
