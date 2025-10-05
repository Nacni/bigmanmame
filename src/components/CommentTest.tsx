import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CommentTest = () => {
  const [testVideoId, setTestVideoId] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState({ name: '', email: '', content: '' });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[${timestamp}] ${message}`);
  };

  const fetchComments = async () => {
    if (!testVideoId) {
      alert("Please enter a video ID");
      return;
    }

    try {
      setLoading(true);
      addLog(`Fetching comments for video ID: ${testVideoId}`);
      
      // Fetch all comments for this video (both approved and unapproved for testing)
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('media_id', testVideoId)
        .order('created_at', { ascending: false });

      if (error) {
        addLog(`Error fetching comments: ${error.message}`);
        console.error('Error fetching comments:', error);
        return;
      }
      
      addLog(`Found ${data?.length || 0} comments`);
      setComments(data || []);
      console.log('Comments data:', data);
    } catch (error: any) {
      addLog(`Exception: ${error.message}`);
      console.error('Exception:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitComment = async () => {
    if (!testVideoId) {
      alert("Please enter a video ID");
      return;
    }

    if (!newComment.name || !newComment.email || !newComment.content) {
      alert("Please fill in all fields");
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newComment.email)) {
      alert("Please enter a valid email address");
      return;
    }

    try {
      setSubmitting(true);
      addLog(`Submitting comment for video ID: ${testVideoId}`);
      
      const commentData = {
        media_id: testVideoId,
        name: newComment.name,
        email: newComment.email,
        content: newComment.content,
        approved: true // Automatically approve for testing
      };
      
      addLog(`Comment data: ${JSON.stringify(commentData)}`);
      
      const { data, error } = await supabase
        .from('comments')
        .insert([commentData])
        .select()
        .single();

      if (error) {
        addLog(`Error submitting comment: ${error.message}`);
        console.error('Error submitting comment:', error);
        alert(`Error: ${error.message}`);
        return;
      }
      
      addLog(`Comment submitted successfully! ID: ${data.id}`);
      alert("Comment submitted successfully!");
      
      // Reset form
      setNewComment({ name: '', email: '', content: '' });
      
      // Refresh comments
      fetchComments();
    } catch (error: any) {
      addLog(`Exception: ${error.message}`);
      console.error('Exception:', error);
      alert(`Exception: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      addLog(`Deleting comment ID: ${commentId}`);
      
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        addLog(`Error deleting comment: ${error.message}`);
        console.error('Error deleting comment:', error);
        alert(`Error: ${error.message}`);
        return;
      }
      
      addLog(`Comment deleted successfully!`);
      alert("Comment deleted successfully!");
      
      // Refresh comments
      fetchComments();
    } catch (error: any) {
      addLog(`Exception: ${error.message}`);
      console.error('Exception:', error);
      alert(`Exception: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Comment Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Video ID</label>
            <Input
              value={testVideoId}
              onChange={(e) => setTestVideoId(e.target.value)}
              placeholder="Enter video ID"
            />
            <p className="text-xs text-muted-foreground">
              You can find video IDs in the Supabase dashboard or by checking the video URLs
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={fetchComments} disabled={loading}>
              {loading ? 'Loading...' : 'Fetch Comments'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submit New Comment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={newComment.name}
                onChange={(e) => setNewComment({...newComment, name: e.target.value})}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={newComment.email}
                onChange={(e) => setNewComment({...newComment, email: e.target.value})}
                placeholder="your@email.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Comment</label>
            <Textarea
              value={newComment.content}
              onChange={(e) => setNewComment({...newComment, content: e.target.value})}
              placeholder="Write your comment..."
              rows={3}
            />
          </div>
          <Button onClick={submitComment} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Comment'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comments ({comments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No comments found. Fetch comments or submit a new one.
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{comment.name}</h3>
                      <p className="text-sm text-muted-foreground">{comment.email}</p>
                      <p className="text-sm mt-2">{comment.content}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                      <span className="text-xs px-2 py-1 rounded bg-muted">
                        {comment.approved ? 'Approved' : 'Pending'}
                      </span>
                      <Button 
                        onClick={() => deleteComment(comment.id)} 
                        variant="destructive" 
                        size="sm"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 max-h-64 overflow-y-auto text-sm font-mono bg-muted p-3 rounded">
            {logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
            {logs.length === 0 && (
              <p className="text-muted-foreground text-center">
                No logs yet. Perform actions to see logs.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommentTest;