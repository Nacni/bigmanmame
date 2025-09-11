import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Users, Calendar } from 'lucide-react';
import { useState } from 'react';

const Contact = () => {
  const [heroRef, heroVisible] = useScrollAnimation();
  const [formRef, formVisible] = useScrollAnimation();
  const [infoRef, infoVisible] = useScrollAnimation();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      details: ['info@cabdallaxuseen.com', 'office@cabdallaxuseen.com'],
      description: 'Send us an email anytime'
    },
    {
      icon: Phone,
      title: 'Phone',
      details: ['+252 61 123 4567', '+252 61 987 6543'],
      description: 'Call during business hours'
    },
    {
      icon: MapPin,
      title: 'Office Address',
      details: ['Federal Parliament Building', 'Mogadishu, Somalia'],
      description: 'Visit our parliamentary office'
    },
    {
      icon: Clock,
      title: 'Office Hours',
      details: ['Monday - Friday: 8:00 AM - 5:00 PM', 'Saturday: 9:00 AM - 1:00 PM'],
      description: 'We\'re here to help'
    }
  ];

  const quickActions = [
    {
      icon: MessageSquare,
      title: 'Schedule Meeting',
      description: 'Book a consultation or meeting',
      action: 'Schedule Now'
    },
    {
      icon: Users,
      title: 'Community Outreach',
      description: 'Connect with community programs',
      action: 'Learn More'
    },
    {
      icon: Calendar,
      title: 'Public Events',
      description: 'Attend upcoming public events',
      action: 'View Events'
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
                Get In <span className="text-primary">Touch</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                I'm here to listen, engage, and work together for Somalia's progress. 
                Reach out for consultations, community engagement, or to share your ideas.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div ref={formRef} className={`fade-in-left ${formVisible ? 'animate' : ''}`}>
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-card-foreground">
                      Send a Message
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Fill out the form below and I'll get back to you as soon as possible.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-card-foreground">Full Name</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Your full name"
                            required
                            className="border-border focus:border-primary"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-card-foreground">Email Address</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="your.email@example.com"
                            required
                            className="border-border focus:border-primary"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="subject" className="text-card-foreground">Subject</Label>
                        <Input
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          placeholder="What is this about?"
                          required
                          className="border-border focus:border-primary"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-card-foreground">Message</Label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="Tell me more about your inquiry..."
                          rows={6}
                          required
                          className="border-border focus:border-primary resize-none"
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow transition-all duration-300"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Information */}
              <div ref={infoRef} className={`space-y-8 fade-in-right ${infoVisible ? 'animate' : ''}`}>
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-card-foreground">
                    Contact <span className="text-primary">Information</span>
                  </h2>
                  <div className="space-y-6">
                    {contactInfo.map((info, index) => {
                      const IconComponent = info.icon;
                      return (
                        <Card key={index} className="bg-card border-border hover:border-primary/50 transition-all duration-300">
                          <CardContent className="p-6">
                            <div className="flex items-start space-x-4">
                              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                <IconComponent className="h-6 w-6 text-primary" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                                  {info.title}
                                </h3>
                                <div className="space-y-1">
                                  {info.details.map((detail, detailIndex) => (
                                    <p key={detailIndex} className="text-muted-foreground">
                                      {detail}
                                    </p>
                                  ))}
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                  {info.description}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-xl font-bold mb-4 text-card-foreground">
                    Quick <span className="text-primary">Actions</span>
                  </h3>
                  <div className="space-y-4">
                    {quickActions.map((action, index) => {
                      const IconComponent = action.icon;
                      return (
                        <Card key={index} className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-neon group">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                                <IconComponent className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-card-foreground group-hover:text-primary transition-colors duration-300">
                                  {action.title}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {action.description}
                                </p>
                              </div>
                              <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                                {action.action}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Visit Our <span className="text-primary">Office</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Located in the heart of Mogadishu, our parliamentary office is easily accessible 
                and welcomes visitors for consultations and meetings.
              </p>
            </div>
            
            <Card className="bg-card border-border overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-video bg-muted/30 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-16 w-16 mx-auto mb-4 text-primary" />
                    <h3 className="text-xl font-semibold text-card-foreground mb-2">
                      Federal Parliament Building
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Mogadishu, Somalia
                    </p>
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                      Get Directions
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;

