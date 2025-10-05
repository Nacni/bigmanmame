import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SchemaTest = () => {
  const [result, setResult] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [testUrl, setTestUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [testTitle, setTestTitle] = useState('Schema Test Video');

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[${timestamp}] ${message}`);
  };

  const testMinimalInsert = async () => {
    try {
      addLog('Testing minimal insert with only url and title...');
      setResult('Testing minimal insert...');
      
      // First, let's see what columns actually exist
      addLog('Checking existing columns...');
      const { data: sampleData, error: sampleError } = await supabase
        .from('media')
        .select('*')
        .limit(1);
        
      if (sampleError) {
        addLog(`Sample query failed: ${sampleError.message}`);
      } else if (sampleData && sampleData.length > 0) {
        const columns = Object.keys(sampleData[0]);
        addLog(`Existing columns: ${columns.join(', ')}`);
      } else {
        addLog('Table appears to be empty');
      }
      
      // Now try the minimal insert
      const minimalData = {
        url: testUrl,
        title: testTitle
      };
      
      addLog(`Attempting insert with: ${JSON.stringify(minimalData)}`);
      
      const { data, error } = await supabase
        .from('media')
        .insert([minimalData])
        .select()
        .single();

      if (error) {
        addLog(`Insert failed: ${error.message}`);
        addLog(`Error code: ${error.code}`);
        addLog(`Error details: ${JSON.stringify(error)}`);
        setResult(`Insert failed: ${error.message}`);
        
        // Try a more specific approach
        if (error.message.includes('column')) {
          addLog('Column error detected. Trying with explicit column selection...');
          
          // Try to get the actual column names from the error
          const columnMatch = error.message.match(/column "([^"]+)"/);
          if (columnMatch) {
            addLog(`Problematic column: ${columnMatch[1]}`);
          }
        }
        return;
      }
      
      addLog(`Insert successful! ID: ${data.id}`);
      setResult(`Insert successful! ID: ${data.id}`);
      
      // Clean up
      addLog('Cleaning up test record...');
      const { error: deleteError } = await supabase
        .from('media')
        .delete()
        .eq('id', data.id);
        
      if (deleteError) {
        addLog(`Cleanup failed: ${deleteError.message}`);
      } else {
        addLog('Cleanup successful');
      }
    } catch (error: any) {
      addLog(`Exception: ${error.message}`);
      setResult(`Exception: ${error.message}`);
    }
  };

  const testColumnDiscovery = async () => {
    try {
      addLog('Discovering table structure...');
      setResult('Discovering table structure...');
      
      // Try to get information about the table structure by testing each column
      const columnsToTest = ['id', 'url', 'title', 'filename', 'category', 'alt_text', 'description', 'created_at'];
      const results: string[] = [];
      
      for (const column of columnsToTest) {
        try {
          const { error } = await supabase.from('media').select(column).limit(1);
          if (error) {
            results.push(`${column}: ERROR - ${error.message}`);
          } else {
            results.push(`${column}: OK`);
          }
        } catch (e: any) {
          results.push(`${column}: EXCEPTION - ${e.message}`);
        }
      }
      
      results.forEach(log => addLog(log));
      setResult('Column discovery complete');
    } catch (error: any) {
      addLog(`Discovery exception: ${error.message}`);
      setResult(`Discovery exception: ${error.message}`);
    }
  };

  const forceSchemaRefresh = async () => {
    try {
      addLog('Attempting to force schema refresh...');
      setResult('Forcing schema refresh...');
      
      // Try several approaches to refresh the schema
      const refreshMethods = [
        () => supabase.from('media').select('id').limit(1),
        () => supabase.from('media').select('*').limit(1),
        () => supabase.rpc('version'), // This might not exist but could trigger a refresh
      ];
      
      for (let i = 0; i < refreshMethods.length; i++) {
        try {
          await refreshMethods[i]();
          addLog(`Refresh method ${i + 1} completed`);
        } catch (e) {
          addLog(`Refresh method ${i + 1} failed: ${e.message}`);
        }
      }
      
      addLog('Schema refresh attempts completed');
      setResult('Schema refresh attempts completed');
    } catch (error: any) {
      addLog(`Refresh exception: ${error.message}`);
      setResult(`Refresh exception: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Schema Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Video Title</label>
              <Input
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                placeholder="Test Video"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Video URL</label>
              <Input
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="https://example.com/video.mp4"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button onClick={testMinimalInsert}>Test Minimal Insert</Button>
            <Button onClick={testColumnDiscovery} variant="outline">Discover Columns</Button>
            <Button onClick={forceSchemaRefresh} variant="outline">Force Schema Refresh</Button>
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

export default SchemaTest;