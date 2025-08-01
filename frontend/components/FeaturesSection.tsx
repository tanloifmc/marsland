import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { CheckCircle } from 'lucide-react';

const features = [
  { title: 'Secure Ownership', description: 'Certificates are stored securely on the blockchain.' },
  { title: 'Instant Verification', description: 'Verify land ownership instantly via QR code.' },
  { title: 'Global Access', description: 'Access your land certificates from anywhere in the world.' },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-12">Why Choose MarsLand?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <CheckCircle className="h-12 w-12 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
