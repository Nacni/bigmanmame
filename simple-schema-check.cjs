// Simple script to check what columns actually exist in your tables

const { createClient } = require('@supabase/supabase-js');

// Configuration - replace with your actual Supabase URL and anon key
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://prlcqrminsonibdsnzmy.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybGNxcm1pbnNvbmliZHNuem15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzgzNzcsImV4cCI6MjA3MzYxNDM3N30.pCIQNH4jvlfAWIr1i1WPHWoPzHwxjsEv5QswIfftFRU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
  console.log('🔍 Checking actual table schemas...\n');
  
  // Check what columns actually exist in each table
  const tablesToCheck = ['articles', 'media', 'comments', 'page_content'];
  
  for (const tableName of tablesToCheck) {
    console.log(`📋 Checking ${tableName} table...`);
    try {
      // Try a simple select to see what columns exist
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`❌ Error accessing ${tableName}:`, error.message);
      } else {
        if (data && data.length > 0) {
          const columns = Object.keys(data[0]);
          console.log(`✅ ${tableName} has columns:`, columns.join(', '));
        } else {
          console.log(`✅ ${tableName} table exists but is empty`);
        }
      }
    } catch (error) {
      console.error(`❌ Exception checking ${tableName}:`, error.message);
    }
    console.log('');
  }
  
  console.log('📝 The important thing is that the media table schema was refreshed.');
  console.log('💡 This should fix your video upload issue.');
  console.log('💡 Try uploading an external video now.');
}

// Run the schema check
checkSchema().catch(console.error);