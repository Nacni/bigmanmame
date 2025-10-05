const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with the correct keys
const supabaseUrl = 'https://prlcqrminsonibdsnzmy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybGNxcm1pbnNvbmliZHNuem15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzgzNzcsImV4cCI6MjA3MzYxNDM3N30.pCIQNH4jvlfAWIr1i1WPHWoPzHwxjsEv5QswIfftFRU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkThumbnailField() {
  console.log('🔍 Checking if thumbnail_url field exists in media table...\n');
  
  try {
    // Try to get column information
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .limit(1);
      
    if (error) {
      console.log('❌ Error accessing media table:', error.message);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('✅ Media table accessible');
      console.log('\n📋 Available fields in media table:');
      Object.keys(data[0]).forEach(key => {
        console.log(`   ${key}: ${typeof data[0][key]}`);
        if (data[0][key] !== null && data[0][key] !== undefined) {
          console.log(`     Sample value: ${data[0][key]}`);
        }
      });
      
      // Check specifically for thumbnail fields
      const thumbnailFields = Object.keys(data[0]).filter(key => 
        key.includes('thumbnail') || key.includes('image') || key.includes('thumb')
      );
      
      if (thumbnailFields.length > 0) {
        console.log('\n🖼️  Thumbnail-related fields found:');
        thumbnailFields.forEach(field => {
          console.log(`   ${field}`);
        });
      } else {
        console.log('\n⚠️  No thumbnail-related fields found in the media table');
        console.log('   Thumbnails might be stored in a different way');
      }
    } else {
      console.log('⚠️  Media table is empty or no records found');
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
  
  console.log('\n📋 If thumbnail_url field exists but is not in the Media interface,');
  console.log('   you should update the Media interface in src/lib/supabase.ts to include it.');
}

// Run the check
checkThumbnailField();