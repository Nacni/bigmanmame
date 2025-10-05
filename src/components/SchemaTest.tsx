import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { refreshSchemaCache, insertWithSchemaHandling } from '@/lib/supabase-utils';
import { toast } from '@/components/ui/sonner';

const SchemaTest = () => {
  const [testUrl, setTestUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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
        title: 'Test Video',
        category: 'Test'
      });
      
      if (result.error) {
        throw result.error;
      }
      
      toast.success("Test insert successful!");
      console.log('Insert result:', result);
    } catch (error: any) {
      console.error('Test insert failed:', error);
      toast.error(`Test insert failed: ${error.message}`);
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
      } else {
        toast.error("Schema cache refresh test failed");
      }
    } catch (error: any) {
      console.error('Refresh test failed:', error);
      toast.error(`Refresh test failed: ${error.message}`);
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
            title: 'Direct Test Video',
            category: 'Direct Test'
          }
        ])
        .select();

      if (error) {
        throw error;
      }
      
      toast.success("Direct insert successful!");
      console.log('Direct insert result:', data);
    } catch (error: any) {
      console.error('Direct insert failed:', error);
      toast.error(`Direct insert failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl text-foreground">Schema Cache Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="test-url" className="text-foreground">Test URL</Label>
          <Input
            id="test-url"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            placeholder="Enter a test URL"
            className="bg-input border-border text-foreground"
          />
        </div>
        
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
        </div>
      </CardContent>
    </Card>
  );
};

export default SchemaTest;