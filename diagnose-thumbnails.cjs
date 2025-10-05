const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with the correct keys
const supabaseUrl = 'https://prlcqrminsonibdsnzmy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybGNxcm1pbnNvbmliZHNuem15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzgzNzcsImV4cCI6MjA3MzYxNDM3N30.pCIQNH4jvlfAWIr1i1WPHWoPzHwxjsEv5QswIfftFRU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseThumbnails() {
  console.log('🔍 Diagnosing thumbnail issues...\n');
  
  try {
    // Check if thumbnail_url column exists and fetch some sample data
    console.log('1. Checking media table structure and sample records...');
    
    const { data, error } = await supabase
      .from('media')
      .select('id, title, thumbnail_url, url, filename')
      .limit(5);
      
    if (error) {
      console.log('❌ Error accessing media table:', error.message);
      return;
    }
    
    console.log('✅ Successfully accessed media table');
    
    if (data && data.length > 0) {
      console.log('\n📋 Sample records:');
      data.forEach((record, index) => {
        console.log(`   ${index + 1}. ID: ${record.id}`);
        console.log(`      Title: ${record.title}`);
        console.log(`      Thumbnail URL: ${record.thumbnail_url || 'NULL'}`);
        console.log(`      Video URL: ${record.url}`);
        console.log(`      Filename: ${record.filename || 'NULL'}\n`);
      });
    } else {
      console.log('\n⚠️  No records found in media table');
    }
    
    // Check if there are any records with thumbnail_url set
    console.log('2. Checking for records with thumbnails...');
    
    const { data: recordsWithThumbnails, error: thumbnailError } = await supabase
      .from('media')
      .select('id, title, thumbnail_url')
      .not('thumbnail_url', 'is', null)
      .limit(3);
      
    if (thumbnailError) {
      console.log('❌ Error checking for thumbnails:', thumbnailError.message);
    } else if (recordsWithThumbnails && recordsWithThumbnails.length > 0) {
      console.log('✅ Found records with thumbnails:');
      recordsWithThumbnails.forEach(record => {
        console.log(`   • ${record.title}: ${record.thumbnail_url}`);
      });
    } else {
      console.log('⚠️  No records with thumbnails found');
    }
    
    // Test updating a record with a thumbnail URL
    console.log('\n3. Testing thumbnail update...');
    
    if (data && data.length > 0) {
      const testRecord = data[0];
      console.log(`   Testing with record ID: ${testRecord.id}`);
      
      const testThumbnailUrl = 'https://example.com/test-thumbnail.jpg';
      
      const { data: updateData, error: updateError } = await supabase
        .from('media')
        .update({ thumbnail_url: testThumbnailUrl })
        .eq('id', testRecord.id)
        .select('id, title, thumbnail_url');
        
      if (updateError) {
        console.log('❌ Update failed:', updateError.message);
      } else if (updateData && updateData.length > 0) {
        console.log('✅ Update succeeded:');
        console.log(`   Thumbnail URL: ${updateData[0].thumbnail_url}`);
        
        // Reset the thumbnail to its original value
        const { error: resetError } = await supabase
          .from('media')
          .update({ thumbnail_url: testRecord.thumbnail_url || null })
          .eq('id', testRecord.id);
          
        if (resetError) {
          console.log('⚠️  Warning: Could not reset thumbnail:', resetError.message);
        } else {
          console.log('✅ Thumbnail reset to original value');
        }
      }
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
  
  console.log('\n📋 Diagnosis complete');
  console.log('\nIf thumbnails are not displaying correctly:');
  console.log('   1. Check that the thumbnail_url field is being saved when you upload thumbnails');
  console.log('   2. Verify that the VideosManager handleSaveEdit function includes thumbnail_url in updates');
  console.log('   3. Make sure the public Videos page is using video.thumbnail_url');
  console.log('   4. Try refreshing the page after uploading thumbnails');
}

// Run the diagnosis
diagnoseThumbnails();