-- Update media table policies to allow public read access

-- First, enable RLS if not already enabled
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can read media" ON media;
DROP POLICY IF EXISTS "Authenticated users can manage media" ON media;

-- Create policy for public read access
CREATE POLICY "Public can read media" ON media
  FOR SELECT USING (true);

-- Create policy for authenticated users to manage media
CREATE POLICY "Authenticated users can manage media" ON media
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Verify the policies
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'media';