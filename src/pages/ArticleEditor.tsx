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
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import RichTextEditor from '@/components/RichTextEditor';
import CommentsManager from '@/components/CommentsManager';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { toast, t } = useToast();
  const { t: translate } = useLanguage();
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
    if (!isEditing || !window.confirm(translate('admin.confirmDelete'))) return;

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
          <Link to="/admin/articles">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {translate('admin.articles')}
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">
            {isEditing ? translate('admin.editArticle') : translate('admin.createArticle')}
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
                {translate('common.loading')}
              </div>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {translate('admin.saveDraft')}
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
                {translate('common.loading')}
              </div>
            ) : isEditing ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                {translate('admin.update')}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {translate('admin.publish')}
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

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="content">{translate('admin.content')}</TabsTrigger>
          <TabsTrigger value="preview">{translate('admin.preview')}</TabsTrigger>
        </TabsList>
        <TabsContent value="content" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>{translate('admin.articleDetails')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="title">{translate('admin.title')}</Label>
                <Input
                  id="title"
                  value={article.title || ''}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder={translate('admin.enterTitle')}
                  className="bg-input border-border"
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="slug">{translate('admin.slug')}</Label>
                <Input
                  id="slug"
                  value={article.slug || ''}
                  onChange={(e) => setArticle(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder={translate('admin.enterSlug')}
                  className="bg-input border-border"
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="excerpt">{translate('admin.excerpt')}</Label>
                <Input
                  id="excerpt"
                  value={article.excerpt || ''}
                  onChange={(e) => setArticle(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder={translate('admin.enterExcerpt')}
                  className="bg-input border-border"
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="featured_image">{translate('admin.featuredImage')}</Label>
                <div className="flex items-end space-x-4">
                  <div className="flex-1">
                    <Input
                      id="featured_image"
                      value={article.featured_image || ''}
                      onChange={(e) => setArticle(prev => ({ ...prev, featured_image: e.target.value }))}
                      placeholder={translate('admin.enterImageUrl')}
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
                        {translate('common.loading')}
                      </div>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        {translate('admin.uploadImage')}
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
                <Label htmlFor="status">{translate('admin.status')}</Label>
                <Select
                  value={article.status || 'draft'}
                  onValueChange={(value) => setArticle(prev => ({ ...prev, status: value as any }))}
                >
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder={translate('admin.selectStatus')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">{translate('admin.draft')}</SelectItem>
                    <SelectItem value="published">{translate('admin.published')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label htmlFor="content">{translate('admin.content')}</Label>
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
                        {translate('common.loading')}
                      </div>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        {translate('admin.insertImage')}
                      </>
                    )}
                  </Button>
                </div>
                <RichTextEditor
                  value={article.content || ''}
                  onChange={(content) => setArticle(prev => ({ ...prev, content }))}
                  placeholder={translate('admin.writeContent')}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/articles')}
            >
              {translate('admin.cancel')}
            </Button>
            <div className="space-x-2">
              {isEditing && (
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {translate('admin.delete')}
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
                    {translate('common.loading')}
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {translate('admin.saveDraft')}
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
                    {translate('common.loading')}
                  </div>
                ) : isEditing ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {translate('admin.update')}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {translate('admin.publish')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="preview">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>{translate('admin.preview')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-lg max-w-none">
                <h1 className="text-3xl font-bold text-foreground">{article.title}</h1>
                {article.excerpt && (
                  <p className="text-xl text-muted-foreground">{article.excerpt}</p>
                )}
                {article.featured_image && (
                  <img
                    src={article.featured_image}
                    alt={article.title}
                    className="w-full h-auto rounded-lg my-6"
                  />
                )}
                <div 
                  className="space-y-4 text-foreground"
                  dangerouslySetInnerHTML={{ 
                    __html: article.content?.replace(/\n/g, '<br />') || '' 
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ArticleEditor;