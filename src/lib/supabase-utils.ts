import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';

/**
 * Utility functions for handling Supabase operations with better error handling
 * and schema cache management
 */

/**
 * Refresh Supabase schema cache by querying all tables with comprehensive column selection
 */
export const refreshSchemaCache = async (): Promise<boolean> => {
  try {
    console.log('Refreshing schema cache...');
    
    // Query all tables with comprehensive column selection to refresh schema cache
    const articlesResult = await supabase.from('articles').select('id, title, slug, content, status, created_at, updated_at, author_id, tags, featured_image, excerpt').limit(1);
    console.log('Articles table schema refreshed:', articlesResult);
    
    const mediaResult = await supabase.from('media').select('id, url, title, filename, category, description, alt_text, created_at').limit(1);
    console.log('Media table schema refreshed:', mediaResult);
    
    const commentsResult = await supabase.from('comments').select('id, article_id, media_id, name, email, content, approved, created_at').limit(1);
    console.log('Comments table schema refreshed:', commentsResult);
    
    const pageContentResult = await supabase.from('page_content').select('id, page_name, content, updated_at').limit(1);
    console.log('Page content table schema refreshed:', pageContentResult);
    
    // Additional query to ensure we have the latest schema for media table
    // This specifically checks the constraint handling
    const filenameCheck = await supabase.from('media').select('filename').limit(1);
    console.log('Media filename constraint check:', filenameCheck);
    
    // Check for any errors in the queries
    if (articlesResult.error) throw articlesResult.error;
    if (mediaResult.error) throw mediaResult.error;
    if (commentsResult.error) throw commentsResult.error;
    if (pageContentResult.error) throw pageContentResult.error;
    if (filenameCheck.error) throw filenameCheck.error;
    
    console.log('Schema cache refreshed successfully');
    return true;
  } catch (error) {
    console.error('Schema refresh error:', error);
    return false;
  }
};

/**
 * Execute a Supabase operation with retry logic and schema cache refresh
 * @param operation - The Supabase operation to execute
 * @param retries - Number of retries (default: 3)
 * @returns The result of the operation
 */
export const executeWithRetry = async <T>(
  operation: () => Promise<T>,
  retries: number = 3
): Promise<T> => {
  let lastError: any = null;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // If it's a schema cache error, refresh the cache
      if (error.message && (
        error.message.includes('schema cache') || 
        error.message.includes('column') || 
        error.message.includes('Could not find the')
      )) {
        console.log(`Schema cache error detected, refreshing cache (attempt ${i + 1}/${retries})`);
        await refreshSchemaCache();
        
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        // For other errors, wait before retrying
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }
  
  // If we've exhausted all retries, throw the last error
  throw lastError;
};

/**
 * Insert data into a Supabase table with enhanced error handling
 * @param table - The table name
 * @param data - The data to insert
 * @returns The result of the insert operation
 */
export const insertWithSchemaHandling = async <T>(
  table: string,
  data: any
): Promise<any> => {
  return await executeWithRetry(async () => {
    const result = await supabase.from(table).insert(data);
    
    if (result.error) {
      throw result.error;
    }
    
    return result;
  });
};

/**
 * Update data in a Supabase table with enhanced error handling
 * @param table - The table name
 * @param data - The data to update
 * @param match - The match criteria
 * @returns The result of the update operation
 */
export const updateWithSchemaHandling = async <T>(
  table: string,
  data: any,
  match: any
): Promise<any> => {
  return await executeWithRetry(async () => {
    const result = await supabase.from(table).update(data).match(match);
    
    if (result.error) {
      throw result.error;
    }
    
    return result;
  });
};

/**
 * Delete data from a Supabase table with enhanced error handling
 * @param table - The table name
 * @param match - The match criteria
 * @returns The result of the delete operation
 */
export const deleteWithSchemaHandling = async <T>(
  table: string,
  match: any
): Promise<any> => {
  return await executeWithRetry(async () => {
    const result = await supabase.from(table).delete().match(match);
    
    if (result.error) {
      throw result.error;
    }
    
    return result;
  });
};