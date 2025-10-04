import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

const VideoTest = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('All media items:', data);
      
      // Filter only video files - include external videos (those without filename)
      const videoFiles = (data || []).filter(item => 
        item.filename?.match(/\.(mp4|avi|mov|wmv|flv|webm)$/i) || 
        !item.filename // Include all items without filename (external videos)
      );
      
      console.log('Filtered video files:', videoFiles);
      
      setVideos(videoFiles);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTestVideo = async () => {
    try {
      const { data, error } = await supabase
        .from('media')
        .insert([{
          url: 'https://example.com/test-video.mp4',
          title: 'Test Video',
          alt_text: 'Test Video',
          category: 'Test'
        }])
        .select()
        .single();

      if (error) throw error;
      
      console.log('Added test video:', data);
      fetchVideos(); // Refresh the list
    } catch (error) {
      console.error('Error adding test video:', error);
    }
  };

  const deleteVideo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('media')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      console.log('Deleted video:', id);
      fetchVideos(); // Refresh the list
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Video Test Component</h1>
      <Button onClick={addTestVideo} className="mb-4">Add Test Video</Button>
      <div>
        <h2 className="text-xl font-semibold mb-2">Videos ({videos.length})</h2>
        {videos.map((video) => (
          <div key={video.id} className="border p-2 mb-2 flex justify-between">
            <div>
              <h3 className="font-medium">{video.title}</h3>
              <p className="text-sm text-gray-500">{video.url}</p>
              <p className="text-sm">Filename: {video.filename || 'None (external)'}</p>
            </div>
            <Button onClick={() => deleteVideo(video.id)} variant="destructive" size="sm">
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoTest;