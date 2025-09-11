import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import legislationImage from '@/assets/portfolio-legislation.jpg';
import securityImage from '@/assets/portfolio-security.jpg.jpg';
import digitalImage from '@/assets/portfolio-digital.jpg';
import seniorsImage from '@/assets/portfolio-seniors.jpg';
import youthImage from '@/assets/portfolio-youth.jpg';
import orphansImage from '@/assets/portfolio-orphans.jpg';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

const Portfolio = () => {
  const [headerRef, headerVisible] = useScrollAnimation();
  const [card1Ref, card1Visible] = useScrollAnimation();
  const [card2Ref, card2Visible] = useScrollAnimation();
  const [card3Ref, card3Visible] = useScrollAnimation();
  const [card4Ref, card4Visible] = useScrollAnimation();
  const [card5Ref, card5Visible] = useScrollAnimation();
  const [card6Ref, card6Visible] = useScrollAnimation();

  const portfolioItems = [
    {
      image: legislationImage,
      tags: ['Policy', 'Governance'],
      title: 'National Anti-Corruption Framework',
      description: 'Introduced comprehensive legislation to establish transparency mechanisms, accountability measures, and oversight systems to combat corruption at all levels of government.',
      year: '2023',
    },
    {
      image: securityImage,
      tags: ['Security', 'Community'],
      title: 'Community Policing Initiative',
      description: 'Developed and implemented a groundbreaking program that bridges local law enforcement with community elders, fostering trust and collaborative security solutions.',
      year: '2022',
    },
    {
      image: digitalImage,
      tags: ['Infrastructure', 'Technology'],
      title: 'Digital Connectivity Project',
      description: 'Led the groundbreaking ceremony for Somalia\'s Digital Connectivity Project, bringing modern telecommunications infrastructure to underserved communities and promoting digital inclusion.',
      year: '2024',
    },
    {
      image: seniorsImage,
      tags: ['Healthcare', 'Social Support'],
      title: 'Senior Citizens Support Network',
      description: 'Comprehensive support services and healthcare initiatives for elderly citizens, ensuring dignified care and community integration for Somalia\'s senior population.',
      year: '2023',
    },
    {
      image: youthImage,
      tags: ['Employment', 'Skills Training'],
      title: 'Youth Employment Program',
      description: 'Creating opportunities and pathways for young professionals entering the workforce through skills training, mentorship programs, and job placement initiatives.',
      year: '2024',
    },
    {
      image: orphansImage,
      tags: ['Social Welfare', 'Childcare'],
      title: 'Orphans and Needy Support Initiative',
      description: 'Comprehensive support program providing education, healthcare, nutrition, and emotional support for orphaned children and families in need across Somalia.',
      year: '2023',
    },
  ];

  return (
    <section id="portfolio" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div ref={headerRef} className={`text-center mb-16 fade-in-up ${headerVisible ? 'animate' : ''}`}>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Let's Have a Look at My <span className="text-primary">Work</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Key legislative achievements and policy initiatives that have made a lasting impact on Somalia's democratic development
          </p>
        </div>

        {/* Portfolio Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {portfolioItems.map((item, index) => {
            // Determine animation direction and visibility based on index
            let animationClass = '';
            let cardRef = null;
            let isVisible = false;
            
            if (index === 0) {
              cardRef = card1Ref;
              isVisible = card1Visible;
              animationClass = `fade-in-left ${isVisible ? 'animate' : ''} stagger-1`;
            } else if (index === 1) {
              cardRef = card2Ref;
              isVisible = card2Visible;
              animationClass = `fade-in-left ${isVisible ? 'animate' : ''} stagger-2`;
            } else if (index === 2) {
              cardRef = card3Ref;
              isVisible = card3Visible;
              animationClass = `fade-in-left ${isVisible ? 'animate' : ''} stagger-3`;
            } else if (index === 3) {
              cardRef = card4Ref;
              isVisible = card4Visible;
              animationClass = `fade-in-right ${isVisible ? 'animate' : ''} stagger-1`;
            } else if (index === 4) {
              cardRef = card5Ref;
              isVisible = card5Visible;
              animationClass = `fade-in-right ${isVisible ? 'animate' : ''} stagger-2`;
            } else if (index === 5) {
              cardRef = card6Ref;
              isVisible = card6Visible;
              animationClass = `fade-in-right ${isVisible ? 'animate' : ''} stagger-3`;
            }
            
            return (
            <Card 
              key={index}
              ref={cardRef}
              className={`bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-neon group overflow-hidden ${animationClass}`}
            >
              {/* Image */}
              <div className="relative overflow-hidden">
                <img 
                  src={item.image}
                  alt={item.title}
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  {item.tags.map((tag, tagIndex) => (
                    <Badge 
                      key={tagIndex}
                      className="bg-primary text-primary-foreground px-2 py-1 text-xs font-medium"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-card text-card-foreground">
                    {item.year}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <CardHeader>
                <CardTitle className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors duration-300">
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {item.description}
                </CardDescription>
                <Button 
                  variant="outline"
                  className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Learn More
                </Button>
              </CardContent>
            </Card>
            );
          })}
        </div>

        {/* View More Button */}
        <div className="text-center mt-12">
          <Link to="/portfolio">
            <Button 
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow hover:shadow-glow-strong transition-all duration-300"
            >
              View All Projects
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;