# Video Thumbnail Management Scripts

This directory contains scripts to manage video thumbnails in the Somali Leader Spark application.

## Scripts

### 1. assignThumbnails.ts
Assigns specific thumbnails to the first three videos in the database to ensure they keep their original thumbnails.

### 2. updateFirstThreeThumbnails.ts
Updates the first three videos in the database with specific thumbnails from Supabase storage.

### 3. uploadThumbnails.ts
Uploads thumbnail images to Supabase storage to ensure the URLs used in the database are valid.

## Usage

### Running the scripts

1. Make sure you have the required environment variables set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

2. Install dependencies:
   ```bash
   npm install @supabase/supabase-js
   ```

3. Run the scripts:
   ```bash
   npx ts-node src/scripts/uploadThumbnails.ts
   npx ts-node src/scripts/updateFirstThreeThumbnails.ts
   ```

## How it works

1. The frontend now uses different thumbnails for the first three videos:
   - First video: `video-petroleum-thumb.jpg`
   - Second video: `video-southwest-thumb.jpg`
   - Third video: `video-election-thumb.jpg`

2. For all other videos, a default thumbnail is used.

3. The database stores thumbnail URLs in the `thumbnail_url` column of the `media` table.

4. When a video is displayed, the application checks:
   - First, if the video has a specific thumbnail assigned
   - Second, if the video has a thumbnail URL in the database
   - Finally, falls back to a default thumbnail