const { createClient } = require('@supabase/supabase-js');

// Configuration - Replace with your actual Supabase credentials
const supabaseUrl = 'https://prlcqrminsonibdsnzmy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybGNxcm1pbnNvbmliZHNuem15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzgzNzcsImV4cCI6MjA3MzYxNDM3N30.pCIQNH4jvlfAWIr1i1WPHWoPzHwxjsEv5QswIfftFRU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkMediaConstraints() {
  console.log('🔍 Checking media table constraints...\n');
  
  try {
    // Check table info
    console.log('1. Checking media table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('media')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Error accessing media table:', tableError.message);
      return;
    }
    
    console.log('✅ Successfully accessed media table');
    
    // Try to insert a test record with minimal data
    console.log('\n2. Testing insert with minimal data...');
    const testRecord = {
      url: 'https://example.com/test-video.mp4',
      title: 'Test Video'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('media')
      .insert(testRecord)
      .select();
    
    if (insertError) {
      console.error('❌ Insert failed:', insertError.message);
      console.log('   This might be due to RLS policies or triggers');
    } else {
      console.log('✅ Insert successful');
      console.log('   Inserted record:', insertData);
      
      // Clean up test record if successful
      if (insertData && insertData[0]) {
        await supabase.from('media').delete().eq('id', insertData[0].id);
        console.log('   Cleaned up test record');
      }
    }
    
    // Try to insert a test record with explicit null filename
    console.log('\n3. Testing insert with explicit null filename...');
    const testRecordWithNull = {
      url: 'https://example.com/test-video2.mp4',
      title: 'Test Video 2',
      filename: null
    };
    
    const { data: insertData2, error: insertError2 } = await supabase
      .from('media')
      .insert(testRecordWithNull)
      .select();
    
    if (insertError2) {
      console.error('❌ Insert with null filename failed:', insertError2.message);
    } else {
      console.log('✅ Insert with null filename successful');
      console.log('   Inserted record:', insertData2);
      
      // Clean up test record if successful
      if (insertData2 && insertData2[0]) {
        await supabase.from('media').delete().eq('id', insertData2[0].id);
        console.log('   Cleaned up test record');
      }
    }
    
    console.log('\n📋 Media table structure from schema:');
    console.log('   id: UUID (Primary Key)');
    console.log('   filename: TEXT (Nullable)');
    console.log('   url: TEXT (Not Null)');
    console.log('   alt_text: TEXT (Nullable)');
    console.log('   title: TEXT (Nullable)');
    console.log('   description: TEXT (Nullable)');
    console.log('   category: TEXT (Nullable, Default: General)');
    console.log('   created_at: TIMESTAMP WITH TIME ZONE (Default: NOW())');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
  
  console.log('\n🏁 Diagnostic complete');
}

checkMediaConstraints();