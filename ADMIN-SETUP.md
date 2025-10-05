# Admin Panel Setup Guide

## Authentication Requirements

The admin panel now requires authentication to perform any operations on the database. This is implemented using Supabase Auth with Row Level Security (RLS) policies.

## Setting Up Your Admin Account

### Option 1: Using the Admin Login Interface (Recommended)

1. Navigate to the Videos Management section in your admin panel
2. You'll see a login form if you're not already authenticated
3. You can either:
   - Sign in with an existing account
   - Create a new account using the "Sign Up" link

### Option 2: Using Supabase Dashboard (For Initial Setup)

1. Go to your Supabase project dashboard
2. Navigate to "Authentication" > "Users"
3. Click "Add user"
4. Enter your email and password
5. The user will be created and can immediately log in to the admin panel

## How Authentication Works

The admin panel implements the following security measures:

1. **Row Level Security (RLS)**: All database operations on the `media` table require authentication
2. **Session Management**: The app automatically checks authentication status on load
3. **Real-time Updates**: Authentication state is tracked in real-time
4. **Operation Protection**: All CRUD operations check for authentication before proceeding

## Troubleshooting

### "Row-level security policy" Error

If you see this error, it means you're trying to perform an operation without being logged in. Make sure you:

1. Log in using the admin login form
2. Verify your session is active
3. Try the operation again

### Schema Cache Issues

If you encounter schema cache errors:

1. Click the "Refresh Schema" button in the top right corner of the Videos Management page
2. Try the operation again
3. If issues persist, refresh the page

## Security Best Practices

1. Always log out when using shared computers
2. Use strong passwords for admin accounts
3. Regularly check the Supabase Auth dashboard for suspicious activity
4. Consider enabling email confirmation for new accounts in production

## Need Help?

If you continue to experience issues:

1. Check the browser console for detailed error messages
2. Verify your Supabase credentials in the `.env` file
3. Ensure your Supabase project has the correct RLS policies applied (see `supabase-setup.sql`)