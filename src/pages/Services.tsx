import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { Gavel, Shield, Users, Heart, GraduationCap, Building } from 'lucide-react';

const Services = () => {
  const [heroRef, heroVisible] = useScrollAnimation();
  const [servicesRef, servicesVisible] = useScrollAnimation();
  const [approachRef, approachVisible] = useScrollAnimation();

  const services = [
    {
      icon: Gavel,
      title: 'Legislation & Governance',
      description: 'Comprehensive legislative work focused on strengthening Somalia\'s democratic institutions and ensuring transparent governance for all citizens.',
      details: [
        'Drafting and sponsoring bills for democratic reform',
        'Oversight of government agencies and public institutions',
        'Policy development for transparent governance',
        'Constitutional review and legal framework improvements',
        'Public consultation and stakeholder engagement'
      ],
      tags: ['Policy', 'Governance', 'Democracy']
    },
    {
      icon: Shield,
      title: 'Security & Defence Reform',
      description: 'Extensive experience in security sector reform, military modernization, and national defense strategy development.',
      details: [
        'Security sector reform and modernization',
        'Military training and capacity building',
        'International security cooperation',
        'Community policing initiatives',
        'Counter-terrorism strategy development'
      ],
      tags: ['Security', 'Defense', 'Reform']
    },
    {
      icon: Users,
      title: 'Youth & Community Development',
      description: 'Transformative initiatives focused on job creation, education access, and social inclusion for communities across Somalia.',
      details: [
        'Youth employment and skills training programs',
        'Educational access and scholarship initiatives',
        'Community infrastructure development',
        'Social inclusion and equality programs',
        'Entrepreneurship and economic empowerment'
      ],
      tags: ['Youth', 'Community', 'Development']
    },
    {
      icon: Heart,
      title: 'Social Welfare Programs',
      description: 'Comprehensive support services for vulnerable populations including seniors, orphans, and families in need.',
      details: [
        'Senior citizens support and healthcare',
        'Orphan care and family assistance programs',
        'Healthcare access and medical support',
        'Nutrition and food security initiatives',
        'Mental health and counseling services'
      ],
      tags: ['Welfare', 'Healthcare', 'Support']
    },
    {
      icon: GraduationCap,
      title: 'Education & Training',
      description: 'Educational initiatives and professional development programs to build capacity and knowledge across Somalia.',
      details: [
        'Educational policy and curriculum development',
        'Teacher training and professional development',
        'Vocational and technical education programs',
        'University partnerships and research initiatives',
        'Digital literacy and technology education'
      ],
      tags: ['Education', 'Training', 'Capacity Building']
    },
    {
      icon: Building,
      title: 'Economic Development',
      description: 'Strategic economic initiatives focused on infrastructure, investment, and sustainable development.',
      details: [
        'Infrastructure development and modernization',
        'Investment promotion and economic policies',
        'Agricultural development and food security',
        'Technology and innovation initiatives',
        'International trade and economic cooperation'
      ],
      tags: ['Economy', 'Infrastructure', 'Development']
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="pt-20 pb-16 bg-gradient-dark">
          <div className="container mx-auto px-4">
            <div ref={heroRef} className={`text-center max-w-4xl mx-auto fade-in-up ${heroVisible ? 'animate' : ''}`}>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                My <span className="text-primary">Services</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Comprehensive public service focused on legislative excellence, 
                security reform, community development, and democratic governance 
                for Somalia's sustainable future.
              </p>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div ref={servicesRef} className={`text-center mb-16 fade-in-up ${servicesVisible ? 'animate' : ''}`}>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Service <span className="text-primary">Areas</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Specialized expertise across key areas that drive meaningful change and progress for Somalia
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => {
                const IconComponent = service.icon;
                return (
                  <Card 
                    key={index}
                    className={`bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-neon fade-in-up ${servicesVisible ? 'animate' : ''} stagger-${(index % 3) + 1}`}
                  >
                    <CardHeader className="text-center pb-4">
                      <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                        <IconComponent className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-xl font-bold text-card-foreground">
                        {service.title}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground text-center leading-relaxed">
                        {service.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-card-foreground">Key Activities:</h4>
                        <ul className="space-y-1">
                          {service.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="text-muted-foreground text-sm flex items-start">
                              <div className="w-1 h-1 bg-primary rounded-full mr-2 mt-2 flex-shrink-0"></div>
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {service.tags.map((tag, tagIndex) => (
                          <Badge 
                            key={tagIndex}
                            variant="secondary" 
                            className="bg-primary/10 text-primary text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Approach Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div ref={approachRef} className={`max-w-4xl mx-auto text-center fade-in-up ${approachVisible ? 'animate' : ''}`}>
              <h2 className="text-3xl md:text-4xl font-bold mb-8">
                My <span className="text-primary">Approach</span>
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8 text-left">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-primary">Community-Centered</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Every policy and initiative begins with understanding the needs and aspirations 
                      of the communities I serve. I believe in grassroots engagement and participatory 
                      decision-making processes.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-primary">Evidence-Based</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      All legislative work and policy development is grounded in research, data analysis, 
                      and best practices from similar contexts. I prioritize measurable outcomes and 
                      continuous evaluation.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-primary">Collaborative</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Effective governance requires working across party lines, engaging with civil society, 
                      and building partnerships with international organizations and development partners.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-primary">Transparent</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      I am committed to open government, public accountability, and transparent decision-making 
                      processes. Citizens have the right to know how their representatives are working for them.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Services;

