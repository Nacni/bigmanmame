import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Eye, ArrowLeft, Trash2, Plus, Upload, X, Calendar, Tag, Hash, FileText, Image as ImageIcon } from 'lucide-react';
import { supabase, Article } from '@/lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import RichTextEditor from '@/components/RichTextEditor';

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
  const [previewMode, setPreviewMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { id } = useParams();
  const navigate = useNavigate();
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
      toast.error("Failed to load article");
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

  const handleInlineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    if (!file) return;

    try {
      const publicUrl = await handleImageUpload(file);
      
      // Insert the image markdown at the current cursor position in the content
      const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const content = article.content || '';
        const imageMarkdown = `\n![Image](${publicUrl})\n`;
        const newContent = content.substring(0, start) + imageMarkdown + content.substring(end);
        
        setArticle(prev => ({ ...prev, content: newContent }));
        
        toast.success("Image uploaded and inserted successfully.");
      }
    } catch (error) {
      toast.error("Failed to upload image.");
    }
  };

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    if (!file) return;

    try {
      const publicUrl = await handleImageUpload(file);
      setArticle(prev => ({ ...prev, featured_image: publicUrl }));
      
      toast.success("Featured image uploaded successfully.");
    } catch (error) {
      toast.error("Failed to upload featured image.");
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const triggerInlineImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = handleInlineImageUpload as any;
    input.click();
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

      toast.success(`Article ${isEditing ? 'updated' : 'created'} successfully.`);

      if (!isEditing && result.data) {
        navigate(`/admin/articles/${result.data.id}/edit`);
      }
    } catch (error) {
      console.error('Error saving article:', error);
      setError('Failed to save article');
      toast.error("Failed to save article. Please try again.");
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

      toast.success("Article deleted successfully.");
      navigate('/admin/articles');
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error("Failed to delete article.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Button variant="outline" onClick={() => navigate('/admin/articles')} className="mb-3">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Articles
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            {isEditing ? 'Edit Article' : 'Create Article'}
          </h1>
          {isEditing && article.created_at && (
            <p className="text-sm text-muted-foreground mt-1">
              Created: {new Date(article.created_at).toLocaleDateString()} • 
              Last updated: {new Date(article.updated_at || article.created_at).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="h-9"
          >
            {saving ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-2"></div>
                Saving...
              </div>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </>
            )}
          </Button>
          <Button
            onClick={() => handleSave('published')}
            disabled={saving}
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-9"
          >
            {saving ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-foreground mr-2"></div>
                Saving...
              </div>
            ) : isEditing ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Update
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Publish
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Article Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title Section */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-medium">Title</Label>
                <Input
                  id="title"
                  value={article.title || ''}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter article title"
                  className="bg-input border-border h-12 text-base px-4"
                />
              </div>

              {/* Excerpt Section */}
              <div className="space-y-2">
                <Label htmlFor="excerpt" className="text-base font-medium">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={article.excerpt || ''}
                  onChange={(e) => setArticle(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Enter a brief description of your article"
                  rows={3}
                  className="bg-input border-border resize-none text-base px-4 py-3"
                />
              </div>

              {/* Content Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content" className="text-base font-medium">Content</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={triggerInlineImageUpload}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-2"></div>
                        Uploading...
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Insert Image
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="border border-border rounded-lg overflow-hidden">
                  <RichTextEditor
                    value={article.content || ''}
                    onChange={(content) => setArticle(prev => ({ ...prev, content }))}
                    placeholder="Write your content here..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Panel */}
        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Tag className="mr-2 h-5 w-5" />
                Article Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="slug" className="text-base font-medium">Slug</Label>
                <Input
                  id="slug"
                  value={article.slug || ''}
                  onChange={(e) => setArticle(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="Enter article slug"
                  className="bg-input border-border h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="featured_image" className="text-base font-medium">Featured Image</Label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      id="featured_image"
                      value={article.featured_image || ''}
                      onChange={(e) => setArticle(prev => ({ ...prev, featured_image: e.target.value }))}
                      placeholder="Enter image URL or upload below"
                      className="bg-input border-border h-10"
                    />
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFeaturedImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={triggerFileInput}
                    disabled={uploading}
                    className="h-10"
                  >
                    {uploading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-2"></div>
                        Uploading...
                      </div>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </>
                    )}
                  </Button>
                </div>
                {article.featured_image && (
                  <div className="mt-3">
                    <img
                      src={article.featured_image}
                      alt="Featured"
                      className="w-full h-40 object-cover rounded-lg border border-border"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-base font-medium">Status</Label>
                <Select
                  value={article.status || 'draft'}
                  onValueChange={(value) => setArticle(prev => ({ ...prev, status: value as any }))}
                >
                  <SelectTrigger className="bg-input border-border h-10">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Preview Card */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="mr-2 h-5 w-5" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-foreground mb-2">
                    {article.title || "Article Title"}
                  </h3>
                  {article.excerpt && (
                    <p className="text-muted-foreground text-sm">
                      {article.excerpt}
                    </p>
                  )}
                </div>
                
                {article.featured_image && (
                  <div className="mt-3">
                    <img
                      src={article.featured_image}
                      alt="Featured"
                      className="w-full h-32 object-cover rounded-lg border border-border"
                    />
                  </div>
                )}
                
                <div className="text-sm text-muted-foreground">
                  {article.content ? (
                    <div 
                      className="prose prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: article.content
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                          .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="my-2 max-w-full h-auto rounded" />')
                          .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-primary">$1</a>')
                          .replace(/\n/g, '<br />')
                      }} 
                    />
                  ) : (
                    <p className="italic">No content yet. Start writing your article...</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => navigate('/admin/articles')}
        >
          Cancel
        </Button>
        <div className="space-x-2">
          {isEditing && (
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleEditor;