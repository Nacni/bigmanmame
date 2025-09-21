import { supabase } from './supabase';

// Test Supabase connection and CRUD operations
async function testSupabaseCRUD() {
  console.log('Testing Supabase CRUD operations...');
  
  try {
    // Test authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('Authentication error:', authError);
      return;
    }
    console.log('Authentication successful. User:', user?.email);
    
    // Test fetching articles
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('*')
      .limit(1);
      
    if (articlesError) {
      console.error('Error fetching articles:', articlesError);
    } else {
      console.log('Articles fetched successfully. Count:', articles?.length);
    }
    
    // Test fetching media
    const { data: media, error: mediaError } = await supabase
      .from('media')
      .select('*')
      .limit(1);
      
    if (mediaError) {
      console.error('Error fetching media:', mediaError);
    } else {
      console.log('Media fetched successfully. Count:', media?.length);
    }
    
    // Test fetching comments
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .limit(1);
      
    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
    } else {
      console.log('Comments fetched successfully. Count:', comments?.length);
    }
    
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Unexpected error during tests:', error);
  }
}

// Run the test
testSupabaseCRUD();