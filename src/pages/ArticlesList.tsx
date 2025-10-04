import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  FileText,
  Filter,
  ChevronDown,
  MoreHorizontal,
  Clock,
  CheckCircle,
  EyeOff,
  Hash,
  Tag
} from 'lucide-react';
import { supabase, Article } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ArticlesList = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Extract all unique tags from articles
  const allTags = Array.from(
    new Set(
      articles
        .flatMap(article => article.tags || [])
        .filter(tag => tag && tag.trim() !== '')
    )
  );

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      let query = supabase
        .from('articles')
        .select('*');
        
      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'title':
          query = query.order('title', { ascending: true });
          break;
      }

      const { data, error } = await query;

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error("Failed to load articles.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) return;

    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setArticles(prev => prev.filter(article => article.id !== id));
      toast.success("Article deleted successfully.");
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error("Failed to delete article.");
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (article.excerpt && article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filter === 'all' || article.status === filter;
    
    const matchesTags = selectedTags.length === 0 || 
                       (article.tags && selectedTags.some(tag => article.tags!.includes(tag)));
    
    return matchesSearch && matchesFilter && matchesTags;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate reading time
  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readingTime} min read`;
  };

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Articles</h1>
          <p className="text-base text-muted-foreground mt-1">
            Manage your blog posts and articles
          </p>
        </div>
        
        <Link to="/admin/articles/new">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            New Article
          </Button>
        </Link>
      </div>

      {/* Filters and Search */}
      <Card className="bg-card border-border shadow-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 bg-input border-border focus:border-primary"
              />
            </div>
            
            {/* Status Filter */}
            <Select value={filter} onValueChange={(value) => setFilter(value as any)}>
              <SelectTrigger className="h-10 bg-input border-border">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Published
                  </div>
                </SelectItem>
                <SelectItem value="draft">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                    Draft
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            {/* Sort By */}
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
              <SelectTrigger className="h-10 bg-input border-border">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="title">Title (A-Z)</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Tags Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 w-full">
                  <Tag className="mr-2 h-4 w-4" />
                  Tags
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {allTags.length > 0 ? (
                  allTags.map(tag => (
                    <DropdownMenuItem 
                      key={tag} 
                      onSelect={(e) => e.preventDefault()}
                      className="cursor-pointer"
                    >
                      <div 
                        className="flex items-center w-full"
                        onClick={() => toggleTag(tag)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag)}
                          onChange={() => {}}
                          className="mr-2 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="text-sm">{tag}</span>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>
                    No tags available
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-foreground">{articles.length}</p>
              <p className="text-sm text-muted-foreground">Total Articles</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-green-500">{articles.filter(a => a.status === 'published').length}</p>
              <p className="text-sm text-muted-foreground">Published</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-500">{articles.filter(a => a.status === 'draft').length}</p>
              <p className="text-sm text-muted-foreground">Drafts</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-blue-500">
                {articles.reduce((acc, article) => acc + Math.ceil(article.content.length / 1500), 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Minutes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Articles List */}
      {filteredArticles.length === 0 ? (
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {searchTerm || filter !== 'all' || selectedTags.length > 0 ? 'No articles found' : 'No articles yet'}
              </h3>
              <p className="text-base text-muted-foreground mb-6">
                {searchTerm || filter !== 'all' || selectedTags.length > 0
                  ? 'Try adjusting your search terms or filters.'
                  : 'Get started by creating your first article.'
                }
              </p>
              {!searchTerm && filter === 'all' && selectedTags.length === 0 && (
                <Link to="/admin/articles/new">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Article
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredArticles.map((article) => (
            <Card key={article.id} className="bg-card border-border hover:shadow-md transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold text-foreground hover:text-primary transition-colors">
                        <Link to={`/admin/articles/${article.id}/edit`}>
                          {article.title}
                        </Link>
                      </h3>
                      <Badge 
                        variant={article.status === 'published' ? 'default' : 'secondary'}
                        className={article.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'}
                      >
                        {article.status === 'published' ? (
                          <div className="flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Published
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Draft
                          </div>
                        )}
                      </Badge>
                    </div>
                    
                    {article.excerpt && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {article.excerpt}
                      </p>
                    )}
                    
                    {/* Tags */}
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {article.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Hash className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex flex-wrap items-center text-xs text-muted-foreground mt-3 gap-3">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {formatDate(article.created_at)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        {calculateReadingTime(article.content)}
                      </div>
                      {article.featured_image && (
                        <div className="flex items-center">
                          <Eye className="mr-1 h-3 w-3" />
                          Featured
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {article.status === 'published' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/blog/${article.slug}`, '_blank')}
                        className="text-muted-foreground hover:text-foreground"
                        title="View live"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Link to={`/admin/articles/${article.id}/edit`}>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" title="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" title="More options">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDelete(article.id, article.title)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArticlesList;