import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { GraduationCap, Briefcase, Award, Calendar, MapPin, Users } from 'lucide-react';

const Journey = () => {
  const [heroRef, heroVisible] = useScrollAnimation();
  const [educationRef, educationVisible] = useScrollAnimation();
  const [experienceRef, experienceVisible] = useScrollAnimation();
  const [achievementsRef, achievementsVisible] = useScrollAnimation();

  const education = [
    {
      institution: 'University of Hormuud',
      period: '2000–2004',
      degree: 'Bachelor of Arts in Political Science',
      description: 'Graduated with honors, with a strong focus on comparative government systems and public policy analysis.',
      location: 'Mogadishu, Somalia',
      achievements: [
        'Graduated Magna Cum Laude',
        'President of Political Science Society',
        'Research Assistant for Comparative Government Studies',
        'Published undergraduate thesis on democratic transitions'
      ]
    },
    {
      institution: 'SIMAD University',
      period: '2005–2006',
      degree: 'Certificate in Public Leadership Training',
      description: 'Advanced training in public administration, conflict resolution, and democratic governance principles.',
      location: 'Mogadishu, Somalia',
      achievements: [
        'Top 5% of cohort performance',
        'Specialized in conflict resolution',
        'Completed field research in community governance',
        'Mentored junior students in leadership principles'
      ]
    }
  ];

  const experience = [
    {
      position: 'Member of Parliament',
      organization: 'Federal Parliament of Somalia',
      period: '2017–Present',
      description: 'Serving the Somali people through legislative work, policy development, and democratic governance initiatives.',
      location: 'Mogadishu, Somalia',
      responsibilities: [
        'Drafting and sponsoring legislation for democratic reform',
        'Oversight of government agencies and public institutions',
        'Constituency representation and community engagement',
        'International parliamentary cooperation and diplomacy',
        'Policy development for security sector reform'
      ],
      achievements: [
        'Sponsored 15+ successful bills',
        'Led 5 major policy initiatives',
        'Represented Somalia in 20+ international forums',
        'Improved constituency services by 40%'
      ]
    },
    {
      position: 'Deputy Minister of Defence',
      organization: 'Ministry of Defence, Somalia',
      period: '2012–2017',
      description: 'Led defense sector reform, military modernization, and security policy development for Somalia\'s national defense.',
      location: 'Mogadishu, Somalia',
      responsibilities: [
        'Oversaw military modernization programs',
        'Developed national security strategies',
        'Coordinated international security partnerships',
        'Implemented community policing initiatives',
        'Managed defense budget and resource allocation'
      ],
      achievements: [
        'Reduced security incidents by 60%',
        'Trained 2,000+ security personnel',
        'Established 15 community policing units',
        'Secured $50M+ in international security funding'
      ]
    },
    {
      position: 'Policy Advisor',
      organization: 'Office of the Prime Minister',
      period: '2008–2012',
      description: 'Provided strategic policy advice on governance, security, and development initiatives for Somalia\'s reconstruction.',
      location: 'Mogadishu, Somalia',
      responsibilities: [
        'Developed policy frameworks for governance reform',
        'Coordinated inter-ministerial policy initiatives',
        'Conducted policy research and analysis',
        'Facilitated stakeholder consultations',
        'Drafted policy recommendations and briefings'
      ],
      achievements: [
        'Developed 20+ policy frameworks',
        'Led 10+ stakeholder consultation processes',
        'Published 5 policy research papers',
        'Improved policy implementation efficiency by 35%'
      ]
    }
  ];

  const achievements = [
    {
      title: 'Legislative Excellence Award',
      organization: 'Somalia Parliamentary Association',
      year: '2023',
      description: 'Recognized for outstanding legislative work and policy development initiatives.',
      category: 'Legislation'
    },
    {
      title: 'Security Sector Reform Leadership',
      organization: 'African Union Mission in Somalia',
      year: '2016',
      description: 'Awarded for exceptional leadership in defense sector reform and community security initiatives.',
      category: 'Security'
    },
    {
      title: 'Community Development Champion',
      organization: 'Somalia Civil Society Network',
      year: '2021',
      description: 'Recognized for outstanding contributions to community development and social welfare programs.',
      category: 'Community'
    },
    {
      title: 'Youth Empowerment Advocate',
      organization: 'Somalia Youth Development Foundation',
      year: '2022',
      description: 'Honored for creating opportunities and pathways for young Somalis in education and employment.',
      category: 'Youth'
    },
    {
      title: 'Democratic Governance Award',
      organization: 'International Parliamentary Union',
      year: '2020',
      description: 'Recognized for promoting democratic values and transparent governance practices.',
      category: 'Governance'
    },
    {
      title: 'Policy Innovation Excellence',
      organization: 'Somalia Policy Institute',
      year: '2019',
      description: 'Awarded for innovative policy development and evidence-based governance approaches.',
      category: 'Policy'
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
                My <span className="text-primary">Journey</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                A comprehensive timeline of my academic achievements, professional experience, 
                and contributions to Somalia's democratic development and governance.
              </p>
            </div>
          </div>
        </section>

        {/* Education Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div ref={educationRef} className={`text-center mb-16 fade-in-up ${educationVisible ? 'animate' : ''}`}>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Academic <span className="text-primary">Background</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Educational foundation that shaped my understanding of governance and public service
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
              {education.map((edu, index) => (
                <Card 
                  key={index}
                  className={`bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-neon fade-in-left ${educationVisible ? 'animate' : ''} stagger-${index + 1}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <GraduationCap className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold text-card-foreground">
                            {edu.degree}
                          </CardTitle>
                          <CardDescription className="text-primary font-medium">
                            {edu.institution}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="mb-2">
                          {edu.period}
                        </Badge>
                        <div className="flex items-center text-muted-foreground text-sm">
                          <MapPin className="h-4 w-4 mr-1" />
                          {edu.location}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {edu.description}
                    </p>
                    <div>
                      <h4 className="font-semibold text-card-foreground mb-2">Key Achievements:</h4>
                      <ul className="space-y-1">
                        {edu.achievements.map((achievement, achievementIndex) => (
                          <li key={achievementIndex} className="text-muted-foreground text-sm flex items-start">
                            <div className="w-1 h-1 bg-primary rounded-full mr-2 mt-2 flex-shrink-0"></div>
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div ref={experienceRef} className={`text-center mb-16 fade-in-up ${experienceVisible ? 'animate' : ''}`}>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Professional <span className="text-primary">Experience</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Progressive leadership roles in government and public service
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
              {experience.map((exp, index) => (
                <Card 
                  key={index}
                  className={`bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-neon fade-in-right ${experienceVisible ? 'animate' : ''} stagger-${index + 1}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Briefcase className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold text-card-foreground">
                            {exp.position}
                          </CardTitle>
                          <CardDescription className="text-primary font-medium">
                            {exp.organization}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="mb-2">
                          {exp.period}
                        </Badge>
                        <div className="flex items-center text-muted-foreground text-sm">
                          <MapPin className="h-4 w-4 mr-1" />
                          {exp.location}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-muted-foreground leading-relaxed">
                      {exp.description}
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-card-foreground mb-2">Key Responsibilities:</h4>
                        <ul className="space-y-1">
                          {exp.responsibilities.map((responsibility, respIndex) => (
                            <li key={respIndex} className="text-muted-foreground text-sm flex items-start">
                              <div className="w-1 h-1 bg-primary rounded-full mr-2 mt-2 flex-shrink-0"></div>
                              {responsibility}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-card-foreground mb-2">Notable Achievements:</h4>
                        <ul className="space-y-1">
                          {exp.achievements.map((achievement, achievementIndex) => (
                            <li key={achievementIndex} className="text-muted-foreground text-sm flex items-start">
                              <div className="w-1 h-1 bg-primary rounded-full mr-2 mt-2 flex-shrink-0"></div>
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Achievements Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div ref={achievementsRef} className={`text-center mb-16 fade-in-up ${achievementsVisible ? 'animate' : ''}`}>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Awards & <span className="text-primary">Recognition</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Recognition for outstanding contributions to governance, security, and community development
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement, index) => (
                <Card 
                  key={index}
                  className={`bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-neon fade-in-up ${achievementsVisible ? 'animate' : ''} stagger-${(index % 3) + 1}`}
                >
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                      <Award className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-lg font-bold text-card-foreground">
                      {achievement.title}
                    </CardTitle>
                    <CardDescription className="text-primary font-medium">
                      {achievement.organization}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-3">
                    <Badge variant="outline" className="border-primary text-primary">
                      {achievement.year}
                    </Badge>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {achievement.description}
                    </p>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {achievement.category}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Journey;

