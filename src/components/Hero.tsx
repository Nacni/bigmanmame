import { Button } from '@/components/ui/button';
import { Download, Eye } from 'lucide-react';
import heroImage from '@/assets/cabdalla-portrait.jpg';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

const Hero = () => {
  const [contentRef, contentVisible] = useScrollAnimation();
  const [imageRef, imageVisible] = useScrollAnimation();

  const handleDownloadCV = () => {
    // Create a link to download the CV file
    const link = document.createElement('a');
    link.href = '/cabdalla-xuseen-cv.pdf';
    link.download = 'Cabdalla-Xuseen-CV.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const scrollToPortfolio = () => {
    const element = document.querySelector('#portfolio');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="min-h-screen flex items-center pt-20 bg-gradient-dark">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div ref={contentRef} className={`space-y-8 text-center lg:text-left fade-in-left ${contentVisible ? 'animate' : ''}`}>
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                I'm{' '}
                <span className="text-primary animate-glow underline">
                  Cabdalla Xuseen Cali
                </span>
                , Transforming Somalia's Future
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Dedicated Member of Parliament with over a decade of service, former Minister, and visionary leader
                committed to strengthening Somalia's democracy, economic growth, and community empowerment.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow hover:shadow-glow-strong transition-all duration-300"
                onClick={scrollToPortfolio}
              >
                <Eye className="mr-2 h-5 w-5" />
                View My Work
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                onClick={handleDownloadCV}
              >
                <Download className="mr-2 h-5 w-5" />
                Download CV
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-primary">10+</div>
                <div className="text-muted-foreground">Years in Parliament</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-primary">50+</div>
                <div className="text-muted-foreground">Bills Drafted</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-primary">100K+</div>
                <div className="text-muted-foreground">Lives Impacted</div>
              </div>
            </div>
          </div>

          {/* Profile Image */}
          <div ref={imageRef} className={`flex justify-center lg:justify-end fade-in-right ${imageVisible ? 'animate' : ''}`}>
            <div className="relative">
              <div className="w-80 h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden border-4 border-primary shadow-glow-strong animate-pulse-neon">
                <img 
                  src={heroImage} 
                  alt="Cabdalla Xuseen Cali - Member of Parliament" 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary rounded-full animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;