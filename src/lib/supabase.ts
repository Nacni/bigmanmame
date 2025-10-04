import { createClient } from '@supabase/supabase-js';

// Fallback values for Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://prlcqrminsonibdsnzmy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybGNxcm1pbnNvbmliZHNuem15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzgzNzcsImV4cCI6MjA3MzYxNDM3N30.pCIQNH4jvlfAWIr1i1WPHWoPzHwxjsEv5QswIfftFRU';

// Create Supabase client with error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Types for our database tables
export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
  author_id: string;
  tags?: string[];
}

export interface Media {
  id: string;
  filename?: string;
  url: string;
  alt_text?: string;
  title?: string;
  description?: string;
  category?: string;
  created_at: string;
}

export interface Comment {
  id: string;
  article_id?: string;
  media_id?: string;
  name: string;
  email: string;
  content: string;
  approved: boolean;
  created_at: string;
}

export interface PageContent {
  id: string;
  page_name: string;
  content: string;
  updated_at: string;
}