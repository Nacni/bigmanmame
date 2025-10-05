const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://prlcqrminsonibdsnzmy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybGNxcm1pbnNvbmliZHNuem15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY1NzQ5MDcsImV4cCI6MjA0MjE1MDkwN30.LqH0S069kK0fJyrrR07qZ1yJ4bZJZJzJzJzJzJzJzJz';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testExternalVideoInsert() {
  console.log('🔍 Testing external video insert...');
  
  // Test data for external video
  const externalVideoData = {
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    title: 'Test External Video',
    category: 'External Link',
    filename: null,
    description: 'Test external video link'
  };
  
  try {
    console.log('Inserting external video data:', externalVideoData);
    
    // Try to insert external video
    const { data, error } = await supabase
      .from('media')
      .insert(externalVideoData)
      .select();
      
    if (error) {
      console.error('❌ Insert failed:', error.message);
      if (error.message.includes('violates row-level security')) {
        console.log('This is expected if you\'re not authenticated');
        console.log('Use the admin panel to add videos instead');
      }
      return;
    }
    
    console.log('✅ External video inserted successfully:', data);
    
    // Clean up - delete the test video
    if (data && data[0]) {
      const { error: deleteError } = await supabase
        .from('media')
        .delete()
        .eq('id', data[0].id);
        
      if (deleteError) {
        console.error('Warning: Could not clean up test video:', deleteError.message);
      } else {
        console.log('✅ Test video cleaned up successfully');
      }
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

// Run the test
testExternalVideoInsert();

async function testExternalVideo() {
  console.log('🔍 Testing external video insertion...\n');
  
  try {
    // Test inserting an external video with NULL filename
    console.log('1. Testing external video with NULL filename...');
    const externalVideo1 = {
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'Test External Video (NULL filename)',
      filename: null,
      category: 'External',
      description: 'Test video with NULL filename'
    };
    
    const { data: data1, error: error1 } = await supabase
      .from('media')
      .insert(externalVideo1)
      .select();
    
    if (error1) {
      console.error('❌ Insert with NULL filename failed:', error1.message);
    } else {
      console.log('✅ Insert with NULL filename successful');
      console.log('   Data:', data1[0]);
      
      // Clean up
      if (data1 && data1[0]) {
        await supabase.from('media').delete().eq('id', data1[0].id);
        console.log('   Cleaned up test record');
      }
    }
    
    // Test inserting an external video with empty string filename
    console.log('\n2. Testing external video with empty string filename...');
    const externalVideo2 = {
      url: 'https://vimeo.com/123456789',
      title: 'Test External Video (Empty filename)',
      filename: '',
      category: 'External',
      description: 'Test video with empty filename'
    };
    
    const { data: data2, error: error2 } = await supabase
      .from('media')
      .insert(externalVideo2)
      .select();
    
    if (error2) {
      console.error('❌ Insert with empty filename failed:', error2.message);
    } else {
      console.log('✅ Insert with empty filename successful');
      console.log('   Data:', data2[0]);
      
      // Clean up
      if (data2 && data2[0]) {
        await supabase.from('media').delete().eq('id', data2[0].id);
        console.log('   Cleaned up test record');
      }
    }
    
    // Test inserting an external video without filename field
    console.log('\n3. Testing external video without filename field...');
    const externalVideo3 = {
      url: 'https://www.facebook.com/video.php?v=123456789',
      title: 'Test External Video (No filename field)',
      category: 'External',
      description: 'Test video without filename field'
    };
    
    const { data: data3, error: error3 } = await supabase
      .from('media')
      .insert(externalVideo3)
      .select();
    
    if (error3) {
      console.error('❌ Insert without filename field failed:', error3.message);
    } else {
      console.log('✅ Insert without filename field successful');
      console.log('   Data:', data3[0]);
      
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

testExternalVideo();