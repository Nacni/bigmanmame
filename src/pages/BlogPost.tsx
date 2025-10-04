import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ArrowLeft, Share2, User, Mail, MessageSquare, Trash2 } from 'lucide-react';
import { supabase, Article, Comment } from '@/lib/supabase';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/components/ui/sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const BlogPost = () => {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState({
    name: '',
    email: '',
    content: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [user, setUser] = useState<any>(null); // Add user state for admin functionality

  const { slug } = useParams();
  const navigate = useNavigate();
  const [contentRef, contentVisible] = useScrollAnimation();
  const { t } = useLanguage();

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
    checkUser(); // Check if user is admin
  }, [slug]);

  useEffect(() => {
    if (article) {
      fetchComments();
    }
  }, [article]);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Error checking user:', error);
    }
  };

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

  const fetchComments = async () => {
    if (!article) return;
    
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('article_id', article.id)
        .eq('approved', true) // Only fetch approved comments
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error(t('blog.commentError'));
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.name || !newComment.email || !newComment.content) {
      toast.error("Please fill in all fields");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newComment.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSubmitting(true);
    
    try {
      // Submit comment directly without approval
      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            article_id: article.id,
            name: newComment.name,
            email: newComment.email,
            content: newComment.content,
            approved: true // Automatically approve comments
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Add new comment to the list
      setComments(prev => [data, ...prev]);
      
      // Reset form
      setNewComment({
        name: '',
        email: '',
        content: ''
      });
      
      toast.success("Comment submitted successfully!");
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error("Failed to submit comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Function to delete comments (admin only)
  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;
    
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      // Remove comment from the list
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      toast.success("Comment deleted successfully!");
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error("Failed to delete comment.");
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
    return `${readingTime} ${t('blog.readingTime')}`;
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
    toast.success("Link copied to clipboard!");
  };

  const formatContent = (content: string) => {
    if (!content) return '';

    // Convert markdown to HTML with proper styling
    let htmlContent = content
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-foreground" style="color: hsl(var(--foreground))">$1</strong>')
      // Italic text
      .replace(/\*(.*?)\*/g, '<em class="italic text-foreground" style="color: hsl(var(--foreground))">$1</em>')
      // Headings
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-6 mb-4 text-foreground" style="color: hsl(var(--foreground))">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-8 mb-5 text-foreground" style="color: hsl(var(--foreground))">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-10 mb-6 text-foreground" style="color: hsl(var(--foreground))">$1</h1>')
      // Unordered lists
      .replace(/^\s*-\s(.*)$/gm, '<li class="ml-6 list-disc my-2 text-foreground" style="color: hsl(var(--foreground))">$1</li>')
      // Ordered lists
      .replace(/^\s*\d+\.\s(.*)$/gm, '<li class="ml-6 list-decimal my-2 text-foreground" style="color: hsl(var(--foreground))">$1</li>')
      // Wrap consecutive list items
      .replace(/(<li class="ml-6 list-(?:disc|decimal) my-2 text-foreground"(?: style="color: hsl\(var\(--foreground\)\)")?>.*?<\/li>)+/gs, (match) => {
        const isOrdered = match.includes('list-decimal');
        return `<${isOrdered ? 'ol' : 'ul'} class="my-4 space-y-1" style="color: hsl(var(--foreground))">${match}</${isOrdered ? 'ol' : 'ul'}>`;
      })
      // Images
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto my-6 rounded-lg shadow-lg border border-border" />')
      // Links
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-primary hover:underline" style="color: hsl(var(--primary))" target="_blank" rel="noopener noreferrer">$1</a>')
      // Paragraphs - convert double newlines to paragraphs
      .replace(/\n\n/g, '</p><p class="mb-4 text-foreground" style="color: hsl(var(--foreground))">')
      // Line breaks - convert single newlines within paragraphs
      .replace(/\n/g, '<br />')
      // Handle text that comes after images
      .replace(/(<img[^>]*>)\s*\n\s*([^<\n][^]*?)(?=<|$)/g, '$1<p class="mb-4 text-foreground" style="color: hsl(var(--foreground))">$2</p>')
      // Wrap content in paragraph tags if not already wrapped
      .replace(/^(?!<p|<h|<ul|<ol|<img)(.+)$/gm, '<p class="mb-4 text-foreground" style="color: hsl(var(--foreground))">$1</p>');

    // Ensure the content starts and ends properly
    if (!htmlContent.startsWith('<')) {
      htmlContent = '<p class="mb-4 text-foreground" style="color: hsl(var(--foreground))">' + htmlContent + '</p>';
    }

    return htmlContent;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black light">
        <Header />
        <div className="container mx-auto px-4 pt-32 pb-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-700 mt-4 text-lg">{t('common.loading')}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-white text-black light">
        <Header />
        <div className="container mx-auto px-4 pt-32 pb-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-black mb-4">
              {error === 'Article not found' ? t('blog.articleNotFound') : t('common.error')}
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              {error === 'Article not found' 
                ? t('blog.articleNotFoundMessage')
                : t('blog.articleLoadError')
              }
            </p>
            <div className="space-x-4">
              <Button onClick={() => navigate(-1)} variant="outline" className="text-base border-gray-300 text-gray-700 hover:bg-gray-100">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('blog.goBack')}
              </Button>
              <Link to="/blog">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-base">
                  {t('blog.viewAllArticles')}
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
        <section className="pt-32 pb-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <Link to="/blog">
                  <Button variant="outline" className="text-base">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('blog.backToArticles')}
                  </Button>
                </Link>
              </div>
              
              <Badge className="mb-6 bg-primary text-primary-foreground text-base">
                {t('blog.publishedArticle')}
              </Badge>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
                {article.title}
              </h1>

              {article.excerpt && (
                <p className="text-xl mb-8 leading-relaxed text-foreground">
                  {article.excerpt}
                </p>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-border">
                <div className="flex items-center space-x-6 text-base">
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
                  {t('blog.shareArticle')}
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
                <div className="aspect-video overflow-hidden rounded-lg">
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
        <section ref={contentRef} className={`py-16 bg-background fade-in-up ${contentVisible ? 'animate' : ''}`}>
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <article className="prose prose-lg max-w-none dark:prose-invert">
                <div 
                  className="space-y-6 article-content text-foreground"
                  style={{ color: "hsl(var(--foreground))" }}
                  dangerouslySetInnerHTML={{ __html: formatContent(article.content) }}
                />
              </article>

              {/* Article Footer */}
              <div className="mt-16 pt-8 border-t border-border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-base text-foreground">
                      {t('blog.publishedOn')} {formatDate(article.created_at)}
                    </p>
                    <p className="text-sm text-foreground/80 mt-1">
                      {t('blog.byAuthor')}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Button
                      onClick={handleShare}
                      variant="outline"
                      className="text-base"
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      {t('blog.share')}
                    </Button>
                    
                    <Link to="/blog">
                      <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-base">
                        {t('blog.moreArticles')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Comments Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-foreground">{t('blog.comments')} ({comments.length})</h2>
              
              {/* Comment Form */}
              <Card className="bg-card border-border mb-8">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">{t('blog.leaveComment')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCommentSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-foreground">{t('blog.name')}</Label>
                        <Input
                          id="name"
                          value={newComment.name}
                          onChange={(e) => setNewComment({...newComment, name: e.target.value})}
                          placeholder={t('blog.enterName')}
                          className="bg-input border-border text-foreground"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-foreground">{t('blog.email')}</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newComment.email}
                          onChange={(e) => setNewComment({...newComment, email: e.target.value})}
                          placeholder={t('blog.enterEmail')}
                          className="bg-input border-border text-foreground"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="comment" className="text-foreground">{t('blog.comment')}</Label>
                      <Textarea
                        id="comment"
                        value={newComment.content}
                        onChange={(e) => setNewComment({...newComment, content: e.target.value})}
                        placeholder={t('blog.enterComment')}
                        className="bg-input border-border text-foreground"
                        rows={4}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={submitting}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {submitting ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                          {t('blog.submitting')}
                        </div>
                      ) : (
                        t('blog.submitComment')
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Comments List */}
              <div className="space-y-6">
                {comments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    {t('blog.noComments')} {t('blog.beFirst')}
                  </p>
                ) : (
                  comments.map((comment) => (
                    <Card key={comment.id} className="bg-card border-border">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg text-foreground">{comment.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {new Date(comment.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          {/* Delete button for admin */}
                          {user && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-destructive hover:text-destructive/90"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-foreground">{comment.content}</p>
                      </CardContent>
                    </Card>
                  ))
                )}
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