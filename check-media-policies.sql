-- Check current policies on media table
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'media';

-- Check if RLS is enabled
SELECT relname, relrowsecurity, relforcerowsecurity
FROM pg_class 
WHERE relname = 'media';

-- Check current data in media table
SELECT COUNT(*) as total_records,
       COUNT(CASE WHEN filename IS NULL THEN 1 END) as external_videos,
       COUNT(CASE WHEN filename IS NOT NULL AND filename ~ '\.(mp4|avi|mov|wmv|flv|webm)$' THEN 1 END) as video_files,
       COUNT(CASE WHEN filename IS NOT NULL AND filename !~ '\.(mp4|avi|mov|wmv|flv|webm)$' THEN 1 END) as other_files
FROM media;