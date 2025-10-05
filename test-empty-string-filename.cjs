const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with the correct keys
const supabaseUrl = 'https://prlcqrminsonibdsnzmy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybGNxcm1pbnNvbmliZHNuem15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzgzNzcsImV4cCI6MjA3MzYxNDM3N30.pCIQNH4jvlfAWIr1i1WPHWoPzHwxjsEv5QswIfftFRU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testEmptyStringFilename() {
  console.log('🔍 Testing empty string vs null for filename...\n');
  
  // Test data with null filename (the previous approach)
  const testDataWithNull = {
    url: 'https://example.com/test-video-null.mp4',
    title: 'Test with NULL filename',
    category: 'Test',
    description: 'Testing null filename',
    filename: null
  };
  
  // Test data with empty string filename (the new approach)
  const testDataWithEmptyString = {
    url: 'https://example.com/test-video-empty.mp4',
    title: 'Test with empty string filename',
    category: 'Test',
    description: 'Testing empty string filename',
    filename: ''
  };
  
  console.log('1. Testing with NULL filename (old approach)...');
  console.log('   Data:', JSON.stringify(testDataWithNull, null, 2));
  
  try {
    const { data: nullData, error: nullError } = await supabase
      .from('media')
      .insert(testDataWithNull)
      .select();
      
    if (nullError) {
      console.log('❌ Failed with NULL:', nullError.message);
      if (nullError.message.includes('null value in column')) {
        console.log('   This confirms the NULL constraint issue');
      }
    } else {
      console.log('✅ Succeeded with NULL');
      // Clean up
      if (nullData && nullData[0]) {
        await supabase.from('media').delete().eq('id', nullData[0].id);
        console.log('   Test record cleaned up');
      }
    }
  } catch (err) {
    console.log('❌ Error with NULL:', err.message);
  }
  
  console.log('\n2. Testing with empty string filename (new approach)...');
  console.log('   Data:', JSON.stringify(testDataWithEmptyString, null, 2));
  
  try {
    const { data: emptyData, error: emptyError } = await supabase
      .from('media')
      .insert(testDataWithEmptyString)
      .select();
      
    if (emptyError) {
      console.log('❌ Failed with empty string:', emptyError.message);
    } else {
      console.log('✅ Succeeded with empty string!');
      console.log('   Inserted ID:', emptyData[0]?.id);
      // Clean up
      if (emptyData && emptyData[0]) {
        await supabase.from('media').delete().eq('id', emptyData[0].id);
        console.log('   Test record cleaned up');
      }
    }
  } catch (err) {
    console.log('❌ Error with empty string:', err.message);
  }
  
  console.log('\n📋 Test complete');
  console.log('If the empty string approach succeeded, the fix is working.');
  console.log('The VideosManager and SimpleVideoManager have been updated to use this approach.');
}

// Run the test
testEmptyStringFilename();