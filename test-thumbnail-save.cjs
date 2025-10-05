const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with the correct keys
const supabaseUrl = 'https://prlcqrminsonibdsnzmy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybGNxcm1pbnNvbmliZHNuem15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzgzNzcsImV4cCI6MjA3MzYxNDM3N30.pCIQNH4jvlfAWIr1i1WPHWoPzHwxjsEv5QswIfftFRU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testThumbnailSave() {
  console.log('🔍 Testing thumbnail save functionality...\n');
  
  try {
    // Get a sample record to test with
    console.log('1. Getting sample video record...');
    
    const { data: sampleVideos, error: fetchError } = await supabase
      .from('media')
      .select('id, title, thumbnail_url')
      .limit(1);
      
    if (fetchError) {
      console.log('❌ Error fetching sample video:', fetchError.message);
      return;
    }
    
    if (!sampleVideos || sampleVideos.length === 0) {
      console.log('⚠️  No videos found in database');
      return;
    }
    
    const video = sampleVideos[0];
    console.log(`✅ Found video: ${video.title} (ID: ${video.id})`);
    console.log(`   Current thumbnail_url: ${video.thumbnail_url || 'NULL'}\n`);
    
    // Test updating the thumbnail_url
    console.log('2. Testing thumbnail_url update...');
    
    const testThumbnailUrl = 'https://example.com/test-thumbnail-' + Date.now() + '.jpg';
    
    const { data: updatedVideo, error: updateError } = await supabase
      .from('media')
      .update({ thumbnail_url: testThumbnailUrl })
      .eq('id', video.id)
      .select('id, title, thumbnail_url');
      
    if (updateError) {
      console.log('❌ Error updating thumbnail_url:', updateError.message);
      return;
    }
    
    console.log(`✅ Successfully updated thumbnail_url:`);
    console.log(`   New thumbnail_url: ${updatedVideo[0].thumbnail_url}\n`);
    
    // Verify the update was saved
    console.log('3. Verifying update was saved...');
    
    const { data: verifiedVideo, error: verifyError } = await supabase
      .from('media')
      .select('id, title, thumbnail_url')
      .eq('id', video.id)
      .single();
      
    if (verifyError) {
      console.log('❌ Error verifying update:', verifyError.message);
      return;
    }
    
    if (verifiedVideo.thumbnail_url === testThumbnailUrl) {
      console.log('✅ Verification successful - thumbnail_url properly saved!');
      console.log(`   Saved value: ${verifiedVideo.thumbnail_url}\n`);
    } else {
      console.log('❌ Verification failed - thumbnail_url not saved correctly');
      console.log(`   Expected: ${testThumbnailUrl}`);
      console.log(`   Got: ${verifiedVideo.thumbnail_url}\n`);
    }
    
    // Reset to original value
    console.log('4. Resetting to original value...');
    
    const { error: resetError } = await supabase
      .from('media')
      .update({ thumbnail_url: video.thumbnail_url || null })
      .eq('id', video.id);
      
    if (resetError) {
      console.log('⚠️  Warning: Could not reset thumbnail_url:', resetError.message);
    } else {
      console.log('✅ Successfully reset to original value\n');
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
  
  console.log('📋 Test complete');
  console.log('\nIf this test passed but thumbnails still aren\'t working in the admin panel:');
  console.log('   1. Check that the VideosManager handleSaveEdit function includes thumbnail_url in updates');
  console.log('   2. Make sure you\'re clicking "Save Changes" after uploading a thumbnail');
  console.log('   3. Try refreshing the admin panel page after saving');
}

// Run the test
testThumbnailSave();