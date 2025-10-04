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
  tags TEXT[],
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  author_id UUID REFERENCES auth.users(id)
);

-- 2. Create media table
CREATE TABLE IF NOT EXISTS media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT,
  url TEXT NOT NULL,
  alt_text TEXT,
  title TEXT,
  description TEXT,
  category TEXT DEFAULT 'General',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create comments table (modified to support both article and video comments)
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  media_id UUID REFERENCES media(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  content TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Ensure either article_id or media_id is set, but not both
  CONSTRAINT one_parent CHECK (
    (article_id IS NOT NULL AND media_id IS NULL) OR 
    (article_id IS NULL AND media_id IS NOT NULL)
  )
);

-- 4. Create page_content table for text content management
CREATE TABLE IF NOT EXISTS page_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_name TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create storage bucket for media files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Enable Row Level Security
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;

-- 7. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage their own articles" ON articles;
DROP POLICY IF EXISTS "Anyone can read published articles" ON articles;
DROP POLICY IF EXISTS "Authenticated users can manage media" ON media;
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can insert comments" ON comments;
DROP POLICY IF EXISTS "Users can manage comments on their articles" ON comments;
DROP POLICY IF EXISTS "Users can manage comments on their videos" ON comments;
DROP POLICY IF EXISTS "Anyone can read approved comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can manage page content" ON page_content;

-- 8. Create security policies for articles
CREATE POLICY "Users can manage their own articles" ON articles
  FOR ALL USING (auth.uid() = author_id);

CREATE POLICY "Anyone can read published articles" ON articles
  FOR SELECT USING (status = 'published');

-- 9. Create security policies for media
CREATE POLICY "Authenticated users can manage media" ON media
  FOR ALL USING (auth.uid() IS NOT NULL);

-- 10. Create security policies for comments
CREATE POLICY "Anyone can insert comments" ON comments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can manage comments on their articles" ON comments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM articles 
      WHERE articles.id = comments.article_id 
      AND articles.author_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage comments on their videos" ON comments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM media 
      WHERE media.id = comments.media_id 
      AND auth.uid() IS NOT NULL
    )
  );

CREATE POLICY "Anyone can read approved comments" ON comments
  FOR SELECT USING (approved = true);

-- 11. Create security policies for page_content
CREATE POLICY "Authenticated users can manage page content" ON page_content
  FOR ALL USING (auth.uid() IS NOT NULL);

-- 12. Create storage policies
CREATE POLICY "Authenticated users can upload media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view media" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

CREATE POLICY "Authenticated users can delete media" ON storage.objects
  FOR DELETE USING (bucket_id = 'media' AND auth.uid() IS NOT NULL);

-- 13. Create auto-update function for timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 14. Create trigger for auto-updating timestamps
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at 
  BEFORE UPDATE ON articles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 15. Insert a welcome article (will be created when first user signs up)
-- This will be inserted automatically when you create your first admin user

-- ✅ SETUP COMPLETE!
-- Next steps:
-- 1. Go to Authentication > Users in your Supabase dashboard
-- 2. Click "Invite a user" or "Add user"
-- 3. Enter your client's email address
-- 4. They will receive an email to set their password
-- 5. They can then login at: https://cabdallaxussencali.vercel.app/login