import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ArrowLeft, Share2, User, Mail, MessageSquare } from 'lucide-react';
import { supabase, Article, Comment } from '@/lib/supabase';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';

const BlogPost = () => {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState({ name: '', email: '', content: '' });
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const { slug } = useParams();
  const navigate = useNavigate();
  const [contentRef, contentVisible] = useScrollAnimation();
  const { t } = useLanguage();

  useEffect(() => {
    if (slug) {
      fetchArticle();
      fetchComments();
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

  const fetchComments = async () => {
    if (!slug) return;
    
    try {
      // First get the article ID
      const { data: articleData, error: articleError } = await supabase
        .from('articles')
        .select('id')
        .eq('slug', slug)
        .single();

      if (articleError) throw articleError;

      // Then fetch approved comments for this article
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('article_id', articleData.id)
        .eq('approved', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!article || !newComment.name || !newComment.email || !newComment.content) return;

    setCommentLoading(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert([
          {
            article_id: article.id,
            name: newComment.name,
            email: newComment.email,
            content: newComment.content,
            approved: false // Comments need approval
          }
        ]);

      if (error) throw error;

      // Reset form
      setNewComment({ name: '', email: '', content: '' });
      
      // Show success message
      alert(t('blog.commentSubmitted'));
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert(t('blog.commentError'));
    } finally {
      setCommentLoading(false);
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
    // You could add a toast notification here
  };

  const formatContent = (content: string) => {
    if (!content) return '';

    // Convert markdown to HTML with proper styling
    let htmlContent = content
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>')
      // Italic text
      .replace(/\*(.*?)\*/g, '<em class="italic text-foreground">$1</em>')
      // Headings
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-6 mb-4 text-foreground">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-8 mb-5 text-foreground">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-10 mb-6 text-foreground">$1</h1>')
      // Unordered lists
      .replace(/^\s*-\s(.*)$/gm, '<li class="ml-6 list-disc text-foreground my-2">$1</li>')
      // Ordered lists
      .replace(/^\s*\d+\.\s(.*)$/gm, '<li class="ml-6 list-decimal text-foreground my-2">$1</li>')
      // Wrap consecutive list items
      .replace(/(<li class="ml-6 list-(?:disc|decimal) text-foreground my-2">.*<\/li>)+/gs, (match) => {
        const isOrdered = match.includes('list-decimal');
        return `<${isOrdered ? 'ol' : 'ul'} class="my-4 space-y-1">${match}</${isOrdered ? 'ol' : 'ul'}>`;
      })
      // Images
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto my-6 rounded-lg shadow-lg border border-border" />')
      // Links
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
      // Paragraphs - convert double newlines to paragraphs
      .replace(/\n\n/g, '</p><p class="mb-4 text-foreground">')
      // Line breaks - convert single newlines within paragraphs
      .replace(/\n/g, '<br />')
      // Wrap content in paragraph tags if not already wrapped
      .replace(/^(?!<p|<h|<ul|<ol|<img)(.+)$/gm, '<p class="mb-4 text-foreground">$1</p>');

    // Ensure the content starts and ends properly
    if (!htmlContent.startsWith('<')) {
      htmlContent = '<p class="mb-4 text-foreground">' + htmlContent + '</p>';
    }

    return htmlContent;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-32 pb-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4 text-lg">{t('common.loading')}</p>
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
              {error === 'Article not found' ? t('blog.articleNotFound') : t('common.error')}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {error === 'Article not found' 
                ? t('blog.articleNotFoundMessage')
                : t('blog.articleLoadError')
              }
            </p>
            <div className="space-x-4">
              <Button onClick={() => navigate(-1)} variant="outline" className="text-base">
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
        <section className="pt-32 pb-16 bg-gradient-dark">
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
                <div 
                  className="space-y-6 text-foreground [&_p]:text-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_li]:text-foreground"
                  dangerouslySetInnerHTML={{ __html: formatContent(article.content) }}
                />
              </article>

              {/* Article Footer */}
              <div className="mt-16 pt-8 border-t border-border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-base text-muted-foreground">
                      {t('blog.publishedOn')} {formatDate(article.created_at)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
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
                      <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow text-base">
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
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center mb-10">
                <MessageSquare className="h-6 w-6 mr-2 text-primary" />
                <h2 className="text-3xl font-bold text-foreground">{t('blog.comments')}</h2>
              </div>

              {/* Comments List */}
              <div className="space-y-6 mb-12">
                {commentsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="bg-card border border-border rounded-lg p-6">
                      <div className="flex items-start">
                        <div className="bg-primary/10 rounded-full p-3 mr-4">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                            <h3 className="font-semibold text-foreground">{comment.name}</h3>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-foreground">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">{t('blog.noComments')}</h3>
                    <p className="text-muted-foreground">{t('blog.beFirst')}</p>
                  </div>
                )}
              </div>

              {/* Comment Form */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-xl font-bold text-foreground mb-6">{t('blog.leaveComment')}</h3>
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-foreground">
                        {t('blog.name')} *
                      </label>
                      <Input
                        id="name"
                        value={newComment.name}
                        onChange={(e) => setNewComment({...newComment, name: e.target.value})}
                        placeholder={t('blog.enterName')}
                        required
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-foreground">
                        {t('blog.email')} *
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={newComment.email}
                        onChange={(e) => setNewComment({...newComment, email: e.target.value})}
                        placeholder={t('blog.enterEmail')}
                        required
                        className="bg-input border-border"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="comment" className="text-sm font-medium text-foreground">
                      {t('blog.comment')} *
                    </label>
                    <Textarea
                      id="comment"
                      value={newComment.content}
                      onChange={(e) => setNewComment({...newComment, content: e.target.value})}
                      placeholder={t('blog.enterComment')}
                      rows={4}
                      required
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={commentLoading || !newComment.name || !newComment.email || !newComment.content}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {commentLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                          {t('blog.submitting')}
                        </>
                      ) : (
                        t('blog.submitComment')
                      )}
                    </Button>
                  </div>
                </form>
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