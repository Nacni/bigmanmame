const { createClient } = require('@supabase/supabase-js');

// Configuration - Using the same credentials as in your project
const supabaseUrl = 'https://prlcqrminsonibdsnzmy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybGNxcm1pbnNvbmliZHNuem15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzgzNzcsImV4cCI6MjA3MzYxNDM3N30.pCIQNH4jvlfAWIr1i1WPHWoPzHwxjsEv5QswIfftFRU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addExternalVideo() {
  console.log('➕ Adding external video...\n');
  
  // Example external video URL - you can change this to any valid video URL
  const externalVideoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  const videoTitle = 'Test External Video';
  
  try {
    console.log(`Adding external video: ${videoTitle}`);
    console.log(`URL: ${externalVideoUrl}`);
    
    // For external videos, we set filename to NULL
    const videoRecord = {
      url: externalVideoUrl,
      title: videoTitle,
      filename: null, // This is important for external videos
      category: 'External',
      description: 'Test external video added via script'
    };
    
    const { data, error } = await supabase
      .from('media')
      .insert(videoRecord)
      .select();
    
    if (error) {
      console.error('❌ Failed to add external video:', error.message);
      
      // If it's an RLS error, we need to authenticate
      if (error.message.includes('row-level security policy')) {
        console.log('\n⚠️  RLS policy violation detected.');
        console.log('   You need to authenticate to add videos.');
        console.log('   Please use the admin panel at /admin/videos to add videos.');
      }
      return;
    }
    
    console.log('✅ External video added successfully!');
    console.log('   Video ID:', data[0].id);
    console.log('   Title:', data[0].title);
    console.log('   URL:', data[0].url);
    console.log('   Filename:', data[0].filename);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
  
  console.log('\n📋 Next steps:');
  console.log('   1. Visit /videos in your browser');
  console.log('   2. Scroll to "Latest Uploads" section');
  console.log('   3. You should see your new external video');
}

// Also create a function to list all videos
async function listVideos() {
  console.log('📋 Listing all videos...\n');
  
  try {
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Failed to fetch videos:', error.message);
      return;
    }
    
    if (data && data.length > 0) {
      console.log(`Found ${data.length} records:`);
      
      // Filter for actual videos
      const videoFiles = data.filter(item => 
        item.filename?.match(/\.(mp4|avi|mov|wmv|flv|webm)$/i) || 
        !item.filename // Include all items without filename (external videos)
      );
      
      console.log(`\n🎬 Video records (${videoFiles.length}):`);
      videoFiles.forEach((record, index) => {
        console.log(`  ${index + 1}. ${record.title || 'Untitled'}`);
        console.log(`     URL: ${record.url}`);
        console.log(`     Type: ${record.filename ? 'Uploaded' : 'External'}`);
        console.log(`     Created: ${new Date(record.created_at).toLocaleString()}`);
        console.log('');
      });
      
      if (videoFiles.length === 0) {
        console.log('No video records found. All records are images or other file types.');
      }
    } else {
      console.log('No records found in media table.');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Main execution
async function main() {
  const action = process.argv[2];
  
  if (action === 'add') {
    await addExternalVideo();
  } else if (action === 'list') {
    await listVideos();
  } else {
    console.log('🔧 Usage:');
    console.log('   node add-external-video.cjs add   - Add a test external video');
    console.log('   node add-external-video.cjs list  - List all videos');
    console.log('\n📝 Example:');
    console.log('   node add-external-video.cjs add');
  }
}

main();