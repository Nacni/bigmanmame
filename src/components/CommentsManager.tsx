import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, X, Trash2, User, Mail, MessageSquare } from 'lucide-react';
import { supabase, Comment } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface CommentsManagerProps {
  articleId?: string;
}

const CommentsManager = ({ articleId }: CommentsManagerProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const fetchComments = async () => {
    try {
      let query = supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false });

      if (articleId) {
        query = query.eq('article_id', articleId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Comments Management</h3>
        <Badge variant="secondary">{comments.length} comments</Badge>
      </div>

      {comments.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h4 className="text-lg font-medium text-foreground mb-2">No comments yet</h4>
            <p className="text-muted-foreground">
              {articleId 
                ? "This article doesn't have any comments yet." 
                : "There are no comments on any articles."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id} className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center">
                    <div className="bg-primary/10 rounded-full p-2 mr-3">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{comment.name}</h4>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="h-3 w-3 mr-1" />
                        {comment.email}
                      </div>
                    </div>
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
              <CardContent className="pt-0">
                <p className="text-foreground mb-4">{comment.content}</p>
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

export default CommentsManager;