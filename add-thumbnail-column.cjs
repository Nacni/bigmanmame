console.log('🔧 Adding thumbnail_url column to media table');
console.log('==========================================\n');

console.log('To add the thumbnail_url column to your media table, you need to run the following SQL command in your Supabase SQL editor:\n');

console.log(`
ALTER TABLE media 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

COMMENT ON COLUMN media.thumbnail_url IS 'URL for video thumbnail image';
`);

console.log('\n📋 Instructions:');
console.log('1. Go to your Supabase dashboard');
console.log('2. Navigate to SQL Editor');
console.log('3. Paste the SQL command above');
console.log('4. Run the query');
console.log('5. Refresh your schema cache if needed\n');

console.log('💡 After adding the column:');
console.log('   • Thumbnails you upload in the admin panel will be stored in this field');
console.log('   • The public videos page will display the specific thumbnail for each video');
console.log('   • Videos without thumbnails will show the default placeholder\n');

console.log('⚠️  Note:');
console.log('   If you get a permission error, make sure you\'re running this as a user with');
console.log('   sufficient privileges (usually the owner of the database or a superuser).');