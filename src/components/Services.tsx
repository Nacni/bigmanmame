import { Gavel, Shield, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

const Services = () => {
  const [headerRef, headerVisible] = useScrollAnimation();
  const [cardsRef, cardsVisible] = useScrollAnimation();

  const services = [
    {
      icon: Gavel,
      title: 'Legislation & Governance',
      description: 'Drafting, debating, and passing bills to strengthen Somalia\'s democratic institutions and ensure transparent governance for all citizens.',
    },
    {
      icon: Shield,
      title: 'Security & Defence Reform',
      description: 'Extensive experience as Deputy Minister of Defence, leading comprehensive security sector reform initiatives across Somalia.',
    },
    {
      icon: Users,
      title: 'Youth & Community Development',
      description: 'Launching transformative initiatives focused on job creation, education access, and social inclusion for communities across Somalia.',
    },
  ];

  return (
    <section id="services" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div ref={headerRef} className={`text-center mb-16 fade-in-up ${headerVisible ? 'animate' : ''}`}>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            My <span className="text-primary">Specialization</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Focused expertise in key areas that drive meaningful change and progress for Somalia and its people
          </p>
        </div>

        {/* Services Grid */}
        <div ref={cardsRef} className={`grid md:grid-cols-2 lg:grid-cols-3 gap-8 fade-in-up ${cardsVisible ? 'animate' : ''}`}>
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <Card 
                key={index}
                className="bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-neon group"
              >
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors duration-300">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground text-center leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
