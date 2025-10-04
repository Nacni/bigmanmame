import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { Play, ExternalLink, Calendar, Clock, Eye, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import petroleumThumb from '@/assets/video-petroleum-thumb.jpg';
import southwestThumb from '@/assets/video-southwest-thumb.jpg';
import electionThumb from '@/assets/video-election-thumb.jpg';

const Videos = () => {
  const [heroRef, heroVisible] = useScrollAnimation();
  const [featuredRef, featuredVisible] = useScrollAnimation();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<{[key: string]: any[]}>({});
  const [newComment, setNewComment] = useState<{[key: string]: {name: string, email: string, content: string}}>({});
  const [submitting, setSubmitting] = useState<{[key: string]: boolean}>({});

  // Featured videos (these will remain as hardcoded examples)
  const featuredVideos = [
    {
      id: '1',
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
      id: '2',
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
      id: '3',
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

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filter only video files
      const videoFiles = (data || []).filter(item => 
        item.filename?.match(/\.(mp4|avi|mov|wmv|flv|webm)$/i) || 
        item.url // Include all URLs for external videos
      ).map(item => ({
        ...item,
        title: item.title || item.filename?.split('.')[0] || 'Untitled Video',
        category: item.category || 'General',
        is_external: !item.filename // If no filename, it's an external video
      }));
      
      setVideos(videoFiles);
      
      // Initialize comment forms for each video
      const initialComments: {[key: string]: any[]} = {};
      const initialNewComment: {[key: string]: {name: string, email: string, content: string}} = {};
      const initialSubmitting: {[key: string]: boolean} = {};
      
      [...featuredVideos, ...videoFiles].forEach(video => {
        initialComments[video.id] = [];
        initialNewComment[video.id] = { name: '', email: '', content: '' };
        initialSubmitting[video.id] = false;
      });
      
      setComments(initialComments);
      setNewComment(initialNewComment);
      setSubmitting(initialSubmitting);
      
      // Fetch comments for all videos
      [...featuredVideos, ...videoFiles].forEach(video => {
        fetchCommentsForVideo(video.id);
      });
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommentsForVideo = async (videoId: string) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('media_id', videoId)
        .eq('approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setComments(prev => ({
        ...prev,
        [videoId]: data || []
      }));
    } catch (error) {
      console.error('Error fetching comments for video:', videoId, error);
    }
  };

  const handleVideoClick = (videoUrl: string) => {
    if (videoUrl !== '#') {
      window.open(videoUrl, '_blank');
    }
  };

  // Use a placeholder thumbnail for dynamic videos
  const getThumbnail = () => {
    // In a real implementation, you might generate thumbnails or use a default image
    return petroleumThumb; // Using existing thumbnail as placeholder
  };

  const handleCommentSubmit = async (videoId: string, e: React.FormEvent) => {
    e.preventDefault();
    
    const commentData = newComment[videoId];
    
    if (!commentData.name || !commentData.email || !commentData.content) {
      alert("Please fill in all fields");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(commentData.email)) {
      alert("Please enter a valid email address");
      return;
    }

    setSubmitting(prev => ({ ...prev, [videoId]: true }));
    
    try {
      // Submit comment directly without approval
      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            media_id: videoId,
            name: commentData.name,
            email: commentData.email,
            content: commentData.content,
            approved: true // Automatically approve comments
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Add new comment to the list
      setComments(prev => ({
        ...prev,
        [videoId]: [data, ...prev[videoId]]
      }));
      
      // Reset form for this video
      setNewComment(prev => ({
        ...prev,
        [videoId]: { name: '', email: '', content: '' }
      }));
      
      alert("Comment submitted successfully!");
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert("Failed to submit comment. Please try again.");
    } finally {
      setSubmitting(prev => ({ ...prev, [videoId]: false }));
    }
  };

  const handleCommentChange = (videoId: string, field: string, value: string) => {
    setNewComment(prev => ({
      ...prev,
      [videoId]: {
        ...prev[videoId],
        [field]: value
      }
    }));
  };

  const VideoCard = ({ video }: { video: any }) => {
    const videoComments = comments[video.id] || [];
    
    return (
      <Card className="bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-neon group overflow-hidden">
        {/* Video Thumbnail */}
        <div className="relative overflow-hidden">
          <img 
            src={video.thumbnail || getThumbnail()}
            alt={video.title}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Button 
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow"
              onClick={() => handleVideoClick(video.videoUrl || video.url)}
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Video
            </Button>
          </div>
          {video.is_external && (
            <div className="absolute top-4 right-4">
              <div className="bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
                External
              </div>
            </div>
          )}
        </div>

        {/* Video Content */}
        <CardHeader>
          <CardTitle className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors duration-300">
            {video.title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {video.date || new Date(video.created_at).toLocaleDateString()}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription className="text-muted-foreground leading-relaxed">
            {video.description || video.alt_text || 'No description available'}
          </CardDescription>
          <Button 
            variant="outline"
            className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            onClick={() => handleVideoClick(video.videoUrl || video.url)}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            {video.is_external ? 'Watch on Platform' : 'Play Video'}
          </Button>
          
          {/* Comments Section */}
          <div className="border-t border-border pt-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-foreground">Comments ({videoComments.length})</h3>
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </div>
            
            {/* Comment Form */}
            <form onSubmit={(e) => handleCommentSubmit(video.id, e)} className="space-y-3 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor={`name-${video.id}`} className="text-xs text-foreground">Name</Label>
                  <Input
                    id={`name-${video.id}`}
                    value={newComment[video.id]?.name || ''}
                    onChange={(e) => handleCommentChange(video.id, 'name', e.target.value)}
                    placeholder="Your name"
                    className="bg-input border-border text-foreground text-sm h-8"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`email-${video.id}`} className="text-xs text-foreground">Email</Label>
                  <Input
                    id={`email-${video.id}`}
                    type="email"
                    value={newComment[video.id]?.email || ''}
                    onChange={(e) => handleCommentChange(video.id, 'email', e.target.value)}
                    placeholder="Your email"
                    className="bg-input border-border text-foreground text-sm h-8"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor={`comment-${video.id}`} className="text-xs text-foreground">Comment</Label>
                <Textarea
                  id={`comment-${video.id}`}
                  value={newComment[video.id]?.content || ''}
                  onChange={(e) => handleCommentChange(video.id, 'content', e.target.value)}
                  placeholder="Write your comment..."
                  className="bg-input border-border text-foreground text-sm"
                  rows={2}
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={submitting[video.id]}
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-8"
              >
                {submitting[video.id] ? 'Submitting...' : 'Post Comment'}
              </Button>
            </form>
            
            {/* Comments List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {videoComments.length === 0 ? (
                <p className="text-muted-foreground text-sm">No comments yet. Be the first to comment!</p>
              ) : (
                videoComments.map((comment: any) => (
                  <div key={comment.id} className="bg-muted/30 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-foreground text-sm">{comment.name}</h4>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
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
              {featuredVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </div>
        </section>

        {/* Admin Videos Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Latest <span className="text-primary">Uploads</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Recently added videos from the administration panel
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No videos have been added through the admin panel yet.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {videos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Videos;