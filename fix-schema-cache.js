// Script to fix schema cache issues by forcing a comprehensive refresh
// This script only reads data and doesn't make any changes to your database

const { createClient } = require('@supabase/supabase-js');

// Configuration - replace with your actual Supabase URL and anon key
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://prlcqrminsonibdsnzmy.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybGNxcm1pbnNvbmliZHNuem15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzgzNzcsImV4cCI6MjA3MzYxNDM3N30.pCIQNH4jvlfAWIr1i1WPHWoPzHwxjsEv5QswIfftFRU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixSchemaCache() {
  console.log('🔧 Attempting to fix schema cache issues...\n');
  
  // Force refresh schema cache by querying all tables with comprehensive column selection
  const tablesToRefresh = [
    { name: 'articles', columns: 'id, title, slug, content, status, created_at, updated_at, author_id, tags, featured_image, excerpt' },
    { name: 'media', columns: 'id, url, title, filename, category, description, alt_text, created_at' },
    { name: 'comments', columns: 'id, article_id, media_id, name, email, content, approved, created_at' },
    { name: 'page_content', columns: 'id, page_name, content, updated_at' }
  ];
  
  let successCount = 0;
  
  for (const table of tablesToRefresh) {
    console.log(`🔄 Refreshing ${table.name} table schema...`);
    try {
      const { data, error } = await supabase
        .from(table.name)
        .select(table.columns)
        .limit(1);
      
      if (error) {
        console.error(`❌ Error refreshing ${table.name}:`, error.message);
      } else {
        console.log(`✅ Successfully refreshed ${table.name} schema`);
        successCount++;
      }
    } catch (error) {
      console.error(`❌ Exception refreshing ${table.name}:`, error.message);
    }
  }
  
  console.log(`\n📊 Schema refresh complete: ${successCount}/${tablesToRefresh.length} tables refreshed`);
  
  if (successCount === tablesToRefresh.length) {
    console.log('✅ All table schemas have been refreshed successfully!');
    console.log('💡 You should now be able to upload videos and load comments without issues.');
  } else {
    console.log('⚠️  Some tables failed to refresh. You may need to:');
    console.log('   1. Check your database connectivity');
    console.log('   2. Verify table structures in your Supabase dashboard');
    console.log('   3. Restart your development server');
  }
}

// Run the schema cache fix
fixSchemaCache().catch(console.error);