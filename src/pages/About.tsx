import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { Heart, Users, Target, Award } from 'lucide-react';

const About = () => {
  const [heroRef, heroVisible] = useScrollAnimation();
  const [missionRef, missionVisible] = useScrollAnimation();
  const [valuesRef, valuesVisible] = useScrollAnimation();
  const [storyRef, storyVisible] = useScrollAnimation();

  const values = [
    {
      icon: Heart,
      title: 'Compassion',
      description: 'Every decision is guided by genuine care for the Somali people and their wellbeing.'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Building stronger communities through inclusive policies and grassroots engagement.'
    },
    {
      icon: Target,
      title: 'Integrity',
      description: 'Transparent governance and accountability in all public service endeavors.'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Striving for the highest standards in legislative work and public service.'
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
                About <span className="text-primary">Cabdalla Xuseen Cali</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                A dedicated public servant committed to Somalia's democratic development, 
                security reform, and community empowerment through transparent governance.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div ref={missionRef} className={`max-w-4xl mx-auto text-center fade-in-up ${missionVisible ? 'animate' : ''}`}>
              <h2 className="text-3xl md:text-4xl font-bold mb-8">
                My <span className="text-primary">Mission</span>
              </h2>
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>
                  To serve the Somali people with unwavering dedication, working tirelessly to strengthen 
                  democratic institutions, promote transparent governance, and create opportunities for 
                  sustainable development across all communities.
                </p>
                <p>
                  Through my role as Member of Parliament and former Deputy Minister of Defence, 
                  I am committed to advancing policies that prioritize security, education, healthcare, 
                  and economic empowerment for all Somalis.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div ref={valuesRef} className={`text-center mb-16 fade-in-up ${valuesVisible ? 'animate' : ''}`}>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Core <span className="text-primary">Values</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                The principles that guide my work and shape my vision for Somalia's future
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => {
                const IconComponent = value.icon;
                return (
                  <Card 
                    key={index}
                    className={`bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-neon fade-in-up ${valuesVisible ? 'animate' : ''} stagger-${index + 1}`}
                  >
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                        <IconComponent className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-xl font-bold text-card-foreground">
                        {value.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-muted-foreground text-center leading-relaxed">
                        {value.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Personal Story Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div ref={storyRef} className={`max-w-4xl mx-auto fade-in-up ${storyVisible ? 'animate' : ''}`}>
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
                My <span className="text-primary">Story</span>
              </h2>
              
              <div className="space-y-8 text-lg text-muted-foreground leading-relaxed">
                <p>
                  Born and raised in Somalia, I have witnessed firsthand the challenges and opportunities 
                  that define our nation's journey toward stability and prosperity. This personal connection 
                  to our communities drives my commitment to public service.
                </p>
                
                <p>
                  My educational journey began at the University of Hormuud, where I earned a Bachelor of Arts 
                  in Political Science with honors. This foundation in comparative government systems and 
                  public policy analysis prepared me for the complex challenges of governance.
                </p>
                
                <p>
                  Following my studies, I pursued advanced training at SIMAD University, focusing on public 
                  leadership, conflict resolution, and democratic governance principles. These experiences 
                  shaped my understanding of effective leadership and community-centered development.
                </p>
                
                <p>
                  Today, as a Member of Parliament serving the Somali people, I bring over a decade of 
                  experience in legislative work, policy development, and community engagement. My tenure 
                  as Deputy Minister of Defence provided invaluable insights into security sector reform 
                  and national defense strategies.
                </p>
                
                <p>
                  Every day, I am inspired by the resilience and determination of the Somali people. 
                  Together, we are building a brighter future based on democratic values, transparent 
                  governance, and inclusive development that benefits all communities.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;

