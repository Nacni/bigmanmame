import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Briefcase, Calendar } from 'lucide-react';

const Journey = () => {
  const education = [
    {
      institution: 'University of Hormuud',
      period: '2000–2004',
      degree: 'Bachelor of Arts in Political Science',
      description: 'Graduated with honors, with a strong focus on comparative government systems and public policy analysis.',
    },
    {
      institution: 'SIMAD University',
      period: '2005–2006',
      degree: 'Certificate in Public Leadership Training',
      description: 'Advanced training in public administration, conflict resolution, and democratic governance principles.',
    },
  ];

  const experience = [
    {
      role: 'Member of Parliament',
      period: '2013–Present',
      organization: 'Federal Parliament of Somalia',
      description: 'Serving as an elected representative, focusing on legislation for economic development, security reform, and youth empowerment initiatives.',
      achievements: ['Authored 15+ major bills', 'Led 3 parliamentary committees', 'Advocated for 50+ policy reforms'],
    },
    {
      role: 'Deputy Minister of Defence',
      period: '2014–2016',
      organization: 'Federal Government of Somalia',
      description: 'Oversaw national security policy implementation, military modernization programs, and international security cooperation agreements.',
      achievements: ['Reformed security protocols', 'Established training programs', 'Improved military readiness'],
    },
  ];

  return (
    <section id="journey" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            My Academic & Professional <span className="text-primary">Journey</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A continuous path of learning, growth, and service dedicated to Somalia's democratic development
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Education */}
          <div>
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Education</h3>
            </div>

            <div className="space-y-6">
              {education.map((edu, index) => (
                <Card key={index} className="bg-card border-border hover:border-primary/50 transition-all duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg font-bold text-card-foreground">{edu.institution}</CardTitle>
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        <Calendar className="mr-1 h-3 w-3" />
                        {edu.period}
                      </Badge>
                    </div>
                    <CardDescription className="text-primary font-medium">{edu.degree}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{edu.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div>
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Professional Experience</h3>
            </div>

            <div className="space-y-6">
              {experience.map((exp, index) => (
                <Card key={index} className="bg-card border-border hover:border-primary/50 transition-all duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg font-bold text-card-foreground">{exp.role}</CardTitle>
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        <Calendar className="mr-1 h-3 w-3" />
                        {exp.period}
                      </Badge>
                    </div>
                    <CardDescription className="text-primary font-medium mb-2">{exp.organization}</CardDescription>
                    <p className="text-muted-foreground text-sm">{exp.description}</p>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-medium text-card-foreground mb-2">Key Achievements:</h4>
                    <ul className="space-y-1">
                      {exp.achievements.map((achievement, achIndex) => (
                        <li key={achIndex} className="text-muted-foreground text-sm flex items-center">
                          <div className="w-1 h-1 bg-primary rounded-full mr-2"></div>
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Journey;