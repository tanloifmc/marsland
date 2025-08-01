import React from 'react';
import { Card, CardContent } from './ui/card';

const testimonials = [
  { name: 'Captain Eva', quote: 'Securing my plot on Mars was seamless. The future is now!' },
  { name: 'Zorp the Surveyor', quote: 'The verification process is light-years ahead of anything on Earth.' },
  { name: 'Elon M.', quote: 'This is a great step for interplanetary real estate. Highly recommended.' },
];

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-20">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-12">What Our Pioneers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <blockquote className="italic text-muted-foreground">"{testimonial.quote}"</blockquote>
                <p className="font-bold mt-4">- {testimonial.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
