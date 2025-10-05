import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://prlcqrminsonibdsnzmy.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybGNxcm1pbnNvbmliZHNuem15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzgzNzcsImV4cCI6MjA3MzYxNDM3N30.pCIQNH4jvlfAWIr1i1WPHWoPzHwxjsEv5QswIfftFRU';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Script to upload thumbnail images to Supabase storage
 * This ensures that the thumbnail URLs used in the database are valid
 */

async function uploadThumbnails() {
  try {
    console.log('Starting thumbnail upload...');
    
    // Define the thumbnail files to upload
    const thumbnailFiles = [
      {
        localPath: path.join(__dirname, '../assets/video-petroleum-thumb.jpg'),
        storagePath: 'video-petroleum-thumb.jpg'
      },
      {
        localPath: path.join(__dirname, '../assets/video-southwest-thumb.jpg'),
        storagePath: 'video-southwest-thumb.jpg'
      },
      {
        localPath: path.join(__dirname, '../assets/video-election-thumb.jpg'),
        storagePath: 'video-election-thumb.jpg'
      }
    ];
    
    // Upload each thumbnail
    for (const file of thumbnailFiles) {
      // Check if file exists
      if (!fs.existsSync(file.localPath)) {
        console.error(`File not found: ${file.localPath}`);
        continue;
      }
      
      console.log(`Uploading ${file.storagePath}...`);
      
      // Read file
      const fileBuffer = fs.readFileSync(file.localPath);
      
      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(file.storagePath, fileBuffer, {
          upsert: true // Overwrite if exists
        });
      
      if (uploadError) {
        console.error(`Error uploading ${file.storagePath}:`, uploadError);
      } else {
        console.log(`Successfully uploaded ${file.storagePath}`);
        
        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(file.storagePath);
          
        console.log(`Public URL: ${publicUrl}`);
      }
    }
    
    console.log('Thumbnail upload completed');
  } catch (error) {
    console.error('Error in thumbnail upload:', error);
  }
}

// Run the script
uploadThumbnails()
  .then(() => {
    console.log('Script execution completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script execution failed:', error);
    process.exit(1);
  });