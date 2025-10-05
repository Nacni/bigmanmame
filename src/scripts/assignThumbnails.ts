import { supabase } from '@/lib/supabase';

/**
 * Script to assign specific thumbnails to the first three videos in the database
 * This ensures that the first three videos keep their original thumbnails
 * while all other videos will use a shared thumbnail
 */

async function assignThumbnails() {
  try {
    console.log('Starting thumbnail assignment...');
    
    // Get all videos ordered by creation date
    const { data: videos, error } = await supabase
      .from('media')
      .select('*')
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
    // These are the existing thumbnails from the Supabase storage
    const thumbnailUrls = [
      'https://prlcqrminsonibdsnzmy.supabase.co/storage/v1/object/public/media/video-petroleum-thumb.jpg', // Petroleum video thumbnail
      'https://prlcqrminsonibdsnzmy.supabase.co/storage/v1/object/public/media/video-southwest-thumb.jpg', // Southwest video thumbnail
      'https://prlcqrminsonibdsnzmy.supabase.co/storage/v1/object/public/media/video-election-thumb.jpg'  // Election video thumbnail
    ];
    
    // Update the first three videos with specific thumbnails
    for (let i = 0; i < Math.min(3, videos.length); i++) {
      const video = videos[i];
      const thumbnailUrl = thumbnailUrls[i];
      
      console.log(`Updating video ${i + 1}: ${video.title || video.filename}`);
      
      const { error: updateError } = await supabase
        .from('media')
        .update({ thumbnail_url: thumbnailUrl })
        .eq('id', video.id);
        
      if (updateError) {
        console.error(`Error updating video ${i + 1}:`, updateError);
      } else {
        console.log(`Successfully updated video ${i + 1} with thumbnail: ${thumbnailUrl}`);
      }
    }
    
    console.log('Thumbnail assignment completed');
  } catch (error) {
    console.error('Error in thumbnail assignment:', error);
  }
}

// Run the script
assignThumbnails();