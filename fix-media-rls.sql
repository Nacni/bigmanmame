-- Enable RLS on media table
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can read media" ON media;
DROP POLICY IF EXISTS "Authenticated users can manage media" ON media;

-- Create policy for public read access
CREATE POLICY "Public can read media" ON media
  FOR SELECT USING (true);

-- Ensure authenticated users can still manage media
CREATE POLICY "Authenticated users can manage media" ON media
  FOR ALL USING (auth.uid() IS NOT NULL);