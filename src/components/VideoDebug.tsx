import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const VideoDebug = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');

  useEffect(() => {
    fetchAllMedia();
  }, []);

  const fetchAllMedia = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('All media items:', data);
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  const addExternalVideo = async () => {
    if (!newVideoUrl) {
      alert("Please enter a video URL");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('media')
        .insert([{
          url: newVideoUrl,
          title: newVideoTitle || 'Test External Video',
          alt_text: newVideoTitle || 'Test External Video',
          category: 'Test'
        }])
        .select()
        .single();

      if (error) throw error;
      
      console.log('Added test video:', data);
      alert("Video added successfully!");
      setNewVideoUrl('');
      setNewVideoTitle('');
      fetchAllMedia(); // Refresh the list
    } catch (error) {
      console.error('Error adding test video:', error);
      alert("Error adding video: " + error.message);
    }
  };

  const deleteVideo = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;

    try {
      const { error } = await supabase
        .from('media')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      console.log('Deleted video:', id);
      alert("Video deleted successfully!");
      fetchAllMedia(); // Refresh the list
    } catch (error) {
      console.error('Error deleting video:', error);
      alert("Error deleting video: " + error.message);
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
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Video Debug Tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Video Title"
              value={newVideoTitle}
              onChange={(e) => setNewVideoTitle(e.target.value)}
            />
            <Input
              placeholder="Video URL"
              value={newVideoUrl}
              onChange={(e) => setNewVideoUrl(e.target.value)}
            />
          </div>
          <Button onClick={addExternalVideo} className="w-full">
            Add Test Video
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Media Items ({videos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {videos.map((video) => (
              <div key={video.id} className="border p-3 rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{video.title}</h3>
                  <p className="text-sm text-muted-foreground truncate">{video.url}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      Filename: {video.filename || 'None'}
                    </span>
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      Category: {video.category}
                    </span>
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      Created: {new Date(video.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Button 
                  onClick={() => deleteVideo(video.id)} 
                  variant="destructive" 
                  size="sm"
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoDebug;