import React from 'react';

const stats = [
  { value: '10,000+', label: 'Certificates Issued' },
  { value: '42', label: 'Galactic Quadrants' },
  { value: '99.9%', label: 'Uptime Guarantee' },
];

const StatsSection = () => {
  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index}>
              <p className="text-4xl font-bold text-primary">{stat.value}</p>
              <p className="text-muted-foreground mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
