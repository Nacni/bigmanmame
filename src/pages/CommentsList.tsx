import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, X, Trash2 } from 'lucide-react';
import { supabase, Comment, Article } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const CommentsList = () => {
  const [comments, setComments] = useState<(Comment & { article_title?: string })[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
    fetchArticles();
  }, []);

  const fetchComments = async () => {
    try {
      let query = supabase
        .from('comments')
        .select('*, articles(title)')
        .order('created_at', { ascending: false });

      if (filter === 'pending') {
        query = query.eq('approved', false);
      } else if (filter === 'approved') {
        query = query.eq('approved', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Map comments with article titles
      const commentsWithTitles = data?.map(comment => ({
        ...comment,
        article_title: comment.articles?.title || 'Unknown Article'
      })) || [];

      setComments(commentsWithTitles);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments');
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

      toast({
        title: "Success!",
        description: "Comment approved successfully.",
      });
    } catch (error) {
      console.error('Error approving comment:', error);
      toast({
        title: "Error",
        description: "Failed to approve comment.",
        variant: "destructive",
      });
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

      toast({
        title: "Success!",
        description: "Comment rejected successfully.",
      });
    } catch (error) {
      console.error('Error rejecting comment:', error);
      toast({
        title: "Error",
        description: "Failed to reject comment.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      setComments(prev => prev.filter(comment => comment.id !== commentId));

      toast({
        title: "Deleted",
        description: "Comment deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment.",
        variant: "destructive",
      });
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

  const filteredComments = comments.filter(comment => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !comment.approved;
    if (filter === 'approved') return comment.approved;
    return true;
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/admin')}
            className="text-base"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Comments Management</h1>
            <p className="text-muted-foreground">Manage all comments on your articles</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Select value={filter} onValueChange={(value: 'all' | 'pending' | 'approved') => setFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Comments</SelectItem>
              <SelectItem value="pending">Pending Approval</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Comments</p>
                <p className="text-2xl font-bold text-foreground">{comments.length}</p>
              </div>
              <Badge variant="secondary" className="text-lg">All</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
                <p className="text-2xl font-bold text-foreground">
                  {comments.filter(c => !c.approved).length}
                </p>
              </div>
              <Badge variant="secondary" className="text-lg">Pending</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-foreground">
                  {comments.filter(c => c.approved).length}
                </p>
              </div>
              <Badge variant="default" className="text-lg">Approved</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comments List */}
      {filteredComments.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center">
            <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              {filter === 'all' ? 'No comments yet' : 
               filter === 'pending' ? 'No pending comments' : 
               'No approved comments'}
            </h3>
            <p className="text-muted-foreground">
              {filter === 'all' ? 'There are no comments on any articles.' : 
               filter === 'pending' ? 'All comments are approved.' : 
               'No comments have been approved yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredComments.map((comment) => (
            <Card key={comment.id} className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-medium text-foreground">{comment.name}</h3>
                    <p className="text-sm text-muted-foreground">{comment.email}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={comment.approved ? "default" : "secondary"}
                      className={comment.approved ? "bg-green-500" : ""}
                    >
                      {comment.approved ? "Approved" : "Pending"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-1">On article: {comment.article_title}</p>
                  <p className="text-foreground">{comment.content}</p>
                </div>
                <div className="flex items-center justify-end space-x-2">
                  {!comment.approved ? (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleApprove(comment.id)}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleReject(comment.id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(comment.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentsList;