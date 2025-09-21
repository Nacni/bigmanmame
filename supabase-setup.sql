-- 🚀 SUPABASE SETUP FOR ADMIN PANEL
-- Copy and paste this ENTIRE script into your Supabase SQL Editor
-- Then click "RUN" to execute all commands

-- 1. Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  author_id UUID REFERENCES auth.users(id)
);

-- 2. Create media table
CREATE TABLE IF NOT EXISTS media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create storage bucket for media files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Enable Row Level Security
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- 5. Create security policies for articles
CREATE POLICY "Users can manage their own articles" ON articles
  FOR ALL USING (auth.uid() = author_id);

CREATE POLICY "Anyone can read published articles" ON articles
  FOR SELECT USING (status = 'published');

-- 6. Create security policies for media
CREATE POLICY "Authenticated users can manage media" ON media
  FOR ALL USING (auth.uid() IS NOT NULL);

-- 7. Create storage policies
CREATE POLICY "Authenticated users can upload media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view media" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

CREATE POLICY "Authenticated users can delete media" ON storage.objects
  FOR DELETE USING (bucket_id = 'media' AND auth.uid() IS NOT NULL);

-- 8. Create auto-update function for timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Create trigger for auto-updating timestamps
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at 
  BEFORE UPDATE ON articles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 10. Insert a welcome article (will be created when first user signs up)
-- This will be inserted automatically when you create your first admin user

-- ✅ SETUP COMPLETE!
-- Next steps:
-- 1. Go to Authentication > Users in your Supabase dashboard
-- 2. Click "Invite a user" or "Add user"
-- 3. Enter your client's email address
-- 4. They will receive an email to set their password
-- 5. They can then login at: https://cabdallaxussencali.vercel.app/login