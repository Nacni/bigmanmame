// Script to check database constraints and table information

const { createClient } = require('@supabase/supabase-js');

// Configuration - replace with your actual Supabase URL and anon key
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://prlcqrminsonibdsnzmy.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybGNxcm1pbnNvbmliZHNuem15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzgzNzcsImV4cCI6MjA3MzYxNDM3N30.pCIQNH4jvlfAWIr1i1WPHWoPzHwxjsEv5QswIfftFRU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkConstraints() {
  console.log('🔍 Checking database constraints and table information...\n');
  
  try {
    // Check media table structure and constraints
    console.log('📋 Checking media table structure...');
    
    // Try to get table info
    const { data: tableInfo, error: tableError } = await supabase
      .from('media')
      .select('*')
      .limit(0); // Just get structure
    
    if (tableError) {
      console.error('❌ Error getting media table info:', tableError.message);
    } else {
      console.log('✅ Media table structure accessible');
    }
    
    // Try to insert a test external video with minimal data
    console.log('\n🧪 Testing external video insertion with minimal data...');
    const testVideo = {
      url: 'https://example.com/test-video.mp4',
      title: 'Test External Video'
      // Note: Not including filename to test if it's required
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('media')
      .insert([testVideo])
      .select();
    
    if (insertError) {
      console.error('❌ Error inserting test video:', insertError.message);
      console.log('💡 This confirms the constraint issue');
      
      // Try again with a filename
      console.log('\n🧪 Testing with filename included...');
      const testVideoWithFilename = {
        url: 'https://example.com/test-video2.mp4',
        title: 'Test External Video 2',
        filename: 'external-video' // Adding filename to test
      };
      
      const { data: insertData2, error: insertError2 } = await supabase
        .from('media')
        .insert([testVideoWithFilename])
        .select();
      
      if (insertError2) {
        console.error('❌ Error inserting test video with filename:', insertError2.message);
      } else {
        console.log('✅ Successfully inserted test video with filename');
        // Clean up test data
        if (insertData2 && insertData2[0]) {
          await supabase.from('media').delete().eq('id', insertData2[0].id);
          console.log('🧹 Cleaned up test video');
        }
      }
    } else {
      console.log('✅ Successfully inserted test video without filename');
      // Clean up test data
      if (insertData && insertData[0]) {
        await supabase.from('media').delete().eq('id', insertData[0].id);
        console.log('🧹 Cleaned up test video');
      }
    }
    
  } catch (error) {
    console.error('❌ Exception during constraint check:', error.message);
  }
  
  console.log('\n📝 Summary:');
  console.log('The issue is that the database is requiring a filename value for external videos.');
  console.log('Solution: Include a filename value when inserting external videos.');
}

// Run the constraint check
checkConstraints().catch(console.error);