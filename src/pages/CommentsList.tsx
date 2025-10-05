import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, X, Trash2, Filter, ChevronDown, Search, Calendar, User, Mail, MessageSquare } from 'lucide-react';
import { supabase, Comment } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';

// Define a simplified article type for the dropdown
interface SimpleArticle {
  id: string;
  title: string;
}

const CommentsList = () => {
  const [comments, setComments] = useState<(Comment & { article_title?: string })[]>([]);
  const [articles, setArticles] = useState<SimpleArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'name'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const navigate = useNavigate();

  useEffect(() => {
    fetchComments();
    fetchArticles();
  }, []);

  const fetchComments = async () => {
    try {
      // Fetch comments for both articles and videos
      const { data: articleComments, error: articleError } = await supabase
        .from('comments')
        .select('*, articles(title)')
        .not('article_id', 'is', null)
        .order('created_at', { ascending: false });

      if (articleError) throw articleError;

      const { data: videoComments, error: videoError } = await supabase
        .from('comments')
        .select('*, media(title, filename)')
        .not('media_id', 'is', null)
        .order('created_at', { ascending: false });

      if (videoError) throw videoError;

      // Combine and map comments
      const allComments = [
        ...(articleComments?.map(comment => ({
          ...comment,
          article_title: comment.articles?.title || 'Unknown Article',
          comment_type: 'article'
        })) || []),
        ...(videoComments?.map(comment => ({
          ...comment,
          article_title: comment.media?.title || comment.media?.filename || 'Unknown Video',
          comment_type: 'video'
        })) || [])
      ];

      setComments(allComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments');
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('id, title')
        .order('title');

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const handleApprove = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ approved: true })
        .eq('id', commentId);

      if (error) throw error;

      setComments(prev => 
        prev.map(comment => 
          comment.id === commentId 
            ? { ...comment, approved: true } 
            : comment
        )
      );

      toast.success("Comment approved successfully.");
    } catch (error) {
      console.error('Error approving comment:', error);
      toast.error("Failed to approve comment.");
    }
  };

  const handleReject = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ approved: false })
        .eq('id', commentId);

      if (error) throw error;

      setComments(prev => 
        prev.map(comment => 
          comment.id === commentId 
            ? { ...comment, approved: false } 
            : comment
        )
      );

      toast.success("Comment rejected successfully.");
    } catch (error) {
      console.error('Error rejecting comment:', error);
      toast.error("Failed to reject comment.");
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      setComments(prev => prev.filter(comment => comment.id !== commentId));
      toast.success("Comment deleted successfully.");
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error("Failed to delete comment.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter and sort comments
  const processedComments = comments
    .filter(comment => {
      // Apply status filter
      if (filter === 'pending') return !comment.approved;
      if (filter === 'approved') return comment.approved;
      return true;
    })
    .filter(comment => {
      // Apply search filter
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        comment.name.toLowerCase().includes(searchLower) ||
        comment.email.toLowerCase().includes(searchLower) ||
        comment.content.toLowerCase().includes(searchLower) ||
        (comment.article_title && comment.article_title.toLowerCase().includes(searchLower))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'created_at') {
        return sortOrder === 'asc' 
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/dashboard')}
            className="text-base"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Comments Management</h1>
            <p className="text-muted-foreground">Manage all comments on your articles and videos</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="text-base">
                <Filter className="mr-2 h-4 w-4" />
                Filter
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilter('all')}>
                All Comments
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('pending')}>
                <X className="mr-2 h-4 w-4 text-red-500" />
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('approved')}>
                <Check className="mr-2 h-4 w-4 text-green-500" />
                Approved
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search comments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 bg-input border-border"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={(value: 'created_at' | 'name') => setSortBy(value)}>
                <SelectTrigger className="w-32 h-10 bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="h-10"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Comments</p>
                <p className="text-2xl font-bold text-foreground">{comments.length}</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-red-500">
                  {comments.filter(c => !c.approved).length}
                </p>
              </div>
              <div className="bg-red-500/10 p-3 rounded-full">
                <X className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-500">
                  {comments.filter(c => c.approved).length}
                </p>
              </div>
              <div className="bg-green-500/10 p-3 rounded-full">
                <Check className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comments Table */}
      {processedComments.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchTerm || filter !== 'all' ? 'No comments found' : 'No comments yet'}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Comments from your articles and videos will appear here.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/4">Author</TableHead>
                  <TableHead className="w-1/4">Content</TableHead>
                  <TableHead className="w-1/4">Related To</TableHead>
                  <TableHead className="w-1/6">Date</TableHead>
                  <TableHead className="w-1/6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedComments.map((comment) => (
                  <TableRow key={comment.id} className="border-border">
                    <TableCell>
                      <div className="font-medium">{comment.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center mt-1">
                        <Mail className="h-3 w-3 mr-1" />
                        {comment.email}
                      </div>
                      <Badge variant={comment.approved ? 'default' : 'secondary'} className="mt-2">
                        {comment.approved ? 'Approved' : 'Pending'}
                      </Badge>
                      <Badge variant="outline" className="mt-1 mr-1">
                        {comment.comment_type === 'article' ? 'Article' : 'Video'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-foreground line-clamp-3">
                        {comment.content}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">{comment.article_title}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(comment.created_at)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        {!comment.approved ? (
                          <Button
                            onClick={() => handleApprove(comment.id)}
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 h-8"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleReject(comment.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 h-8"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          onClick={() => handleDelete(comment.id)}
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive-foreground h-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CommentsList;