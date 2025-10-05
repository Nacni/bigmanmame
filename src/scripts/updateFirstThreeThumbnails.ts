import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://prlcqrminsonibdsnzmy.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybGNxcm1pbnNvbmliZHNuem15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzgzNzcsImV4cCI6MjA3MzYxNDM3N30.pCIQNH4jvlfAWIr1i1WPHWoPzHwxjsEv5QswIfftFRU';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Script to update the first three videos in the database with specific thumbnails
 * This ensures that the first three videos keep their original thumbnails
 * while all other videos will use a shared thumbnail
 */

async function updateFirstThreeThumbnails() {
  try {
    console.log('Starting thumbnail update for first three videos...');
    
    // Get all videos ordered by creation date (oldest first)
    const { data: videos, error } = await supabase
      .from('media')
      .select('id, title, filename, created_at')
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
    
    // Define thumbnail URLs for the first three videos
    // These should match the thumbnails used in the frontend
    const thumbnailUrls = [
      'https://prlcqrminsonibdsnzmy.supabase.co/storage/v1/object/public/media/video-petroleum-thumb.jpg',
      'https://prlcqrminsonibdsnzmy.supabase.co/storage/v1/object/public/media/video-southwest-thumb.jpg',
      'https://prlcqrminsonibdsnzmy.supabase.co/storage/v1/object/public/media/video-election-thumb.jpg'
    ];
    
    // Update the first three videos with specific thumbnails
    for (let i = 0; i < Math.min(3, videos.length); i++) {
      const video = videos[i];
      const thumbnailUrl = thumbnailUrls[i];
      
      console.log(`Updating video ${i + 1}: ${video.title || video.filename || video.id}`);
      console.log(`Thumbnail URL: ${thumbnailUrl}`);
      
      const { error: updateError } = await supabase
        .from('media')
        .update({ thumbnail_url: thumbnailUrl })
        .eq('id', video.id);
        
      if (updateError) {
        console.error(`Error updating video ${i + 1}:`, updateError);
      } else {
        console.log(`Successfully updated video ${i + 1} with thumbnail`);
      }
    }
    
    console.log('Thumbnail update completed');
  } catch (error) {
    console.error('Error in thumbnail update:', error);
  }
}

// Run the script
updateFirstThreeThumbnails()
  .then(() => {
    console.log('Script execution completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script execution failed:', error);
    process.exit(1);
  });