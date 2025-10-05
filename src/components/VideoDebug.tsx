import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const VideoDebug = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    fetchAllMedia();
  }, []);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const fetchAllMedia = async () => {
    try {
      setLoading(true);
      addLog("Fetching all media from database...");
      
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        addLog(`Error fetching media: ${error.message}`);
        throw error;
      }
      
      addLog(`Successfully fetched ${data?.length || 0} media items`);
      console.log('All media items:', data);
      setVideos(data || []);
    } catch (error: any) {
      console.error('Error fetching media:', error);
      addLog(`Exception: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addExternalVideo = async () => {
    if (!newVideoUrl) {
      alert("Please enter a video URL");
      return;
    }

    // Validate URL format
    try {
      new URL(newVideoUrl);
    } catch (e) {
      alert("Please enter a valid URL");
      return;
    }

    try {
      addLog(`Adding external video: ${newVideoTitle || 'Untitled'} - ${newVideoUrl}`);
      
      const videoData = {
        url: newVideoUrl,
        title: newVideoTitle || 'Test External Video',
        alt_text: newVideoTitle || 'Test External Video'
        // Removed category to avoid schema cache issue
      };
      
      addLog(`Inserting data: ${JSON.stringify(videoData)}`);
      
      // Try to insert without category field
      let result = await supabase
        .from('media')
        .insert([videoData])
        .select()
        .single();

      // If it's a schema cache error, try again with a different approach
      if (result.error && result.error.message.includes('schema cache')) {
        addLog("Schema cache issue detected. Trying to refresh...");
        // Try to refresh the schema cache
        await supabase.from('media').select('id').limit(1);
        // Retry the insert
        result = await supabase
          .from('media')
          .insert([videoData])
          .select()
          .single();
      }

      if (result.error) {
        addLog(`Database error: ${result.error.message}`);
        console.error('Database error:', result.error);
        alert(`Database error: ${result.error.message}`);
        return;
      }
      
      addLog(`Successfully added video with ID: ${result.data.id}`);
      console.log('Added test video:', result.data);
      alert("Video added successfully!");
      setNewVideoUrl('');
      setNewVideoTitle('');
      fetchAllMedia(); // Refresh the list
    } catch (error: any) {
      console.error('Error adding test video:', error);
      addLog(`Exception: ${error.message}`);
      alert(`Error adding video: ${error.message || 'Unknown error'}`);
    }
  };

  const deleteVideo = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      addLog(`Deleting video with ID: ${id}`);
      
      const { error } = await supabase
        .from('media')
        .delete()
        .eq('id', id);

      if (error) {
        addLog(`Database error: ${error.message}`);
        console.error('Database error:', error);
        alert(`Database error: ${error.message}`);
        return;
      }
      
      addLog(`Successfully deleted video with ID: ${id}`);
      console.log('Deleted video:', id);
      alert("Video deleted successfully!");
      fetchAllMedia(); // Refresh the list
    } catch (error: any) {
      console.error('Error deleting video:', error);
      addLog(`Exception: ${error.message}`);
      alert(`Error deleting video: ${error.message || 'Unknown error'}`);
    }
  };

  const testAuthStatus = async () => {
    try {
      addLog("Checking authentication status...");
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        addLog(`Auth error: ${authError.message}`);
        alert(`Auth error: ${authError.message}`);
        return;
      }
      
      if (!user) {
        addLog("No user is currently authenticated");
        alert("No user is currently authenticated");
        return;
      }
      
      addLog(`User authenticated: ${user.email} (ID: ${user.id})`);
      
      // Test RLS by trying to insert with authenticated user
      const testRecord = {
        url: 'https://example.com/auth-test.mp4',
        title: 'Auth Test Video'
      };
      
      addLog(`Testing insert with authenticated user: ${JSON.stringify(testRecord)}`);
      
      const { data: insertData, error: insertError } = await supabase
        .from('media')
        .insert([testRecord])
        .select()
        .single();

      if (insertError) {
        addLog(`Authenticated insert failed: ${insertError.message}`);
        alert(`Authenticated insert failed: ${insertError.message}`);
        return;
      }
      
      addLog(`Authenticated insert successful. New record ID: ${insertData.id}`);
      
      // Clean up
      const { error: deleteError } = await supabase
        .from('media')
        .delete()
        .eq('id', insertData.id);

      if (deleteError) {
        addLog(`Cleanup failed: ${deleteError.message}`);
      } else {
        addLog(`Cleanup successful. Record ${insertData.id} deleted`);
      }
      
      alert("Authentication test passed!");
    } catch (error: any) {
      console.error('Auth test error:', error);
      addLog(`Auth test exception: ${error.message}`);
      alert(`Auth test failed: ${error.message || 'Unknown error'}`);
    }
  };

  const testSchema = async () => {
    try {
      addLog("Checking database schema...");
      
      // Get table info
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .limit(1);
        
      if (error) {
        addLog(`Schema check failed: ${error.message}`);
        alert(`Schema check failed: ${error.message}`);
        return;
      }
      
      if (data && data.length > 0) {
        const columns = Object.keys(data[0]);
        addLog(`Table columns: ${columns.join(', ')}`);
        alert(`Table columns: ${columns.join(', ')}`);
        console.log('Table data sample:', data[0]);
      } else {
        addLog('Table is empty');
        alert('Table is empty');
      }
    } catch (error: any) {
      console.error('Schema test error:', error);
      addLog(`Schema test exception: ${error.message}`);
      alert(`Schema test failed: ${error.message || 'Unknown error'}`);
    }
  };

  const testDatabaseConnection = async () => {
    try {
      addLog("Testing database connection...");
      
      // Test 1: Simple select query
      const { data: selectData, error: selectError } = await supabase
        .from('media')
        .select('id')
        .limit(1);

      if (selectError) {
        addLog(`Select test failed: ${selectError.message}`);
        alert(`Select test failed: ${selectError.message}`);
        return;
      }
      
      addLog(`Select test successful. Found ${selectData?.length || 0} records`);
      
      // Test 2: Insert test
      const testRecord = {
        url: 'https://example.com/test.mp4',
        title: 'Connection Test Video'
      };
      
      addLog(`Insert test: ${JSON.stringify(testRecord)}`);
      
      const { data: insertData, error: insertError } = await supabase
        .from('media')
        .insert([testRecord])
        .select()
        .single();

      if (insertError) {
        addLog(`Insert test failed: ${insertError.message}`);
        alert(`Insert test failed: ${insertError.message}`);
        return;
      }
      
      addLog(`Insert test successful. New record ID: ${insertData.id}`);
      
      // Test 3: Delete test
      const { error: deleteError } = await supabase
        .from('media')
        .delete()
        .eq('id', insertData.id);

      if (deleteError) {
        addLog(`Delete test failed: ${deleteError.message}`);
        alert(`Delete test failed: ${deleteError.message}`);
        return;
      }
      
      addLog(`Delete test successful. Record ${insertData.id} deleted`);
      
      addLog("All database tests passed!");
      alert("All database tests passed!");
      
      // Refresh the media list
      fetchAllMedia();
    } catch (error: any) {
      console.error('Connection test error:', error);
      addLog(`Connection test exception: ${error.message}`);
      alert(`Connection test failed: ${error.message || 'Unknown error'}`);
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
            <div className="space-y-2">
              <Label htmlFor="video-title">Video Title</Label>
              <Input
                id="video-title"
                placeholder="Video Title"
                value={newVideoTitle}
                onChange={(e) => setNewVideoTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="video-url">Video URL</Label>
              <Input
                id="video-url"
                placeholder="https://example.com/video.mp4"
                value={newVideoUrl}
                onChange={(e) => setNewVideoUrl(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={addExternalVideo} className="flex-1">
              Add Test Video
            </Button>
            <Button onClick={testDatabaseConnection} variant="outline">
              Test DB Connection
            </Button>
            <Button onClick={testAuthStatus} variant="outline">
              Test Auth
            </Button>
            <Button onClick={testSchema} variant="outline">
              Check Schema
            </Button>
          </div>
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
                  <div className="flex flex-wrap gap-2 mt-1">
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
                  onClick={() => deleteVideo(video.id, video.title)} 
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

      <Card>
        <CardHeader>
          <CardTitle>Debug Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto bg-muted p-3 rounded">
            {logs.map((log, index) => (
              <div key={index} className="text-sm font-mono">
                {log}
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-muted-foreground text-center">
                No logs yet. Perform an action to see logs.
              </div>
            )}
          </div>
          <Button 
            onClick={() => setLogs([])} 
            variant="outline" 
            size="sm" 
            className="mt-2"
          >
            Clear Logs
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoDebug;