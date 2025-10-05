const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://prlcqrminsonibdsnzmy.supabase.co';
// Using the anon key for read-only access to check table structure
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybGNxcm1pbnNvbmliZHNuem15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzgzNzcsImV4cCI6MjA3MzYxNDM3N30.pCIQNH4jvlfAWIr1i1WPHWoPzHwxjsEv5QswIfftFRU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseMediaTable() {
  console.log('🔍 Diagnosing media table structure...\n');
  
  try {
    // Check if we can access the table structure
    console.log('1. Checking table columns...');
    
    // Try to get a sample record to understand the structure
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .limit(1);
      
    if (error) {
      console.log('❌ Error accessing media table:', error.message);
      if (error.message.includes('relation "media" does not exist')) {
        console.log('   The media table does not exist in the database');
      }
      return;
    }
    
    console.log('✅ Successfully accessed media table');
    
    if (data && data.length > 0) {
      console.log('\n2. Sample record structure:');
      Object.keys(data[0]).forEach(key => {
        console.log(`   ${key}: ${typeof data[0][key]} = ${data[0][key]}`);
      });
    } else {
      console.log('\n2. Table is empty or no records found');
    }
    
    // Try to get table info using Supabase meta tables
    console.log('\n3. Checking table schema...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'media')
      .order('ordinal_position');
      
    if (columnsError) {
      console.log('❌ Error getting column info:', columnsError.message);
    } else if (columns && columns.length > 0) {
      console.log('✅ Media table columns:');
      columns.forEach(col => {
        console.log(`   ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULLABLE' : 'NOT NULL'}`);
      });
    }
    
    // Test inserting a minimal record
    console.log('\n4. Testing minimal insert...');
    const testData = {
      url: 'https://example.com/test-video.mp4',
      title: 'Test Video',
      category: 'Test',
      filename: null
    };
    
    console.log('   Inserting test data:', testData);
    
    // Try to insert without auth (should fail with RLS)
    const { data: insertData, error: insertError } = await supabase
      .from('media')
      .insert(testData)
      .select();
      
    if (insertError) {
      console.log('❌ Insert failed (expected without auth):', insertError.message);
      if (insertError.message.includes('violates row-level security')) {
        console.log('   This confirms RLS is enabled - you must be authenticated to insert');
      } else if (insertError.message.includes('null value in column')) {
        console.log('   This indicates a NOT NULL constraint on a column that we\'re setting to null');
        // Try to identify which column
        const nullColumns = Object.keys(testData).filter(key => testData[key] === null);
        if (nullColumns.length > 0) {
          console.log(`   Suspected columns with NOT NULL constraints: ${nullColumns.join(', ')}`);
        }
      }
    } else {
      console.log('✅ Insert succeeded');
      // Clean up
      if (insertData && insertData[0]) {
        await supabase.from('media').delete().eq('id', insertData[0].id);
        console.log('   Test record cleaned up');
      }
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
  
  console.log('\n📋 Diagnostic complete');
}

// Run the diagnostic
diagnoseMediaTable();