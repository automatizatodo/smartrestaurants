
import { Card, CardContent } from '@/components/ui/card';
import { Star, StarHalf } from 'lucide-react'; // Assuming StarHalf is not available, will use full stars
import Image from 'next/image';

export interface TestimonialProps {
  id: string;
  name: string;
  avatarUrl?: string; // Optional avatar
  avatarHint?: string;
  testimonial: string;
  rating: number; // e.g., 4.5
  title?: string; // e.g., "Food Critic" or "Regular Customer"
}

export default function TestimonialCard({ testimonialItem }: { testimonialItem: TestimonialProps }) {
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(testimonialItem.rating);
    // const hasHalfStar = testimonialItem.rating % 1 !== 0; // Not using half stars due to Lucide limitation without more complex SVG logic

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-5 w-5 text-primary fill-primary" />);
    }
    // if (hasHalfStar) {
    //   stars.push(<StarHalf key="half" className="h-5 w-5 text-primary fill-primary" />);
    // }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-5 w-5 text-primary/30" />);
    }
    return stars;
  };

  return (
    <Card className="h-full flex flex-col bg-card text-card-foreground shadow-lg p-6 rounded-lg">
      <CardContent className="flex flex-col items-center text-center flex-grow p-0">
        {testimonialItem.avatarUrl && (
          <div className="relative w-20 h-20 mb-4 rounded-full overflow-hidden shadow-md">
            <Image
              src={testimonialItem.avatarUrl}
              alt={testimonialItem.name}
              data-ai-hint={testimonialItem.avatarHint || "person portrait"}
              layout="fill"
              objectFit="cover"
            />
          </div>
        )}
        <div className="flex mb-3">{renderStars()}</div>
        <p className="text-muted-foreground italic mb-4 text-md flex-grow">&ldquo;{testimonialItem.testimonial}&rdquo;</p>
        <h4 className="font-semibold font-serif text-lg text-primary">{testimonialItem.name}</h4>
        {testimonialItem.title && <p className="text-xs text-muted-foreground">{testimonialItem.title}</p>}
      </CardContent>
    </Card>
  );
}
