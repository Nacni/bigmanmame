const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with the correct keys
const supabaseUrl = 'https://prlcqrminsonibdsnzmy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybGNxcm1pbnNvbmliZHNuem15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzgzNzcsImV4cCI6MjA3MzYxNDM3N30.pCIQNH4jvlfAWIr1i1WPHWoPzHwxjsEv5QswIfftFRU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testThumbnailColumn() {
  console.log('🔍 Testing thumbnail_url column...\n');
  
  try {
    // Check if the thumbnail_url column exists by querying a sample record
    console.log('1. Checking if thumbnail_url column exists...');
    
    const { data, error } = await supabase
      .from('media')
      .select('id, thumbnail_url')
      .limit(1);
      
    if (error) {
      console.log('❌ Error accessing media table:', error.message);
      return;
    }
    
    console.log('✅ Successfully accessed media table with thumbnail_url column');
    
    if (data && data.length > 0) {
      console.log('\n2. Sample record with thumbnail_url:');
      console.log('   ID:', data[0].id);
      console.log('   thumbnail_url:', data[0].thumbnail_url || 'NULL (no thumbnail set)');
    } else {
      console.log('\n2. No records found in media table');
    }
    
    // Test inserting a record with thumbnail_url
    console.log('\n3. Testing insert with thumbnail_url...');
    const testData = {
      url: 'https://example.com/test-video.mp4',
      title: 'Test Video with Thumbnail',
      category: 'Test',
      filename: '',
      thumbnail_url: 'https://example.com/test-thumbnail.jpg'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('media')
      .insert(testData)
      .select('id, thumbnail_url');
      
    if (insertError) {
      console.log('❌ Insert failed:', insertError.message);
    } else {
      console.log('✅ Insert succeeded with thumbnail_url');
      console.log('   Inserted ID:', insertData[0]?.id);
      console.log('   thumbnail_url:', insertData[0]?.thumbnail_url);
      
      // Clean up the test record
      if (insertData && insertData[0]) {
        const { error: deleteError } = await supabase
          .from('media')
          .delete()
          .eq('id', insertData[0].id);
          
        if (deleteError) {
          console.log('⚠️  Warning: Could not clean up test record:', deleteError.message);
        } else {
          console.log('✅ Test record cleaned up successfully');
        }
      }
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
  
  console.log('\n📋 Next steps:');
  console.log('   1. Go to your admin panel and upload a thumbnail for a video');
  console.log('   2. Visit the public videos page to see if the thumbnail appears');
  console.log('   3. If thumbnails still don\'t appear, try refreshing the page');
}

// Run the test
testThumbnailColumn();