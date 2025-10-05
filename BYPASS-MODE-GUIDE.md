# Temporary Bypass Mode Guide

## What is Bypass Mode?

Bypass Mode is a temporary solution that allows you to upload videos without proper authentication. This is useful for testing purposes when you're unable to log in or when there are authentication issues.

## How to Use Bypass Mode

1. **Access the Videos Management Page**
   - Navigate to your video management section
   - You should see a login form and a "Temporary Bypass (Testing Only)" button

2. **Enable Bypass Mode**
   - Click the "Temporary Bypass (Testing Only)" button
   - This will enable bypass mode and allow you to upload videos without logging in

3. **Upload Videos**
   - You can now upload videos or add external video links
   - Note that in bypass mode, actual file uploads to storage are skipped
   - Only database records are created with placeholder URLs

4. **Disable Bypass Mode**
   - When you're done testing, click the "Disable Bypass" button in the top right corner
   - This will return you to the normal authentication flow

## Important Notes

### ⚠️ Security Warning
- Bypass Mode should ONLY be used for development/testing purposes
- Never use Bypass Mode in a production environment
- Bypass Mode disables important security protections

### 📝 Limitations
- In bypass mode, actual file uploads are skipped
- Placeholder URLs are used instead of real file URLs
- Some features may not work correctly in bypass mode
- Database records are still created normally

### 🔧 Troubleshooting
If you still encounter issues:

1. **Refresh the page** - Sometimes the authentication state needs to be refreshed
2. **Check browser console** - Look for any JavaScript errors
3. **Clear browser cache** - Cached files might interfere with the application
4. **Try incognito mode** - This can help identify cache-related issues

## Setting Up Proper Authentication

For production use, you should set up proper authentication:

1. **Create an Admin User**
   - Go to your Supabase dashboard
   - Navigate to Authentication > Users
   - Click "Add user"
   - Enter your email and password

2. **Log In Through the Application**
   - Use the normal login form with your credentials
   - Once logged in, bypass mode will automatically be disabled

3. **Verify Authentication**
   - Try uploading a video to confirm authentication is working
   - You should no longer see authentication errors

## When to Contact Support

If you continue to experience issues:

1. Check that your Supabase credentials in `.env` are correct
2. Verify that your database RLS policies are properly configured
3. Ensure your Supabase project is correctly set up

If problems persist, please contact support with:
- Screenshots of any error messages
- Browser console output
- Steps to reproduce the issue