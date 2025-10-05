# Troubleshooting Guide: Video Upload Issues

## Problem: "Failed to add external video: Could not find the 'category' column of 'media' in the schema cache"

This error occurs when the Supabase client's schema cache doesn't have the complete schema for the `media` table, specifically missing the `category` column.

## Solutions:

### 1. Refresh Schema Cache Through Admin Panel

1. Navigate to the Videos Management page in your admin panel
2. Click the "Refresh Schema" button in the top right corner
3. Wait for the success message
4. Try adding your external video again

### 2. Manual Schema Cache Refresh

If the above doesn't work, you can manually refresh the schema cache:

1. Open your browser's developer tools (F12)
2. Go to the Console tab
3. Run the following commands:

```javascript
// Refresh schema cache manually
async function refreshSchema() {
  try {
    const { supabase } = await import('./src/lib/supabase');
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
```

### 3. Restart Development Server

Sometimes a simple restart can resolve schema cache issues:

1. Stop your development server (Ctrl+C)
2. Clear any build caches
3. Restart the development server

### 4. Check Database Schema

Ensure your database has the correct schema by running the setup script:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the `supabase-setup.sql` script
4. Verify the `media` table has a `category` column

### 5. Update Supabase Client

If issues persist, try updating the Supabase client:

```bash
npm install @supabase/supabase-js@latest
```

## Prevention

The system now includes automatic schema cache refresh when schema-related errors are detected. This should prevent most occurrences of this issue in the future.

## Additional Notes

- The schema cache issue typically occurs after database schema changes
- The system now includes retry logic with automatic schema refresh
- All video management operations now use enhanced error handling