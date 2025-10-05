-- TEMPORARY SCRIPT TO DISABLE RLS FOR TESTING
-- ONLY USE THIS FOR DEVELOPMENT/TESTING PURPOSES
-- DO NOT USE IN PRODUCTION

-- Disable RLS on media table temporarily
ALTER TABLE media DISABLE ROW LEVEL SECURITY;

-- You can re-enable it later with:
-- ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- After disabling RLS, you should be able to insert videos without authentication
-- Remember to re-enable RLS and properly set up authentication for production