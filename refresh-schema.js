// Script to manually refresh Supabase schema cache
const { createClient } = require('@supabase/supabase-js');

// Replace with your Supabase URL and anon key
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://prlcqrminsonibdsnzmy.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybGNxcm1pbnNvbmliZHNuem15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzgzNzcsImV4cCI6MjA3MzYxNDM3N30.pCIQNH4jvlfAWIr1i1WPHWoPzHwxjsEv5QswIfftFRU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function refreshSchema() {
  console.log('Refreshing Supabase schema cache...');
  
  try {
    // Query all tables with more comprehensive column selection to refresh schema cache
    await supabase.from('articles').select('id, title, content, status').limit(1);
    await supabase.from('media').select('id, url, title, filename, category, description').limit(1);
    await supabase.from('comments').select('id, content, approved').limit(1);
    await supabase.from('page_content').select('id, page_name, content').limit(1);
    
    console.log('Schema cache refreshed successfully!');
  } catch (error) {
    console.error('Error refreshing schema cache:', error);
  }
}

refreshSchema();