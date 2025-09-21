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
        
        toast({
          title: "Success!",
          description: "Image uploaded and inserted successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image.",
        variant: "destructive",
      });
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
        title: "Success!",
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" onClick={() => navigate('/admin/articles')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Articles
          </Button>
          <h1 className="text-3xl font-bold text-foreground">
            {isEditing ? 'Edit Article' : 'Create Article'}
          </h1>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => handleSave('draft')}
            disabled={saving}
          >
            {saving ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
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
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {saving ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
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

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Article Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={article.title || ''}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter article title"
              className="bg-input border-border"
            />
          </div>

          <div className="space-y-4">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={article.slug || ''}
              onChange={(e) => setArticle(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="Enter article slug"
              className="bg-input border-border"
            />
          </div>

          <div className="space-y-4">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Input
              id="excerpt"
              value={article.excerpt || ''}
              onChange={(e) => setArticle(prev => ({ ...prev, excerpt: e.target.value }))}
              placeholder="Enter article excerpt"
              className="bg-input border-border"
            />
          </div>

          <div className="space-y-4">
            <Label htmlFor="featured_image">Featured Image</Label>
            <div className="flex items-end space-x-4">
              <div className="flex-1">
                <Input
                  id="featured_image"
                  value={article.featured_image || ''}
                  onChange={(e) => setArticle(prev => ({ ...prev, featured_image: e.target.value }))}
                  placeholder="Enter image URL"
                  className="bg-input border-border"
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
              >
                {uploading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
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
              <div className="mt-4">
                <img
                  src={article.featured_image}
                  alt="Featured"
                  className="w-full h-48 object-cover rounded-lg border border-border"
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Label htmlFor="status">Status</Label>
            <Select
              value={article.status || 'draft'}
              onValueChange={(value) => setArticle(prev => ({ ...prev, status: value as any }))}
            >
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label htmlFor="content">Content</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={triggerInlineImageUpload}
                disabled={uploading}
              >
                {uploading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    Uploading...
                  </div>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Insert Image
                  </>
                )}
              </Button>
            </div>
            <RichTextEditor
              value={article.content || ''}
              onChange={(content) => setArticle(prev => ({ ...prev, content }))}
              placeholder="Write your content here..."
            />
          </div>
        </CardContent>
      </Card>

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
          <Button
            variant="outline"
            onClick={() => handleSave('draft')}
            disabled={saving}
          >
            {saving ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
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
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {saving ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
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
    </div>
  );
};

export default ArticleEditor;