
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
import { useLanguage } from "@/context/LanguageContext";

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useLanguage();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
      {t('landing:aiSommelier.buttonText')}
    </Button>
  );
}

export default function AISommelierSection() {
  const { t } = useLanguage();
  const initialState: SommelierFormState = { 
    messageKey: null, 
    recommendations: null, 
    errors: null,
    messageParams: null,
  };
  const [state, formAction] = useFormState(getAISommelierRecommendations, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.messageKey && !state.errors && state.recommendations) {
      toast({
        title: t('landing:aiSommelier.toast.successTitle'),
        description: t(state.messageKey, state.messageParams),
      });
    } else if (state?.messageKey && (state.errors || !state.recommendations)) {
       toast({
        title: t('landing:aiSommelier.toast.errorTitle'),
        description: t(state.messageKey, state.messageParams),
        variant: "destructive",
      });
    }
  }, [state, toast, t]);
  
  useEffect(() => {
    if (state?.messageKey && !state.errors && state.recommendations) {
      formRef.current?.reset(); // Reset form on successful recommendation
    }
  }, [state]);


  return (
    <section id="ai-sommelier" className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-foreground mb-4">
            {t('landing:aiSommelier.sectionTitle')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('landing:aiSommelier.sectionDescription')}
          </p>
        </div>

        <Card className="max-w-2xl mx-auto shadow-xl">
          <form action={formAction} ref={formRef}>
            <CardHeader>
              <CardTitle className="font-serif text-2xl">{t('landing:aiSommelier.cardTitle')}</CardTitle>
              <CardDescription>
                {t('landing:aiSommelier.cardDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tastePreferences" className="sr-only">{t('landing:aiSommelier.textareaPlaceholder')}</Label>
                <Textarea
                  id="tastePreferences"
                  name="tastePreferences"
                  placeholder={t('landing:aiSommelier.textareaPlaceholder')}
                  rows={5}
                  className="bg-input"
                  aria-describedby="preferences-error"
                />
                {state?.errors?.tastePreferences && (
                  <p id="preferences-error" className="text-sm text-destructive mt-1">
                    {state.errors.tastePreferences.map(errKey => t(errKey)).join(", ")}
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
                <CardTitle className="font-serif text-2xl text-primary">{t('landing:aiSommelier.recommendationCardTitle')}</CardTitle>
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
