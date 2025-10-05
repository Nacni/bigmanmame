const { createClient } = require('@supabase/supabase-js');

// Configuration - Using the same credentials as in your project
const supabaseUrl = 'https://prlcqrminsonibdsnzmy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybGNxcm1pbnNvbmliZHNuem15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzgzNzcsImV4cCI6MjA3MzYxNDM3N30.pCIQNH4jvlfAWIr1i1WPHWoPzHwxjsEv5QswIfftFRU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diagnoseVideos() {
  console.log('🔍 Diagnosing video visibility issues...\n');
  
  try {
    console.log('1. Checking if we can access the media table anonymously...');
    
    // Try to read from the media table
    const { data, error, count } = await supabase
      .from('media')
      .select('*', { count: 'exact' });
    
    if (error) {
      console.error('❌ Failed to read from media table:', error.message);
      console.error('   Error code:', error.code);
      return;
    }
    
    console.log('✅ Successfully accessed media table');
    console.log(`   Found ${count} records in total`);
    
    if (data && data.length > 0) {
      console.log('   Sample records:');
      data.slice(0, 3).forEach((record, index) => {
        console.log(`     ${index + 1}. ID: ${record.id}`);
        console.log(`        URL: ${record.url}`);
        console.log(`        Title: ${record.title || 'No title'}`);
        console.log(`        Filename: ${record.filename || 'NULL'}`);
        console.log(`        Created: ${record.created_at}`);
        console.log('');
      });
      
      // Check filtering logic
      console.log('2. Applying the same filter as the public videos page...');
      
      // Filter only video files - include external videos (those without filename)
      const videoFiles = data.filter(item => 
        item.filename?.match(/\.(mp4|avi|mov|wmv|flv|webm)$/i) || 
        !item.filename // Include all items without filename (external videos)
      );
      
      console.log(`   After filtering: ${videoFiles.length} video records`);
      
      if (videoFiles.length > 0) {
        console.log('   Filtered sample records:');
        videoFiles.slice(0, 3).forEach((record, index) => {
          console.log(`     ${index + 1}. ID: ${record.id}`);
          console.log(`        URL: ${record.url}`);
          console.log(`        Title: ${record.title || 'No title'}`);
          console.log(`        Filename: ${record.filename || 'NULL'}`);
          console.log(`        Is External: ${!record.filename}`);
          console.log('');
        });
      }
      
      console.log('3. Testing specific video extensions...');
      const extensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
      extensions.forEach(ext => {
        const count = data.filter(item => 
          item.filename && item.filename.toLowerCase().endsWith('.' + ext)
        ).length;
        console.log(`   ${ext.toUpperCase()}: ${count} files`);
      });
      
      const externalCount = data.filter(item => !item.filename).length;
      console.log(`   External links (NULL filename): ${externalCount}`);
      
    } else {
      console.log('⚠️  No records found in media table');
      console.log('   This means either:');
      console.log('   1. No videos have been uploaded yet');
      console.log('   2. RLS policies are blocking access');
      console.log('   3. The table is empty');
    }
    
    console.log('\n4. Testing insert permissions...');
    
    // Try to insert a test record
    const testRecord = {
      url: 'https://example.com/test-video.mp4',
      title: 'Test Video for Diagnosis',
      filename: null,
      category: 'Test'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('media')
      .insert(testRecord)
      .select();
    
    if (insertError) {
      console.error('❌ Insert test failed:', insertError.message);
      console.error('   This confirms RLS policies are working');
    } else {
      console.log('✅ Insert test successful');
      console.log('   This means the table is accessible for inserts');
      
      // Clean up test record
      if (insertData && insertData[0]) {
        await supabase.from('media').delete().eq('id', insertData[0].id);
        console.log('   Cleaned up test record');
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
  
  console.log('\n📋 Summary:');
  console.log('   - Check if records exist in the media table');
  console.log('   - Verify RLS policies allow public SELECT access');
  console.log('   - Ensure filenames match video extensions or are NULL for external links');
  console.log('   - Confirm environment variables are correctly set');
}

diagnoseVideos();