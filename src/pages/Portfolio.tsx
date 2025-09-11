import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { ExternalLink, Calendar, Users, Award } from 'lucide-react';
import legislationImage from '@/assets/portfolio-legislation.jpg';
import securityImage from '@/assets/portfolio-security.jpg.jpg';
import digitalImage from '@/assets/portfolio-digital.jpg';
import seniorsImage from '@/assets/portfolio-seniors.jpg';
import youthImage from '@/assets/portfolio-youth.jpg';
import orphansImage from '@/assets/portfolio-orphans.jpg';

const Portfolio = () => {
  const [heroRef, heroVisible] = useScrollAnimation();
  const [projectsRef, projectsVisible] = useScrollAnimation();
  const [statsRef, statsVisible] = useScrollAnimation();

  const portfolioItems = [
    {
      image: legislationImage,
      tags: ['Policy', 'Governance'],
      title: 'National Anti-Corruption Framework',
      description: 'Introduced comprehensive legislation to establish transparency mechanisms, accountability measures, and oversight systems to combat corruption at all levels of government.',
      year: '2023',
      status: 'Completed',
      impact: '50+ government agencies now under oversight',
      details: [
        'Established independent anti-corruption commission',
        'Implemented whistleblower protection laws',
        'Created public asset declaration system',
        'Enhanced financial transparency requirements',
        'Strengthened judicial oversight mechanisms'
      ]
    },
    {
      image: securityImage,
      tags: ['Security', 'Community'],
      title: 'Community Policing Initiative',
      description: 'Developed and implemented a groundbreaking program that bridges local law enforcement with community elders, fostering trust and collaborative security solutions.',
      year: '2022',
      status: 'Ongoing',
      impact: '25+ communities with improved security',
      details: [
        'Trained 200+ community police officers',
        'Established neighborhood watch programs',
        'Created community-police liaison committees',
        'Implemented conflict resolution mechanisms',
        'Reduced crime rates by 40% in pilot areas'
      ]
    },
    {
      image: digitalImage,
      tags: ['Infrastructure', 'Technology'],
      title: 'Digital Connectivity Project',
      description: 'Led the groundbreaking ceremony for Somalia\'s Digital Connectivity Project, bringing modern telecommunications infrastructure to underserved communities and promoting digital inclusion.',
      year: '2024',
      status: 'In Progress',
      impact: '100K+ people with internet access',
      details: [
        'Installed fiber optic infrastructure',
        'Established community internet centers',
        'Provided digital literacy training',
        'Connected schools and hospitals',
        'Enabled e-government services'
      ]
    },
    {
      image: seniorsImage,
      tags: ['Healthcare', 'Social Support'],
      title: 'Senior Citizens Support Network',
      description: 'Comprehensive support services and healthcare initiatives for elderly citizens, ensuring dignified care and community integration for Somalia\'s senior population.',
      year: '2023',
      status: 'Ongoing',
      impact: '5,000+ seniors receiving support',
      details: [
        'Established 15 senior care centers',
        'Provided healthcare and medication support',
        'Created social engagement programs',
        'Implemented pension assistance schemes',
        'Trained 100+ caregivers'
      ]
    },
    {
      image: youthImage,
      tags: ['Employment', 'Skills Training'],
      title: 'Youth Employment Program',
      description: 'Creating opportunities and pathways for young professionals entering the workforce through skills training, mentorship programs, and job placement initiatives.',
      year: '2024',
      status: 'Ongoing',
      impact: '2,000+ youth employed',
      details: [
        'Established vocational training centers',
        'Created apprenticeship programs',
        'Provided entrepreneurship support',
        'Connected youth with employers',
        'Offered microfinance opportunities'
      ]
    },
    {
      image: orphansImage,
      tags: ['Social Welfare', 'Childcare'],
      title: 'Orphans and Needy Support Initiative',
      description: 'Comprehensive support program providing education, healthcare, nutrition, and emotional support for orphaned children and families in need across Somalia.',
      year: '2023',
      status: 'Ongoing',
      impact: '3,000+ children supported',
      details: [
        'Established orphan care facilities',
        'Provided educational scholarships',
        'Offered healthcare and nutrition support',
        'Created foster care programs',
        'Implemented psychological counseling services'
      ]
    }
  ];

  const stats = [
    { icon: Award, label: 'Projects Completed', value: '15+' },
    { icon: Users, label: 'Lives Impacted', value: '100K+' },
    { icon: Calendar, label: 'Years of Service', value: '10+' },
    { icon: ExternalLink, label: 'Active Initiatives', value: '8' }
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
                My <span className="text-primary">Portfolio</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                A comprehensive showcase of legislative achievements, policy initiatives, 
                and community development projects that have made a lasting impact on Somalia's progress.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div ref={statsRef} className={`grid grid-cols-2 md:grid-cols-4 gap-8 fade-in-up ${statsVisible ? 'animate' : ''}`}>
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className={`text-center fade-in-up ${statsVisible ? 'animate' : ''} stagger-${index + 1}`}>
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                    <div className="text-muted-foreground">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div ref={projectsRef} className={`text-center mb-16 fade-in-up ${projectsVisible ? 'animate' : ''}`}>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Featured <span className="text-primary">Projects</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Key initiatives and achievements that demonstrate my commitment to Somalia's development
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {portfolioItems.map((item, index) => {
                let animationClass = '';
                if (index < 3) {
                  animationClass = `fade-in-left ${projectsVisible ? 'animate' : ''} stagger-${index + 1}`;
                } else {
                  animationClass = `fade-in-right ${projectsVisible ? 'animate' : ''} stagger-${index - 2}`;
                }
                
                return (
                  <Card 
                    key={index}
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
                      <div className="absolute top-4 right-4 flex gap-2">
                        <Badge variant="secondary" className="bg-card text-card-foreground">
                          {item.year}
                        </Badge>
                        <Badge variant="outline" className="border-primary text-primary">
                          {item.status}
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
                      
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <p className="text-sm font-medium text-primary">
                          <strong>Impact:</strong> {item.impact}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-semibold text-card-foreground">Key Achievements:</h4>
                        <ul className="space-y-1">
                          {item.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="text-muted-foreground text-sm flex items-start">
                              <div className="w-1 h-1 bg-primary rounded-full mr-2 mt-2 flex-shrink-0"></div>
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
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
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Portfolio;

