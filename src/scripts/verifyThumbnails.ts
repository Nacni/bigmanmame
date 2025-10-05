import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://prlcqrminsonibdsnzmy.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybGNxcm1pbnNvbmliZHNuem15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzgzNzcsImV4cCI6MjA3MzYxNDM3N30.pCIQNH4jvlfAWIr1i1WPHWoPzHwxjsEv5QswIfftFRU';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Script to verify that thumbnails are correctly set in the database
 * This checks that the first three videos have specific thumbnails
 * and other videos have either specific or default thumbnails
 */

async function verifyThumbnails() {
  try {
    console.log('Verifying thumbnail assignments...');
    
    // Get all videos ordered by creation date
    const { data: videos, error } = await supabase
      .from('media')
      .select('id, title, filename, thumbnail_url, created_at')
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error('Error fetching videos:', error);
      return;
    }
    
    console.log(`Found ${videos?.length || 0} videos`);
    
    if (!videos || videos.length === 0) {
      console.log('No videos found in database');
      return;
    }
    
    // Expected thumbnail URLs for the first three videos
    const expectedThumbnails = [
      'https://prlcqrminsonibdsnzmy.supabase.co/storage/v1/object/public/media/video-petroleum-thumb.jpg',
      'https://prlcqrminsonibdsnzmy.supabase.co/storage/v1/object/public/media/video-southwest-thumb.jpg',
      'https://prlcqrminsonibdsnzmy.supabase.co/storage/v1/object/public/media/video-election-thumb.jpg'
    ];
    
    // Verify each video
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      const videoNumber = i + 1;
      
      console.log(`\nVideo ${videoNumber}: ${video.title || video.filename || video.id}`);
      console.log(`  Created: ${video.created_at}`);
      console.log(`  Thumbnail URL: ${video.thumbnail_url || 'Not set'}`);
      
      // Check if this is one of the first three videos
      if (i < 3) {
        const expectedUrl = expectedThumbnails[i];
        if (video.thumbnail_url === expectedUrl) {
          console.log(`  ✓ Correct thumbnail assigned`);
        } else if (!video.thumbnail_url) {
          console.log(`  ✗ No thumbnail assigned (expected: ${expectedUrl})`);
        } else {
          console.log(`  ✗ Incorrect thumbnail assigned`);
          console.log(`    Expected: ${expectedUrl}`);
          console.log(`    Actual: ${video.thumbnail_url}`);
        }
      } else {
        // For other videos, just check if they have a thumbnail
        if (video.thumbnail_url) {
          console.log(`  ✓ Thumbnail assigned`);
        } else {
          console.log(`  ○ No thumbnail assigned (will use default)`);
        }
      }
    }
    
    console.log('\nVerification completed');
  } catch (error) {
    console.error('Error in thumbnail verification:', error);
  }
}

// Run the script
verifyThumbnails()
  .then(() => {
    console.log('Script execution completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script execution failed:', error);
    process.exit(1);
  });