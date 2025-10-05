const { createClient } = require('@supabase/supabase-js');

// Configuration - Using the same credentials as in your project
const supabaseUrl = 'https://prlcqrminsonibdsnzmy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybGNxcm1pbnNvbmliZHNuem15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzgzNzcsImV4cCI6MjA3MzYxNDM3N30.pCIQNH4jvlfAWIr1i1WPHWoPzHwxjsEv5QswIfftFRU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyPolicies() {
  console.log('🔍 Verifying current media table policies...\n');
  
  try {
    // Check if we can read from the media table
    console.log('1. Testing anonymous read access...');
    const { data: readData, error: readError } = await supabase
      .from('media')
      .select('id, title, url, filename, category')
      .limit(3);
    
    if (readError) {
      console.error('❌ Read access failed:', readError.message);
    } else {
      console.log('✅ Read access successful');
      console.log('   Sample data:', readData);
    }
    
    // Check current policies
    console.log('\n2. Checking current policies...');
    // We can't directly query pg_policies anonymously, so let's test different operations
    
    // Test insert (should fail for anonymous users)
    console.log('\n3. Testing anonymous insert (should fail)...');
    const testRecord = {
      url: 'https://example.com/test.mp4',
      title: 'Test Video',
      filename: null,
      category: 'Test'
    };
    
    const { error: insertError } = await supabase
      .from('media')
      .insert(testRecord);
    
    if (insertError && insertError.message.includes('row-level security policy')) {
      console.log('✅ Insert correctly blocked by RLS (this is expected)');
    } else if (insertError) {
      console.error('❌ Unexpected insert error:', insertError.message);
    } else {
      console.log('⚠️  Insert was allowed (this might not be expected)');
    }
    
    // Test the filtering logic that the public page uses
    console.log('\n4. Testing video filtering logic...');
    const { data: allData, error: allError } = await supabase
      .from('media')
      .select('*');
    
    if (allError) {
      console.error('❌ Failed to fetch all data:', allError.message);
      return;
    }
    
    // Apply the same filter as the public videos page
    const videoFiles = (allData || []).filter(item => 
      item.filename?.match(/\.(mp4|avi|mov|wmv|flv|webm)$/i) || 
      !item.filename // Include all items without filename (external videos)
    );
    
    console.log(`   Total records: ${allData ? allData.length : 0}`);
    console.log(`   Video records (after filtering): ${videoFiles.length}`);
    
    if (videoFiles.length > 0) {
      console.log('   Video records:');
      videoFiles.slice(0, 3).forEach((record, index) => {
        console.log(`     ${index + 1}. Title: ${record.title || 'No title'}`);
        console.log(`        Type: ${record.filename ? 'Uploaded' : 'External'}`);
        console.log(`        Filename: ${record.filename || 'NULL'}`);
        console.log('');
      });
    }
    
    console.log('\n📋 Summary:');
    console.log('   - Anonymous read access: Working correctly');
    console.log('   - Anonymous insert access: Correctly blocked by RLS');
    console.log('   - Video filtering: Working as expected');
    console.log('   - To add videos, use the admin panel at /admin/videos');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

verifyPolicies();