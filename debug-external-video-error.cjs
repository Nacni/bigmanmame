const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with the correct keys
const supabaseUrl = 'https://prlcqrminsonibdsnzmy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybGNxcm1pbnNvbmliZHNuem15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzgzNzcsImV4cCI6MjA3MzYxNDM3N30.pCIQNH4jvlfAWIr1i1WPHWoPzHwxjsEv5QswIfftFRU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugExternalVideoError() {
  console.log('🔍 Debugging external video error...\n');
  
  try {
    // First, check if we can get the current session
    console.log('1. Checking current session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Session error:', sessionError.message);
      return;
    }
    
    if (!session) {
      console.log('⚠️  No active session - you need to be logged in to add videos');
      console.log('   Please log in through the admin panel first');
      return;
    }
    
    console.log('✅ Session active for user:', session.user?.email || session.user?.id);
    
    // Now let's try to reproduce the exact error by inserting external video data
    console.log('\n2. Testing external video insert with exact data structure...');
    
    // This is the exact data structure that VideosManager is trying to insert
    const externalVideoData = {
      url: 'https://www.youtube.com/watch?v=test123',
      title: 'Test External Video',
      category: 'External Link',
      description: 'External video link',
      filename: null
    };
    
    console.log('   Inserting data:', JSON.stringify(externalVideoData, null, 2));
    
    // Try the insert with the authenticated client
    const { data, error } = await supabase
      .from('media')
      .insert(externalVideoData)
      .select();
      
    if (error) {
      console.log('❌ Insert failed:', error.message);
      
      // Analyze the specific error
      if (error.message.includes('null value in column')) {
        console.log('   🔍 This is a NULL CONSTRAINT error');
        console.log('   The database is rejecting NULL values for a column that should accept them');
        
        // Let's check which column specifically
        const nullValueColumns = Object.keys(externalVideoData).filter(key => externalVideoData[key] === null);
        console.log('   Columns with NULL values:', nullValueColumns);
        
        console.log('\n   💡 SOLUTION:');
        console.log('   Try inserting with an empty string instead of null for the filename:');
        const modifiedData = { ...externalVideoData, filename: '' };
        console.log('   Modified data:', JSON.stringify(modifiedData, null, 2));
      } else if (error.message.includes('violates row-level security')) {
        console.log('   🔍 This is an AUTHENTICATION error');
        console.log('   Even though we have a session, there might be an RLS policy issue');
      } else {
        console.log('   🔍 This is an unexpected database error');
      }
      
      return;
    }
    
    console.log('✅ Insert succeeded!');
    console.log('   Inserted record ID:', data[0]?.id);
    
    // Clean up the test record
    if (data && data[0]) {
      console.log('\n3. Cleaning up test record...');
      const { error: deleteError } = await supabase
        .from('media')
        .delete()
        .eq('id', data[0].id);
        
      if (deleteError) {
        console.log('⚠️  Warning: Could not clean up test record:', deleteError.message);
      } else {
        console.log('✅ Test record cleaned up successfully');
      }
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
  
  console.log('\n📋 Debug complete');
  console.log('\nIf you\'re still seeing "Database error: Please try again or contact support"');
  console.log('it\'s likely because the filename column has a NOT NULL constraint.');
  console.log('Try modifying the VideosManager.tsx to use an empty string instead of null for filename.');
}

// Run the debug
debugExternalVideoError();