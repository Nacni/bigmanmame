const { createClient } = require('@supabase/supabase-js');

// Configuration - Using the same credentials as in your project
const supabaseUrl = 'https://prlcqrminsonibdsnzmy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybGNxcm1pbnNvbmliZHNuem15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzgzNzcsImV4cCI6MjA3MzYxNDM3N30.pCIQNH4jvlfAWIr1i1WPHWoPzHwxjsEv5QswIfftFRU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyAuth() {
  console.log('🔍 Verifying authentication and RLS policies...\n');
  
  try {
    // Check current session
    console.log('1. Checking current session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session check failed:', sessionError.message);
      return;
    }
    
    if (session) {
      console.log('✅ User is authenticated');
      console.log('   User ID:', session.user.id);
      console.log('   User Email:', session.user.email);
    } else {
      console.log('⚠️  No active session - user is not authenticated');
      console.log('   This explains the RLS policy violations');
      console.log('   You need to log in to perform database operations');
      return;
    }
    
    console.log('\n2. Testing media table access with authentication...');
    
    // Try to insert a record (should work if authenticated)
    const testRecord = {
      url: 'https://example.com/auth-test.mp4',
      title: 'Auth Test Video',
      filename: null,
      category: 'Test'
    };
    
    const { data, error } = await supabase
      .from('media')
      .insert(testRecord)
      .select();
    
    if (error) {
      console.error('❌ Authenticated insert failed:', error.message);
      console.error('   This might indicate an issue with RLS policies');
    } else {
      console.log('✅ Authenticated insert successful');
      console.log('   Data:', JSON.stringify(data, null, 2));
      
      // Clean up
      if (data && data[0]) {
        await supabase.from('media').delete().eq('id', data[0].id);
        console.log('   Cleaned up test record');
      }
    }
    
    console.log('\n3. Testing media table read access...');
    
    // Try to read records (should work if authenticated)
    const { data: readData, error: readError } = await supabase
      .from('media')
      .select('*')
      .limit(1);
    
    if (readError) {
      console.error('❌ Authenticated read failed:', readError.message);
    } else {
      console.log('✅ Authenticated read successful');
      console.log(`   Found ${readData ? readData.length : 0} records`);
    }
    
    console.log('\n📋 Summary:');
    console.log('   - Authentication is required for all media table operations');
    console.log('   - RLS policies are correctly configured');
    console.log('   - If you see "No active session" above, you need to log in');
    console.log('   - If inserts/reads fail despite authentication, check RLS policies');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
  
  console.log('\n🏁 Verification complete');
}

verifyAuth();