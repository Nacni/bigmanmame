const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with the correct keys
const supabaseUrl = 'https://prlcqrminsonibdsnzmy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybGNxcm1pbnNvbmliZHNuem15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzgzNzcsImV4cCI6MjA3MzYxNDM3N30.pCIQNH4jvlfAWIr1i1WPHWoPzHwxjsEv5QswIfftFRU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseSchema() {
  console.log('🔍 Checking database schema for media table...\n');
  
  try {
    // Try to get table information from information_schema
    const { data, error } = await supabase
      .rpc('execute_sql', {
        sql: `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_name = 'media' 
          ORDER BY ordinal_position
        `
      });
      
    if (error) {
      console.log('❌ Error getting schema info:', error.message);
      // Try alternative approach
      console.log('\nTrying alternative approach...');
      
      // Get a sample record and check its structure
      const { data: sampleData, error: sampleError } = await supabase
        .from('media')
        .select('*')
        .limit(1);
        
      if (sampleError) {
        console.log('❌ Error getting sample data:', sampleError.message);
        return;
      }
      
      if (sampleData && sampleData.length > 0) {
        console.log('✅ Sample record structure:');
        Object.keys(sampleData[0]).forEach(key => {
          console.log(`   ${key}: ${typeof sampleData[0][key]}`);
        });
      }
      return;
    }
    
    if (data) {
      console.log('✅ Media table schema:');
      data.forEach(column => {
        console.log(`   ${column.column_name} (${column.data_type}) ${column.is_nullable === 'YES' ? 'NULLABLE' : 'NOT NULL'}`);
      });
      
      // Check specifically for thumbnail-related columns
      const thumbnailColumns = data.filter(column => 
        column.column_name.includes('thumbnail') || 
        column.column_name.includes('image') || 
        column.column_name.includes('thumb')
      );
      
      if (thumbnailColumns.length > 0) {
        console.log('\n🖼️  Thumbnail-related columns found:');
        thumbnailColumns.forEach(column => {
          console.log(`   ${column.column_name} (${column.data_type})`);
        });
      } else {
        console.log('\n⚠️  No thumbnail-related columns found in the media table schema');
      }
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
  
  console.log('\n📋 Next steps:');
  console.log('   1. If thumbnail_url column exists in database, update the Media interface');
  console.log('   2. If not, you may need to add it to the database schema');
  console.log('   3. Update the Videos.tsx component to use the correct field name');
}

// Run the check
checkDatabaseSchema();