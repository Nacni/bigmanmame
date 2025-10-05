const { createClient } = require('@supabase/supabase-js');

// Configuration - Using the same credentials as in your project
const supabaseUrl = 'https://prlcqrminsonibdsnzmy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybGNxcm1pbnNvbmliZHNuem15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzgzNzcsImV4cCI6MjA3MzYxNDM3N30.pCIQNH4jvlfAWIr1i1WPHWoPzHwxjsEv5QswIfftFRU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function simpleVideoTest() {
  console.log('🔍 Simple external video test...\n');
  
  try {
    // Simple test with minimal fields
    console.log('Testing minimal external video insert...');
    const simpleVideo = {
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'Simple Test Video',
      filename: null,
      category: 'External Link'
    };
    
    const { data, error } = await supabase
      .from('media')
      .insert(simpleVideo)
      .select();
    
    if (error) {
      console.error('❌ Insert failed:', error.message);
      console.log('This is expected if you\'re not authenticated');
      console.log('Use the admin panel to add videos instead');
    } else {
      console.log('✅ Insert successful!');
      console.log('Data:', data[0]);
      
      // Clean up
      if (data && data[0]) {
        await supabase.from('media').delete().eq('id', data[0].id);
        console.log('Cleaned up test record');
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
  
  console.log('\n📋 To add external videos:');
  console.log('1. Go to your admin panel at /admin/videos');
  console.log('2. Log in if prompted');
  console.log('3. Click "Add Video" → "Add Link"');
  console.log('4. Enter the video URL and title');
  console.log('5. Click "Add External Video"');
}

simpleVideoTest();