// Diagnostic script to check database structure and connectivity
const { createClient } = require('@supabase/supabase-js');

// Replace with your Supabase URL and anon key
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://prlcqrminsonibdsnzmy.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybGNxcm1pbnNvbmliZHNuem15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzgzNzcsImV4cCI6MjA3MzYxNDM3N30.pCIQNH4jvlfAWIr1i1WPHWoPzHwxjsEv5QswIfftFRU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runDiagnostics() {
  console.log('Running database diagnostics...\n');
  
  // Check media table structure
  console.log('1. Checking media table structure:');
  try {
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error querying media table:', error);
    } else {
      console.log('Media table accessible. Sample data:', data);
    }
  } catch (error) {
    console.error('Exception querying media table:', error);
  }
  
  // Check comments table structure
  console.log('\n2. Checking comments table structure:');
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error querying comments table:', error);
    } else {
      console.log('Comments table accessible. Sample data:', data);
    }
  } catch (error) {
    console.error('Exception querying comments table:', error);
  }
  
  // Check articles table structure
  console.log('\n3. Checking articles table structure:');
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error querying articles table:', error);
    } else {
      console.log('Articles table accessible. Sample data:', data);
    }
  } catch (error) {
    console.error('Exception querying articles table:', error);
  }
  
  // Check table relationships
  console.log('\n4. Checking table relationships:');
  try {
    // Test article comments relationship
    const { data: articleComments, error: articleError } = await supabase
      .from('comments')
      .select('*, articles(title)')
      .not('article_id', 'is', null)
      .limit(1);
    
    if (articleError) {
      console.error('Error with article comments relationship:', articleError);
    } else {
      console.log('Article comments relationship working. Sample data:', articleComments);
    }
    
    // Test video comments relationship
    const { data: videoComments, error: videoError } = await supabase
      .from('comments')
      .select('*, media(title, filename)')
      .not('media_id', 'is', null)
      .limit(1);
    
    if (videoError) {
      console.error('Error with video comments relationship:', videoError);
    } else {
      console.log('Video comments relationship working. Sample data:', videoComments);
    }
  } catch (error) {
    console.error('Exception checking table relationships:', error);
  }
  
  console.log('\nDiagnostics complete.');
}

runDiagnostics();