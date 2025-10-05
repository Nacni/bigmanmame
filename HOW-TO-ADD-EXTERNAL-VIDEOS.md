# How to Add External Videos to Your Website

## Overview
This guide explains how to add external video links (YouTube, Vimeo, Facebook, etc.) to your website through the admin panel.

## Steps to Add External Videos

### 1. Access the Admin Panel
- Go to your website's admin panel: `https://cabdallaxussencali.vercel.app/admin`
- Log in with your admin credentials

### 2. Navigate to Video Management
- Once logged in, click on "Videos" in the left sidebar menu
- You'll see the Video Management dashboard

### 3. Add an External Video
- Click the "Add Video" button (green button at the top)
- Select the "Add Link" tab
- Enter the video title (optional - will default to "External Video" if left blank)
- Enter the full video URL (must be a valid URL)
- Click "Add External Video"

### 4. Supported Platforms
You can add links from any platform, including:
- YouTube
- Vimeo
- Facebook
- Twitter
- Any direct video link

### 5. Viewing External Videos
- External videos will appear in the public videos page
- When users click on them, they will play in a modal window on your site
- The video will be embedded properly for YouTube and Vimeo links
- For other platforms, users will be directed to the original source

## Troubleshooting

### "You must be logged in" Error
If you see this error:
1. Make sure you're logged in to the admin panel
2. If you're already logged in, refresh the page
3. If the issue persists, log out and log back in

### "Failed to add video" Error
If you see this error:
1. Check that the URL is valid (starts with http:// or https://)
2. Make sure you're still logged in
3. Try refreshing the page and adding the video again

## Best Practices

1. **Always use the admin panel**: Don't try to add videos directly through code or database queries
2. **Use descriptive titles**: While optional, titles help users identify videos
3. **Test your links**: Make sure the video URLs work before adding them
4. **Check the public page**: After adding a video, visit the public videos page to ensure it appears correctly

## Video Identification
In both the admin panel and public pages:
- External videos are clearly marked with an "External" badge
- Uploaded videos show as "Uploaded"
- External videos open in a modal player when possible, or redirect to the source

## Need Help?
If you continue to have issues:
1. Make sure you're using the latest version of your website
2. Check that your Supabase database is properly configured
3. Contact support if problems persist