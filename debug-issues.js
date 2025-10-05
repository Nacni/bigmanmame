// Debug script to identify the specific issues with comments and video uploads
// This script only reads data and doesn't make any changes to your database

const { createClient } = require('@supabase/supabase-js');

// Configuration - replace with your actual Supabase URL and anon key
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://prlcqrminsonibdsnzmy.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybGNxcm1pbnNvbmliZHNuem15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzgzNzcsImV4cCI6MjA3MzYxNDM3N30.pCIQNH4jvlfAWIr1i1WPHWoPzHwxjsEv5QswIfftFRU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugIssues() {
  console.log('🔍 Starting diagnostic for comments and video issues...\n');
  
  // 1. Test media table schema
  console.log('1. Testing media table schema...');
  try {
    // Test if we can access the media table with all expected columns
    const { data, error } = await supabase
      .from('media')
      .select('id, url, title, filename, category, description, alt_text, created_at')
      .limit(1);
    
    if (error) {
      console.error('❌ Media table schema error:', error.message);
      if (error.message.includes('column')) {
        console.log('   This confirms the schema cache issue with missing columns');
      }
    } else {
      console.log('✅ Media table schema is accessible');
      console.log('   Sample data:', JSON.stringify(data[0] || 'No data', null, 2));
    }
  } catch (error) {
    console.error('❌ Exception accessing media table:', error.message);
  }
  
  // 2. Test comments loading
  console.log('\n2. Testing comments loading...');
  try {
    // Test basic comments query
    const { data: basicComments, error: basicError } = await supabase
      .from('comments')
      .select('*')
      .limit(5);
    
    if (basicError) {
      console.error('❌ Basic comments query failed:', basicError.message);
    } else {
      console.log('✅ Basic comments query successful');
      console.log(`   Found ${basicComments.length} comments`);
    }
    
    // Test article comments relationship
    console.log('\n   Testing article comments relationship...');
    const { data: articleComments, error: articleError } = await supabase
      .from('comments')
      .select('*, articles(title)')
      .not('article_id', 'is', null)
      .limit(3);
    
    if (articleError) {
      console.error('❌ Article comments relationship failed:', articleError.message);
    } else {
      console.log('✅ Article comments relationship working');
      console.log(`   Found ${articleComments.length} article comments`);
    }
    
    // Test video comments relationship
    console.log('\n   Testing video comments relationship...');
    const { data: videoComments, error: videoError } = await supabase
      .from('comments')
      .select('*, media(title, filename)')
      .not('media_id', 'is', null)
      .limit(3);
    
    if (videoError) {
      console.error('❌ Video comments relationship failed:', videoError.message);
      if (videoError.message.includes('media')) {
        console.log('   This suggests an issue with the media table relationship');
      }
    } else {
      console.log('✅ Video comments relationship working');
      console.log(`   Found ${videoComments.length} video comments`);
    }
  } catch (error) {
    console.error('❌ Exception loading comments:', error.message);
  }
  
  // 3. Test specific error scenarios
  console.log('\n3. Testing specific error scenarios...');
  
  // Try to simulate the external video insertion error
  console.log('\n   Testing media table column access...');
  try {
    const { data, error } = await supabase
      .from('media')
      .select('category')
      .limit(1);
    
    if (error) {
      console.error('❌ Cannot access category column:', error.message);
      console.log('   This confirms the schema cache issue');
    } else {
      console.log('✅ Category column is accessible');
    }
  } catch (error) {
    console.error('❌ Exception accessing category column:', error.message);
  }
  
  // 4. Check table structures
  console.log('\n4. Checking table information...');
  try {
    // Get media table info
    const { data: mediaInfo, error: mediaError } = await supabase
      .from('media')
      .select('id')
      .limit(0); // Just get structure, no data
    
    if (mediaError) {
      console.error('❌ Cannot get media table info:', mediaError.message);
    } else {
      console.log('✅ Media table structure accessible');
    }
    
    // Get comments table info
    const { data: commentsInfo, error: commentsError } = await supabase
      .from('comments')
      .select('id')
      .limit(0);
    
    if (commentsError) {
      console.error('❌ Cannot get comments table info:', commentsError.message);
    } else {
      console.log('✅ Comments table structure accessible');
    }
  } catch (error) {
    console.error('❌ Exception getting table info:', error.message);
  }
  
  console.log('\n📋 Diagnostic complete. Please review the results above to identify the specific issues.');
  console.log('\n💡 Common solutions:');
  console.log('   1. For schema cache issues: Refresh schema cache in Supabase dashboard');
  console.log('   2. For comments issues: Check table relationships and foreign key constraints');
  console.log('   3. For both: Restart your development server to clear local caches');
}

// Run the diagnostic
debugIssues().catch(console.error);