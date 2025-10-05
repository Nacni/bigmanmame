import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { refreshSchemaCache, insertWithSchemaHandling } from '@/lib/supabase-utils';
import { toast } from '@/components/ui/sonner';
import { Textarea } from '@/components/ui/textarea';

const SchemaTestPage = () => {
  const [testTitle, setTestTitle] = useState('Test Video');
  const [testUrl, setTestUrl] = useState('https://example.com/test-video.mp4');
  const [testDescription, setTestDescription] = useState('This is a test video for schema cache testing');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  const addTestResult = (testName: string, success: boolean, message: string) => {
    setTestResults(prev => [...prev, { testName, success, message, timestamp: new Date().toLocaleTimeString() }]);
  };

  const handleTestInsert = async () => {
    if (!testUrl) {
      toast.error("Please enter a URL");
      return;
    }

    setLoading(true);
    try {
      // Test the insert with our new utility function
      const result = await insertWithSchemaHandling('media', {
        url: testUrl,
        title: testTitle,
        description: testDescription,
        category: 'Test'
      });
      
      if (result.error) {
        throw result.error;
      }
      
      toast.success("Test insert successful!");
      addTestResult('Insert with Utilities', true, 'Successfully inserted test video');
      console.log('Insert result:', result);
    } catch (error: any) {
      console.error('Test insert failed:', error);
      toast.error(`Test insert failed: ${error.message}`);
      addTestResult('Insert with Utilities', false, `Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshTest = async () => {
    setRefreshing(true);
    try {
      const success = await refreshSchemaCache();
      if (success) {
        toast.success("Schema cache refresh test successful!");
        addTestResult('Schema Refresh', true, 'Successfully refreshed schema cache');
      } else {
        toast.error("Schema cache refresh test failed");
        addTestResult('Schema Refresh', false, 'Failed to refresh schema cache');
      }
    } catch (error: any) {
      console.error('Refresh test failed:', error);
      toast.error(`Refresh test failed: ${error.message}`);
      addTestResult('Schema Refresh', false, `Error: ${error.message}`);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDirectInsert = async () => {
    if (!testUrl) {
      toast.error("Please enter a URL");
      return;
    }

    setLoading(true);
    try {
      // Test direct insert without utility functions
      const { data, error } = await supabase
        .from('media')
        .insert([
          {
            url: testUrl,
            title: testTitle + ' (Direct)',
            description: testDescription,
            category: 'Direct Test'
          }
        ])
        .select();

      if (error) {
        throw error;
      }
      
      toast.success("Direct insert successful!");
      addTestResult('Direct Insert', true, 'Successfully inserted test video directly');
      console.log('Direct insert result:', data);
    } catch (error: any) {
      console.error('Direct insert failed:', error);
      toast.error(`Direct insert failed: ${error.message}`);
      addTestResult('Direct Insert', false, `Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchTest = async () => {
    setLoading(true);
    try {
      // Test fetching data
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .limit(5);

      if (error) {
        throw error;
      }
      
      toast.success(`Fetched ${data?.length || 0} records successfully!`);
      addTestResult('Fetch Data', true, `Successfully fetched ${data?.length || 0} records`);
      console.log('Fetch result:', data);
    } catch (error: any) {
      console.error('Fetch test failed:', error);
      toast.error(`Fetch test failed: ${error.message}`);
      addTestResult('Fetch Data', false, `Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Schema Cache Test</h1>
        <p className="text-muted-foreground mt-2">
          Test various operations to verify the schema cache issue is resolved
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Test Input Form */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Test Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-title" className="text-foreground">Title</Label>
              <Input
                id="test-title"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                placeholder="Test Video Title"
                className="bg-input border-border text-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="test-url" className="text-foreground">URL</Label>
              <Input
                id="test-url"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="https://example.com/test-video.mp4"
                className="bg-input border-border text-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="test-description" className="text-foreground">Description</Label>
              <Textarea
                id="test-description"
                value={testDescription}
                onChange={(e) => setTestDescription(e.target.value)}
                placeholder="Test video description"
                className="bg-input border-border text-foreground"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Test Actions */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Test Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={handleTestInsert} 
                disabled={loading}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? 'Testing...' : 'Test Insert (With Utilities)'}
              </Button>
              
              <Button 
                onClick={handleDirectInsert} 
                disabled={loading}
                variant="outline"
              >
                {loading ? 'Testing...' : 'Direct Insert (No Utilities)'}
              </Button>
              
              <Button 
                onClick={handleRefreshTest} 
                disabled={refreshing}
                variant="secondary"
              >
                {refreshing ? 'Refreshing...' : 'Test Schema Refresh'}
              </Button>
              
              <Button 
                onClick={handleFetchTest} 
                disabled={loading}
                variant="outline"
              >
                {loading ? 'Fetching...' : 'Test Fetch Data'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl text-foreground">Test Results</CardTitle>
          <Button onClick={clearResults} variant="outline" size="sm">
            Clear Results
          </Button>
        </CardHeader>
        <CardContent>
          {testResults.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No test results yet. Run some tests to see results here.
            </p>
          ) : (
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg border ${
                    result.success 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`font-medium ${
                        result.success ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {result.testName}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {result.message}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {result.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SchemaTestPage;