import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Link as LinkIcon,
  Plus,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';

const SimpleVideoManager = () => {
  const [externalVideoUrl, setExternalVideoUrl] = useState('');
  const [externalVideoTitle, setExternalVideoTitle] = useState('');
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchVideos();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to retry with empty string approach
  const addExternalVideoWithEmptyString = async () => {
    try {
      // Ensure we're still authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Authentication lost. Please refresh the page and log in again.");
        return;
      }

      // Try with empty string for all potentially problematic fields
      const insertData = {
        url: externalVideoUrl,
        title: externalVideoTitle || 'External Video',
        category: 'External Link',
        description: 'External video link',
        filename: '',
        alt_text: ''
      };
      
      const { data, error } = await supabase
        .from('media')
        .insert(insertData)
        .select();

      if (error) {
        console.error('Retry insert error:', error);
        toast.error(`Retry failed: ${error.message}`);
        return;
      }

      if (data && data[0]) {
        setVideos(prev => [data[0], ...prev]);
        toast.success("External video added successfully!");
        setExternalVideoUrl('');
        setExternalVideoTitle('');
      }
    } catch (error: any) {
      console.error('Error in retry:', error);
      toast.error(`Retry failed: ${error.message || 'Unknown error'}`);
    } finally {
      setAdding(false);
    }
  };

  const addExternalVideo = async () => {
    if (!externalVideoUrl) {
      toast.error("Please enter a video URL.");
      return;
    }

    // Validate URL format
    try {
      new URL(externalVideoUrl);
    } catch (e) {
      toast.error("Please enter a valid URL.");
      return;
    }

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("You must be logged in to add videos. Please log in through the admin panel first.");
      return;
    }

    setAdding(true);
    
    try {
      // Simple insert with minimal required data for external videos
      // Using empty string instead of null to avoid constraint violations
      const { data, error } = await supabase
        .from('media')
        .insert({
          url: externalVideoUrl,
          title: externalVideoTitle || 'External Video',
          category: 'External Link',
          filename: '',  // Using empty string instead of null to avoid constraint violations
          description: 'External video link'
        })
        .select();

      if (error) throw error;

      if (data && data[0]) {
        setVideos(prev => [data[0], ...prev]);
        toast.success("External video added successfully!");
        setExternalVideoUrl('');
        setExternalVideoTitle('');
      }
    } catch (error: any) {
      console.error('Error adding video:', error);
      
      // Handle specific errors
      if (error.message.includes('null value in column')) {
        toast.error("Database constraint error: The system will try an alternative approach.");
        // Try again with empty string for all fields
        setTimeout(() => {
          toast.info("Retrying with modified data...");
          addExternalVideoWithEmptyString();
        }, 1000);
        return;
      } else {
        toast.error(`Failed to add video: ${error.message}`);
      }
    } finally {
      setAdding(false);
    }
  };

  const deleteVideo = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;

    try {
      const { error } = await supabase
        .from('media')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setVideos(prev => prev.filter(video => video.id !== id));
      toast.success("Video deleted successfully!");
    } catch (error: any) {
      console.error('Error deleting video:', error);
      toast.error(`Failed to delete video: ${error.message}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertDescription>
            You must be logged in to manage videos. Please log in through the main admin panel at /admin.
          </AlertDescription>
        </Alert>
        <Button 
          onClick={() => window.location.href = '/admin'}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Go to Admin Panel
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Simple Video Manager</h1>
          <p className="text-base text-muted-foreground mt-1">
            Add and manage external video links
          </p>
        </div>
        <Button 
          onClick={fetchVideos} 
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Add Video Section */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">Add External Video</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="video-title" className="text-base font-medium text-foreground">
              Video Title
            </Label>
            <Input
              id="video-title"
              placeholder="Enter video title"
              value={externalVideoTitle}
              onChange={(e) => setExternalVideoTitle(e.target.value)}
              className="h-12 text-base bg-input border-border focus:border-primary"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="video-url" className="text-base font-medium text-foreground">
              Video URL
            </Label>
            <Input
              id="video-url"
              placeholder="https://youtube.com/watch?v=..."
              value={externalVideoUrl}
              onChange={(e) => setExternalVideoUrl(e.target.value)}
              className="h-12 text-base bg-input border-border focus:border-primary"
            />
            <p className="text-sm text-muted-foreground">
              Supports YouTube, Vimeo, Facebook, and other video platforms
            </p>
          </div>

          <Button
            onClick={addExternalVideo}
            disabled={adding || !externalVideoUrl}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {adding ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                Adding...
              </div>
            ) : (
              <>
                <LinkIcon className="mr-2 h-4 w-4" />
                Add External Video
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Videos List */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">Recent Videos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : videos.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No videos added yet. Add your first external video above.
            </p>
          ) : (
            <div className="space-y-4">
              {videos.map((video) => (
                <div key={video.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">
                      {video.title}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {video.url}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                        {video.filename ? 'Uploaded' : 'External'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(video.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteVideo(video.id)}
                    className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleVideoManager;