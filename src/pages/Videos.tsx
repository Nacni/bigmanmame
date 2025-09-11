import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { Play, ExternalLink, Calendar, Clock, Eye } from 'lucide-react';
import petroleumThumb from '@/assets/video-petroleum-thumb.jpg';
import southwestThumb from '@/assets/video-southwest-thumb.jpg';
import electionThumb from '@/assets/video-election-thumb.jpg';

const Videos = () => {
  const [heroRef, heroVisible] = useScrollAnimation();
  const [featuredRef, featuredVisible] = useScrollAnimation();

  const featuredVideos = [
    {
      title: 'The Future of Somalia\'s Petroleum Sector',
      description: 'Comprehensive analysis and strategic vision for Somalia\'s petroleum industry development and economic growth.',
      thumbnail: petroleumThumb,
      videoUrl: 'https://web.facebook.com/watch/?v=1521905811752464',
      duration: '25:30',
      date: '2024',
      category: 'Economic Policy',
      views: '15.2K'
    },
    {
      title: 'South West State of Somalia: Towards Self-Sufficiency',
      description: 'Addressing regional development challenges and outlining pathways for economic self-sufficiency and community empowerment.',
      thumbnail: southwestThumb,
      videoUrl: 'https://www.facebook.com/smssomalitv/videos/xildhibaan-cabdalla-xuseen-cali-koonfur-galbeed-shacabkeeda-ha-isku-tashto-hana-/1576763903246630/',
      duration: '18:45',
      date: '2024',
      category: 'Regional Development',
      views: '8.7K'
    },
    {
      title: 'Addressing Election Corruption',
      description: 'Critical discussion on electoral integrity, transparency measures, and democratic governance reforms in Somalia.',
      thumbnail: electionThumb,
      videoUrl: 'https://www.facebook.com/GoobjoogMedia/videos/xildhibaan-cabdalla-xuseen-cali/649579685437560/',
      duration: '22:15',
      date: '2024',
      category: 'Democratic Governance',
      views: '12.1K'
    }
  ];

  const handleVideoClick = (videoUrl: string) => {
    if (videoUrl !== '#') {
      window.open(videoUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="pt-20 pb-16 bg-gradient-dark">
          <div className="container mx-auto px-4">
            <div ref={heroRef} className={`text-center max-w-4xl mx-auto fade-in-up ${heroVisible ? 'animate' : ''}`}>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Video <span className="text-primary">Gallery</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Watch key speeches, interviews, and public appearances showcasing my leadership, 
                policy positions, and commitment to Somalia's democratic development.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Videos */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div ref={featuredRef} className={`text-center mb-16 fade-in-up ${featuredVisible ? 'animate' : ''}`}>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Featured <span className="text-primary">Videos</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Most popular and impactful speeches addressing critical issues facing Somalia
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredVideos.map((video, index) => (
                <Card 
                  key={index}
                  className={`bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-neon group overflow-hidden fade-in-up ${featuredVisible ? 'animate' : ''} stagger-${index + 1}`}
                >
                  {/* Video Thumbnail */}
                  <div className="relative overflow-hidden">
                    <img 
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Button 
                        size="lg"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow"
                        onClick={() => handleVideoClick(video.videoUrl)}
                      >
                        <Play className="mr-2 h-5 w-5" />
                        Watch Video
                      </Button>
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2">
                      <div className="bg-card/90 backdrop-blur-sm text-card-foreground px-2 py-1 rounded text-sm font-medium flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        {video.duration}
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 flex gap-2">
                      <div className="bg-primary text-primary-foreground px-2 py-1 rounded text-sm font-medium">
                        {video.date}
                      </div>
                      <div className="bg-card/90 backdrop-blur-sm text-card-foreground px-2 py-1 rounded text-sm font-medium flex items-center">
                        <Eye className="mr-1 h-3 w-3" />
                        {video.views}
                      </div>
                    </div>
                  </div>

                  {/* Video Content */}
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors duration-300">
                      {video.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{video.category}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-muted-foreground leading-relaxed">
                      {video.description}
                    </CardDescription>
                    <Button 
                      variant="outline"
                      className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                      onClick={() => handleVideoClick(video.videoUrl)}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Watch on Platform
                    </Button>
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

export default Videos;

