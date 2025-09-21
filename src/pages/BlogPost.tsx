import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react';
import { supabase, Article } from '@/lib/supabase';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

const BlogPost = () => {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { slug } = useParams();
  const navigate = useNavigate();
  const [contentRef, contentVisible] = useScrollAnimation();

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  const fetchArticle = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Article not found');
        } else {
          throw error;
        }
      } else {
        setArticle(data);
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      setError('Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readingTime} min read`;
  };

  const handleShare = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt || article.title,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to clipboard
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    // You could add a toast notification here
  };

  const formatContent = (content: string) => {
    // Simple formatting - split by paragraphs and preserve line breaks
    return content.split('\n').map((paragraph, index) => {
      if (paragraph.trim() === '') return null;
      return (
        <p key={index} className="text-lg text-foreground leading-relaxed mb-6">
          {paragraph}
        </p>
      );
    }).filter(Boolean);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-32 pb-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4 text-lg">Loading article...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-32 pb-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {error === 'Article not found' ? 'Article Not Found' : 'Something Went Wrong'}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {error === 'Article not found' 
                ? 'The article you\'re looking for doesn\'t exist or has been removed.'
                : 'We encountered an error while loading the article.'
              }
            </p>
            <div className="space-x-4">
              <Button onClick={() => navigate(-1)} variant="outline" className="text-base">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              <Link to="/blog">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-base">
                  View All Articles
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main>
        {/* Article Header */}
        <section className="pt-32 pb-16 bg-gradient-dark">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <Link to="/blog">
                  <Button variant="outline" className="text-base">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Articles
                  </Button>
                </Link>
              </div>
              
              <Badge className="mb-6 bg-primary text-primary-foreground text-base">
                Published Article
              </Badge>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
                {article.title}
              </h1>

              {article.excerpt && (
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  {article.excerpt}
                </p>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-border">
                <div className="flex items-center text-muted-foreground space-x-6 text-base">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    {formatDate(article.created_at)}
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    {getReadingTime(article.content)}
                  </div>
                </div>
                
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="text-base"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Article
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Image */}
        {article.featured_image && (
          <section className="py-0">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <div className="aspect-video overflow-hidden rounded-lg shadow-neon">
                  <img
                    src={article.featured_image}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Article Content */}
        <section ref={contentRef} className={`py-16 fade-in-up ${contentVisible ? 'animate' : ''}`}>
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <article className="prose prose-lg prose-invert max-w-none">
                <div className="space-y-6">
                  {formatContent(article.content)}
                </div>
              </article>

              {/* Article Footer */}
              <div className="mt-16 pt-8 border-t border-border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-base text-muted-foreground">
                      Published on {formatDate(article.created_at)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      By Cabdalla Xuseen Cali
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Button
                      onClick={handleShare}
                      variant="outline"
                      className="text-base"
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                    
                    <Link to="/blog">
                      <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow text-base">
                        More Articles
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default BlogPost;