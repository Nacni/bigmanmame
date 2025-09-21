import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Search, ArrowRight } from 'lucide-react';
import { supabase, Article } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

const Blog = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [heroRef, heroVisible] = useScrollAnimation();
  const [articlesRef, articlesVisible] = useScrollAnimation();

  useEffect(() => {
    fetchPublishedArticles();
  }, []);

  const fetchPublishedArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (article.excerpt && article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section ref={heroRef} className={`pt-20 pb-16 bg-gradient-dark fade-in-up ${heroVisible ? 'animate' : ''}`}>
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Latest <span className="text-primary animate-glow">Insights</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Stay updated with my thoughts on Somalia's development, governance, and the path forward
            </p>
            
            {/* Search */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-base bg-card border-border focus:border-primary shadow-neon"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Articles Section */}
        <section ref={articlesRef} className={`py-20 fade-in-up ${articlesVisible ? 'animate' : ''}`}>
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-4 text-lg">Loading articles...</p>
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {searchTerm ? 'No articles found' : 'No articles published yet'}
                </h3>
                <p className="text-lg text-muted-foreground">
                  {searchTerm 
                    ? 'Try adjusting your search terms to find what you\'re looking for.'
                    : 'Check back soon for the latest insights and updates.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Featured Article */}
                {filteredArticles.length > 0 && (
                  <Card className="bg-card border-border shadow-neon hover:shadow-glow-strong transition-all duration-300">
                    <div className="grid md:grid-cols-2 gap-6">
                      {filteredArticles[0].featured_image && (
                        <div className="md:order-2">
                          <img
                            src={filteredArticles[0].featured_image}
                            alt={filteredArticles[0].title}
                            className="w-full h-64 md:h-full object-cover rounded-r-lg"
                          />
                        </div>
                      )}
                      <div className={`p-8 ${filteredArticles[0].featured_image ? 'md:order-1' : 'md:col-span-2'}`}>
                        <Badge className="mb-4 bg-primary text-primary-foreground text-base">
                          Featured Article
                        </Badge>
                        <h2 className="text-3xl font-bold text-foreground mb-4 hover:text-primary transition-colors">
                          <Link to={`/blog/${filteredArticles[0].slug}`}>
                            {filteredArticles[0].title}
                          </Link>
                        </h2>
                        {filteredArticles[0].excerpt && (
                          <p className="text-lg text-muted-foreground mb-6">
                            {filteredArticles[0].excerpt}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-muted-foreground space-x-4 text-base">
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4" />
                              {formatDate(filteredArticles[0].created_at)}
                            </div>
                            <div className="flex items-center">
                              <Clock className="mr-2 h-4 w-4" />
                              {getReadingTime(filteredArticles[0].content)}
                            </div>
                          </div>
                          <Link to={`/blog/${filteredArticles[0].slug}`}>
                            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow text-base">
                              Read More <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Other Articles Grid */}
                {filteredArticles.length > 1 && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredArticles.slice(1).map((article, index) => (
                      <Card key={article.id} className={`bg-card border-border hover:shadow-neon transition-all duration-300 fade-in-up stagger-${(index % 3) + 1} ${articlesVisible ? 'animate' : ''}`}>
                        {article.featured_image && (
                          <div className="aspect-video overflow-hidden rounded-t-lg">
                            <img
                              src={article.featured_image}
                              alt={article.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <CardHeader>
                          <CardTitle className="text-xl font-bold text-foreground hover:text-primary transition-colors">
                            <Link to={`/blog/${article.slug}`}>
                              {article.title}
                            </Link>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {article.excerpt && (
                            <p className="text-base text-muted-foreground mb-4">
                              {truncateText(article.excerpt, 120)}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-muted-foreground space-x-3">
                              <div className="flex items-center">
                                <Calendar className="mr-1 h-3 w-3" />
                                {formatDate(article.created_at)}
                              </div>
                              <div className="flex items-center">
                                <Clock className="mr-1 h-3 w-3" />
                                {getReadingTime(article.content)}
                              </div>
                            </div>
                            <Link to={`/blog/${article.slug}`}>
                              <Button variant="outline" size="sm" className="text-base">
                                Read More
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Blog;