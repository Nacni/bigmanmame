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
  MoreHorizontal
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

const ArticlesList = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      let query = supabase
        .from('articles')
        .select('*');
        
      // Apply sorting
      if (sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: true });
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
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

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
                         article.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || article.status === filter;
    return matchesSearch && matchesFilter;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            New Article
          </Button>
        </Link>
      </div>

      {/* Filters and Search */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 bg-input border-border focus:border-primary"
              />
            </div>
            
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-10">
                    <Filter className="mr-2 h-4 w-4" />
                    Status
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilter('all')}>
                    All Articles
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('published')}>
                    Published
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('draft')}>
                    Drafts
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-10">
                    <Calendar className="mr-2 h-4 w-4" />
                    Sort
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortBy('newest')}>
                    Newest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('oldest')}>
                    Oldest First
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex gap-4 mt-4 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{articles.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{articles.filter(a => a.status === 'published').length}</p>
              <p className="text-sm text-muted-foreground">Published</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-500">{articles.filter(a => a.status === 'draft').length}</p>
              <p className="text-sm text-muted-foreground">Drafts</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Articles List */}
      {filteredArticles.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {searchTerm ? 'No articles found' : 'No articles yet'}
              </h3>
              <p className="text-base text-muted-foreground mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms or filters.'
                  : 'Get started by creating your first article.'
                }
              </p>
              {!searchTerm && (
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
        <div className="space-y-4">
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
                        {article.status}
                      </Badge>
                    </div>
                    
                    {article.excerpt && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {article.excerpt}
                      </p>
                    )}
                    
                    <div className="flex items-center text-xs text-muted-foreground mt-3">
                      <div className="flex items-center mr-4">
                        <Calendar className="mr-1 h-3 w-3" />
                        {formatDate(article.created_at)}
                      </div>
                      <div>
                        {Math.ceil(article.content.length / 1500)} min read
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {article.status === 'published' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/blog/${article.slug}`, '_blank')}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Link to={`/admin/articles/${article.id}/edit`}>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
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