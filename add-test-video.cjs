const { createClient } = require('@supabase/supabase-js');

// Configuration - Using the same credentials as in your project
const supabaseUrl = 'https://prlcqrminsonibdsnzmy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybGNxcm1pbnNvbmliZHNuem15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzgzNzcsImV4cCI6MjA3MzYxNDM3N30.pCIQNH4jvlfAWIr1i1WPHWoPzHwxjsEv5QswIfftFRU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addTestVideo() {
  console.log('➕ Adding test external video...\n');
  
  try {
    // Add a test external video
    const testVideo = {
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'Test External Video',
      filename: null, // This is crucial for external videos
      category: 'External',
      description: 'Test video added via script for debugging purposes'
    };
    
    console.log('Inserting test video:', testVideo);
    
    const { data, error } = await supabase
      .from('media')
      .insert(testVideo)
      .select();
    
    if (error) {
      console.error('❌ Failed to insert test video:', error.message);
      console.error('Error details:', error);
      return;
    }
    
    console.log('✅ Test video added successfully!');
    console.log('Video data:', data[0]);
    
    // Now let's verify we can read it back
    console.log('\n🔍 Verifying the video can be read...');
    const { data: readData, error: readError } = await supabase
      .from('media')
      .select('*')
      .eq('id', data[0].id)
      .single();
    
    if (readError) {
      console.error('❌ Failed to read back the video:', readError.message);
    } else {
      console.log('✅ Video read back successfully!');
      console.log('Read data:', readData);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
  
  console.log('\n📋 Instructions:');
  console.log('1. Visit your videos page at http://localhost:8084/videos');
  console.log('2. Scroll to the "Latest Uploads" section');
  console.log('3. You should see your new test video');
  console.log('4. If not, check that RLS policies allow public SELECT access');
}

addTestVideo();