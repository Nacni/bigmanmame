const { createClient } = require('@supabase/supabase-js');

// Configuration - Using the same credentials as in your project
const supabaseUrl = 'https://prlcqrminsonibdsnzmy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybGNxcm1pbnNvbmliZHNuem15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzgzNzcsImV4cCI6MjA3MzYxNDM3N30.pCIQNH4jvlfAWIr1i1WPHWoPzHwxjsEv5QswIfftFRU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyBypass() {
  console.log('🔍 Verifying bypass mode functionality...\n');
  
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
      console.log('   This is expected if you\'re using bypass mode');
    }
    
    console.log('\n2. Testing media table access...');
    
    // Try to insert a record without authentication (simulating bypass mode)
    const testRecord = {
      url: 'https://example.com/bypass-test.mp4',
      title: 'Bypass Test Video',
      filename: null,
      category: 'Test'
    };
    
    console.log('   Inserting test record:', JSON.stringify(testRecord, null, 2));
    const { data, error } = await supabase
      .from('media')
      .insert(testRecord)
      .select();
    
    if (error) {
      console.log('❌ Insert failed (this is expected if RLS is enabled):', error.message);
      console.log('   Error code:', error.code);
      
      if (error.message.includes('violates row-level security policy')) {
        console.log('   This confirms the RLS policy is working correctly');
        console.log('   You need to either:');
        console.log('   1. Log in properly, or');
        console.log('   2. Use the bypass mode in the application');
      }
    } else {
      console.log('✅ Insert successful');
      console.log('   Data:', JSON.stringify(data, null, 2));
      
      // Clean up
      if (data && data[0]) {
        await supabase.from('media').delete().eq('id', data[0].id);
        console.log('   Cleaned up test record');
      }
    }
    
    console.log('\n3. Testing media table read access...');
    
    // Try to read records
    const { data: readData, error: readError } = await supabase
      .from('media')
      .select('*')
      .limit(3);
    
    if (readError) {
      console.error('❌ Read failed:', readError.message);
    } else {
      console.log('✅ Read successful');
      console.log(`   Found ${readData ? readData.length : 0} records`);
      if (readData && readData.length > 0) {
        console.log('   Sample record:', JSON.stringify(readData[0], null, 2));
      }
    }
    
    console.log('\n📋 Summary:');
    console.log('   - If you see RLS policy errors above, authentication is required');
    console.log('   - If inserts work, either you\'re authenticated or RLS is disabled');
    console.log('   - Use bypass mode in the application for testing without authentication');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
  
  console.log('\n🏁 Verification complete');
}

verifyBypass();