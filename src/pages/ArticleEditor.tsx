import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Eye, ArrowLeft, Trash2, Plus, Upload, X } from 'lucide-react';
import { supabase, Article } from '@/lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import RichTextEditor from '@/components/RichTextEditor';
import CommentsManager from '@/components/CommentsManager';

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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('media')
        .upload(`article-images/${fileName}`, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(`article-images/${fileName}`);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    if (!file) return;

    try {
      const publicUrl = await handleImageUpload(file);
      setArticle(prev => ({ ...prev, featured_image: publicUrl }));
      
      toast({
        title: "Success!",
        description: "Featured image uploaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload featured image.",
        variant: "destructive",
      });
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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
      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          {isEditing && <TabsTrigger value="comments">Comments</TabsTrigger>}
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
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
                    <Input
                      id="excerpt"
                      value={article.excerpt || ''}
                      onChange={(e) => setArticle(prev => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="Brief description of the article"
                      className="h-12 text-base bg-input border-border focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content" className="text-base font-medium text-foreground">
                      Content *
                    </Label>
                    <RichTextEditor
                      value={article.content || ''}
                      onChange={(content) => setArticle(prev => ({ ...prev, content }))}
                      placeholder="Write your article content here..."
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">Featured Image</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFeaturedImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={triggerFileInput}
                      disabled={uploading}
                      className="flex-1 text-base"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Image
                        </>
                      )}
                    </Button>
                  </div>
                  {article.featured_image && (
                    <div className="mt-2 relative">
                      <img
                        src={article.featured_image}
                        alt="Featured image preview"
                        className="w-full h-32 object-cover rounded border border-border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={() => setArticle(prev => ({ ...prev, featured_image: '' }))}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
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
                    Media Library
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">Publish Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
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
                    <Label htmlFor="slug-settings" className="text-base font-medium text-foreground">
                      URL Slug
                    </Label>
                    <Input
                      id="slug-settings"
                      value={article.slug || ''}
                      onChange={(e) => setArticle(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="article-url-slug"
                      className="h-12 text-base bg-input border-border focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="excerpt-settings" className="text-base font-medium text-foreground">
                      Excerpt
                    </Label>
                    <Input
                      id="excerpt-settings"
                      value={article.excerpt || ''}
                      onChange={(e) => setArticle(prev => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="Brief description of the article"
                      className="h-12 text-base bg-input border-border focus:border-primary"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">Featured Image</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFeaturedImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={triggerFileInput}
                      disabled={uploading}
                      className="flex-1 text-base"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Image
                        </>
                      )}
                    </Button>
                  </div>
                  {article.featured_image && (
                    <div className="mt-2 relative">
                      <img
                        src={article.featured_image}
                        alt="Featured image preview"
                        className="w-full h-32 object-cover rounded border border-border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={() => setArticle(prev => ({ ...prev, featured_image: '' }))}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {isEditing && (
          <TabsContent value="comments" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">Comments Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CommentsManager articleId={id} />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="preview" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">Article Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">{article.title || 'Article Title'}</h1>
                  {article.excerpt && (
                    <p className="text-lg text-muted-foreground">{article.excerpt}</p>
                  )}
                </div>

                {article.featured_image && (
                  <div className="aspect-video overflow-hidden rounded-lg">
                    <img
                      src={article.featured_image}
                      alt="Featured"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="prose prose-lg prose-invert max-w-none">
                  {article.content ? (
                    <div 
                      className="space-y-6 text-foreground"
                      dangerouslySetInnerHTML={{
                        __html: article.content
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                          .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto my-6 rounded-lg shadow-lg" />')
                          .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank">$1</a>')
                          .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-8 mb-4 text-foreground">$1</h3>')
                          .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-10 mb-5 text-foreground">$1</h2>')
                          .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-12 mb-6 text-foreground">$1</h1>')
                          .replace(/^\- (.*$)/gm, '<li class="ml-6 list-disc text-foreground my-2">$1</li>')
                          .replace(/^\d+\. (.*$)/gm, '<li class="ml-6 list-decimal text-foreground my-2">$1</li>')
                          .replace(/(?:<li class="ml-6 list-(?:disc|decimal) text-foreground my-2">.*<\/li>)+/gs, (match) => {
                            const isOrdered = match.includes('list-decimal');
                            return `<${isOrdered ? 'ol' : 'ul'} class="my-6">${match}</${isOrdered ? 'ol' : 'ul'}>`;
                          })
                          .replace(/\n\n/g, '</p><p class="mb-6 text-foreground">')
                          .replace(/\n/g, '<br />')
                          .replace(/^<p class="mb-6 text-foreground">/, '<p class="mb-6 text-foreground">')
                          .replace(/<p class="mb-6 text-foreground">$/, '</p>')
                      }}
                    />
                  ) : (
                    <p className="text-muted-foreground">No content to preview.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ArticleEditor;