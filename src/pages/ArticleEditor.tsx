import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Save, Eye, ArrowLeft, Trash2, Plus } from 'lucide-react';
import { supabase, Article } from '@/lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const ArticleEditor = () => {
  const [article, setArticle] = useState<Partial<Article>>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image: '',
    status: 'draft'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(id && id !== 'new');

  useEffect(() => {
    if (isEditing) {
      fetchArticle();
    }
  }, [id, isEditing]);

  const fetchArticle = async () => {
    if (!id || id === 'new') return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setArticle(data);
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      setError('Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setArticle(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title)
    }));
  };

  const handleSave = async (status?: 'draft' | 'published') => {
    setSaving(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const articleData = {
        ...article,
        status: status || article.status,
        author_id: user.id,
        updated_at: new Date().toISOString()
      };

      let result;
      if (isEditing) {
        result = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('articles')
          .insert([{ ...articleData, created_at: new Date().toISOString() }])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      toast({
        title: "Success!",
        description: `Article ${isEditing ? 'updated' : 'created'} successfully.`,
      });

      if (!isEditing && result.data) {
        navigate(`/admin/articles/${result.data.id}/edit`);
      }
    } catch (error) {
      console.error('Error saving article:', error);
      setError('Failed to save article');
      toast({
        title: "Error",
        description: "Failed to save article. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing || !window.confirm('Are you sure you want to delete this article?')) return;

    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Article deleted successfully.",
      });

      navigate('/admin/articles');
    } catch (error) {
      console.error('Error deleting article:', error);
      toast({
        title: "Error",
        description: "Failed to delete article.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/articles')}
            className="text-base"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Articles
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isEditing ? 'Edit Article' : 'New Article'}
            </h1>
            {article.status && (
              <Badge className="mt-1" variant={article.status === 'published' ? 'default' : 'secondary'}>
                {article.status}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {isEditing && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={saving}
              className="text-base"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={() => handleSave('draft')}
            disabled={saving || !article.title}
            className="text-base"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          
          <Button
            onClick={() => handleSave('published')}
            disabled={saving || !article.title || !article.content}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow text-base"
          >
            {saving ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                Saving...
              </div>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Publish
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Alert className="border-destructive bg-destructive/10">
          <AlertDescription className="text-destructive font-medium">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">Article Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-medium text-foreground">
                  Title *
                </Label>
                <Input
                  id="title"
                  value={article.title || ''}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter article title"
                  className="h-12 text-base bg-input border-border focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-base font-medium text-foreground">
                  URL Slug
                </Label>
                <Input
                  id="slug"
                  value={article.slug || ''}
                  onChange={(e) => setArticle(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="article-url-slug"
                  className="h-12 text-base bg-input border-border focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt" className="text-base font-medium text-foreground">
                  Excerpt
                </Label>
                <Textarea
                  id="excerpt"
                  value={article.excerpt || ''}
                  onChange={(e) => setArticle(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief description of the article"
                  rows={3}
                  className="text-base bg-input border-border focus:border-primary resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" className="text-base font-medium text-foreground">
                  Content *
                </Label>
                <Textarea
                  id="content"
                  value={article.content || ''}
                  onChange={(e) => setArticle(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your article content here..."
                  rows={20}
                  className="text-base bg-input border-border focus:border-primary resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Publish Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status" className="text-base font-medium text-foreground">
                  Status
                </Label>
                <Select 
                  value={article.status} 
                  onValueChange={(value: 'draft' | 'published') => 
                    setArticle(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger className="h-12 text-base bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="featured_image" className="text-base font-medium text-foreground">
                  Featured Image URL
                </Label>
                <Input
                  id="featured_image"
                  value={article.featured_image || ''}
                  onChange={(e) => setArticle(prev => ({ ...prev, featured_image: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                  className="h-12 text-base bg-input border-border focus:border-primary"
                />
                {article.featured_image && (
                  <div className="mt-2">
                    <img
                      src={article.featured_image}
                      alt="Featured image preview"
                      className="w-full h-32 object-cover rounded border border-border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                onClick={() => window.open(`/blog/${article.slug}`, '_blank')}
                disabled={!article.slug}
                className="w-full justify-start text-base"
              >
                <Eye className="mr-2 h-4 w-4" />
                Preview Article
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate('/admin/media')}
                className="w-full justify-start text-base"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Media
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ArticleEditor;