import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { Link, Play, Upload } from 'lucide-react';

const VideoTest = () => {
  const [externalVideoUrl, setExternalVideoUrl] = useState('');
  const [externalVideoTitle, setExternalVideoTitle] = useState('');
  const [uploading, setUploading] = useState(false);

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

    setUploading(true);
    
    try {
      console.log('Adding external video with test approach');
      
      // Try the insert operation
      const insertData = {
        url: externalVideoUrl,
        title: externalVideoTitle || 'External Video',
        category: 'External',
        description: '', // Add empty description as default
        filename: null // Explicitly set filename to null for external videos
      };
      
      console.log('Inserting data:', insertData);
      
      const { data, error } = await supabase
        .from('media')
        .insert(insertData)
        .select();

      if (error) {
        console.error('Insert error:', error);
        toast.error(`Failed to add external video: ${error.message}`);
        return;
      }

      console.log('Successfully added external video:', data);
      
      if (data && data[0]) {
        toast.success("External video added successfully.");
        setExternalVideoUrl('');
        setExternalVideoTitle('');
      }
    } catch (error: any) {
      console.error('Error adding external video:', error);
      toast.error(`Failed to add external video: ${error.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-4">Video Test Page</h1>
          <p className="text-muted-foreground">
            Test the external video upload functionality to verify it's working correctly
          </p>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Link className="mr-2 h-5 w-5" />
              Add External Video
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="video-title">Video Title</Label>
              <Input
                id="video-title"
                placeholder="Enter video title"
                value={externalVideoTitle}
                onChange={(e) => setExternalVideoTitle(e.target.value)}
                className="bg-input border-border"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="video-url">Video URL</Label>
              <Input
                id="video-url"
                placeholder="https://example.com/video.mp4"
                value={externalVideoUrl}
                onChange={(e) => setExternalVideoUrl(e.target.value)}
                className="bg-input border-border"
              />
              <p className="text-sm text-muted-foreground">
                Supports any video URL (YouTube, Vimeo, direct links, etc.)
              </p>
            </div>

            <Button
              onClick={addExternalVideo}
              disabled={uploading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {uploading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                  Adding Video...
                </div>
              ) : (
                <>
                  <Link className="mr-2 h-4 w-4" />
                  Add External Video
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VideoTest;
