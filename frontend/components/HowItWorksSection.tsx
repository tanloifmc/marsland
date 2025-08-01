import React from 'react';
import { Card, CardContent } from './ui/card';

const steps = [
  { number: 1, title: 'Submit Request', description: 'Fill out a simple form with your land details.' },
  { number: 2, title: 'Make Payment', description: 'Securely pay the processing fee via PayPal.' },
  { number: 3, title: 'Receive Certificate', description: 'Get your official Mars Land Certificate via email.' },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <Card key={step.number}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary text-primary-foreground rounded-full text-2xl font-bold">
                    {step.number}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
