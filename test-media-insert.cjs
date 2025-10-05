const { createClient } = require('@supabase/supabase-js');

// Configuration - Using the same credentials as in your project
const supabaseUrl = 'https://prlcqrminsonibdsnzmy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybGNxcm1pbnNvbmliZHNuem15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzgzNzcsImV4cCI6MjA3MzYxNDM3N30.pCIQNH4jvlfAWIr1i1WPHWoPzHwxjsEv5QswIfftFRU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testMediaInsert() {
  console.log('🔍 Testing media insert operations...\n');
  
  try {
    console.log('1. Testing insert with explicit null filename...');
    const testRecord1 = {
      url: 'https://example.com/test-video1.mp4',
      title: 'Test Video 1',
      filename: null,
      category: 'Test'
    };
    
    const { data: data1, error: error1 } = await supabase
      .from('media')
      .insert(testRecord1)
      .select();
    
    if (error1) {
      console.error('❌ Insert with null filename failed:', error1.message);
      console.error('   Error code:', error1.code);
    } else {
      console.log('✅ Insert with null filename successful');
      console.log('   Data:', JSON.stringify(data1, null, 2));
      
      // Clean up
      if (data1 && data1[0]) {
        await supabase.from('media').delete().eq('id', data1[0].id);
        console.log('   Cleaned up test record');
      }
    }
    
    console.log('\n2. Testing insert without filename field...');
    const testRecord2 = {
      url: 'https://example.com/test-video2.mp4',
      title: 'Test Video 2',
      category: 'Test'
    };
    
    const { data: data2, error: error2 } = await supabase
      .from('media')
      .insert(testRecord2)
      .select();
    
    if (error2) {
      console.error('❌ Insert without filename field failed:', error2.message);
      console.error('   Error code:', error2.code);
    } else {
      console.log('✅ Insert without filename field successful');
      console.log('   Data:', JSON.stringify(data2, null, 2));
      
      // Clean up
      if (data2 && data2[0]) {
        await supabase.from('media').delete().eq('id', data2[0].id);
        console.log('   Cleaned up test record');
      }
    }
    
    console.log('\n3. Testing insert with empty string filename...');
    const testRecord3 = {
      url: 'https://example.com/test-video3.mp4',
      title: 'Test Video 3',
      filename: '',
      category: 'Test'
    };
    
    const { data: data3, error: error3 } = await supabase
      .from('media')
      .insert(testRecord3)
      .select();
    
    if (error3) {
      console.error('❌ Insert with empty filename failed:', error3.message);
      console.error('   Error code:', error3.code);
    } else {
      console.log('✅ Insert with empty filename successful');
      console.log('   Data:', JSON.stringify(data3, null, 2));
      
      // Clean up
      if (data3 && data3[0]) {
        await supabase.from('media').delete().eq('id', data3[0].id);
        console.log('   Cleaned up test record');
      }
    }
    
    console.log('\n📋 Test complete. If any inserts failed, the error details above should help identify the issue.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testMediaInsert();