import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const VideoTest = () => {
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [testUrl, setTestUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [testTitle, setTestTitle] = useState('Test Video');
  const [result, setResult] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[${timestamp}] ${message}`);
  };

  const checkAuth = async () => {
    try {
      addLog('Checking authentication status...');
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        addLog(`Auth error: ${error.message}`);
        setResult(`Auth error: ${error.message}`);
        return;
      }
      
      if (!user) {
        addLog('No user authenticated');
        setResult('No user authenticated. Please log in first.');
        return;
      }
      
      setUser(user);
      setAuthChecked(true);
      addLog(`Authenticated as: ${user.email}`);
      setResult(`Authenticated as: ${user.email}`);
    } catch (error: any) {
      addLog(`Auth check failed: ${error.message}`);
      setResult(`Auth check failed: ${error.message}`);
    }
  };

  const testInsert = async () => {
    if (!authChecked || !user) {
      setResult('Please check authentication first');
      return;
    }

    try {
      addLog('Testing video insert...');
      setResult('Testing video insert...');
      
      const videoData = {
        url: testUrl,
        title: testTitle,
        alt_text: testTitle,
        category: 'Test'
      };
      
      addLog(`Inserting: ${JSON.stringify(videoData)}`);
      
      const { data, error } = await supabase
        .from('media')
        .insert([videoData])
        .select()
        .single();

      if (error) {
        addLog(`Insert failed: ${error.message}`);
        addLog(`Error details: ${JSON.stringify(error)}`);
        setResult(`Insert failed: ${error.message}`);
        return;
      }
      
      addLog(`Insert successful! ID: ${data.id}`);
      setResult(`Insert successful! ID: ${data.id}`);
      
      // Test deletion to clean up
      addLog('Testing deletion...');
      const { error: deleteError } = await supabase
        .from('media')
        .delete()
        .eq('id', data.id);
        
      if (deleteError) {
        addLog(`Delete failed: ${deleteError.message}`);
      } else {
        addLog('Delete successful');
      }
    } catch (error: any) {
      addLog(`Exception: ${error.message}`);
      setResult(`Exception: ${error.message}`);
    }
  };

  const testSelect = async () => {
    try {
      addLog('Testing select query...');
      setResult('Testing select query...');
      
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .limit(5);
        
      if (error) {
        addLog(`Select failed: ${error.message}`);
        setResult(`Select failed: ${error.message}`);
        return;
      }
      
      addLog(`Select successful! Found ${data.length} records`);
      setResult(`Select successful! Found ${data.length} records`);
      console.log('Select data:', data);
    } catch (error: any) {
      addLog(`Exception: ${error.message}`);
      setResult(`Exception: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Video Insert Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="test-title">Video Title</Label>
              <Input
                id="test-title"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                placeholder="Test Video"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-url">Video URL</Label>
              <Input
                id="test-url"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="https://example.com/video.mp4"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button onClick={checkAuth}>Check Auth</Button>
            <Button onClick={testInsert} disabled={!authChecked}>Test Insert</Button>
            <Button onClick={testSelect} variant="outline">Test Select</Button>
          </div>
          
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2">Result:</h3>
            <p className="text-sm">{result}</p>
          </div>
          
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2">Logs:</h3>
            <div className="space-y-1 max-h-64 overflow-y-auto text-sm font-mono">
              {logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
            </div>
            {logs.length === 0 && (
              <p className="text-muted-foreground text-sm">No logs yet. Run a test to see logs.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoTest;