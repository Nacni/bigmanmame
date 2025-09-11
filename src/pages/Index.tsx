import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Portfolio from '@/components/Portfolio';
import Videos from '@/components/Videos';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Briefcase, Play, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

const Index = () => {
  const [ctaRef, ctaVisible] = useScrollAnimation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <Services />
        <Portfolio />
        <Videos />
        
        {/* Call to Action Section */}
        <section ref={ctaRef} className={`py-20 bg-muted/30 fade-in-up ${ctaVisible ? 'animate' : ''}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Explore More <span className="text-primary">Content</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Dive deeper into my work, achievements, and vision for Somalia's future
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link to="/about" className="group">
                <div className="bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-neon p-6 rounded-lg text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors duration-300">About Me</h3>
                  <p className="text-muted-foreground text-sm mb-4">Learn about my background, values, and mission</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Learn More <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </Link>
              
              <Link to="/services" className="group">
                <div className="bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-neon p-6 rounded-lg text-center">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors duration-300">Services</h3>
                  <p className="text-muted-foreground text-sm mb-4">Explore my areas of expertise and service offerings</p>
                  <Button variant="outline" size="sm" className="w-full">
                    View Services <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </Link>
              
              <Link to="/videos" className="group">
                <div className="bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-neon p-6 rounded-lg text-center">
                  <Play className="h-12 w-12 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors duration-300">Videos</h3>
                  <p className="text-muted-foreground text-sm mb-4">Watch speeches, interviews, and public appearances</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Watch Videos <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </Link>
              
              <Link to="/journey" className="group">
                <div className="bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-neon p-6 rounded-lg text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors duration-300">Journey</h3>
                  <p className="text-muted-foreground text-sm mb-4">Follow my academic and professional timeline</p>
                  <Button variant="outline" size="sm" className="w-full">
                    View Journey <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
