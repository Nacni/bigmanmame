const { createClient } = require('@supabase/supabase-js');

// Configuration - Using the same credentials as in your project
const supabaseUrl = 'https://prlcqrminsonibdsnzmy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybGNxcm1pbnNvbmliZHNuem15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzgzNzcsImV4cCI6MjA3MzYxNDM3N30.pCIQNH4jvlfAWIr1i1WPHWoPzHwxjsEv5QswIfftFRU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdminUser() {
  console.log('🔧 Creating admin user...\n');
  
  // You can modify these credentials
  const email = 'admin@example.com';
  const password = 'SecurePass123!';
  
  try {
    console.log(`1. Creating user with email: ${email}`);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      // Check if user already exists
      if (error.message.includes('already registered')) {
        console.log('⚠️  User already exists. You can use the login functionality instead.');
        console.log('   Try logging in with the credentials:');
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
        return;
      }
      throw error;
    }
    
    console.log('✅ User creation request sent successfully');
    console.log('   User data:', JSON.stringify(data, null, 2));
    
    if (data.user) {
      console.log('\n📋 Next steps:');
      console.log('   1. Check your email for a confirmation message');
      console.log('   2. Click the confirmation link in the email');
      console.log('   3. After confirmation, you can log in to the admin panel');
    } else {
      console.log('\n⚠️  User created but not returned. This might be due to email confirmation requirements.');
      console.log('   You may need to check for an email confirmation message.');
    }
    
    console.log('\n🔐 Credentials (save these somewhere secure):');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('\n⚠️  Remember to change the default password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    
    if (error.message.includes('already registered')) {
      console.log('\n💡 Tip: The user already exists. Try logging in instead:');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
    } else if (error.message.includes('Invalid login credentials')) {
      console.log('\n💡 Tip: There might be an issue with your Supabase configuration.');
      console.log('   Check that your SUPABASE_URL and SUPABASE_ANON_KEY are correct.');
    }
  }
  
  console.log('\n🏁 Admin user creation process complete');
}

// Also create a function to test login
async function testLogin() {
  console.log('🔍 Testing login...\n');
  
  // Use the same credentials
  const email = 'admin@example.com';
  const password = 'SecurePass123!';
  
  try {
    console.log(`1. Attempting to log in with email: ${email}`);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    console.log('✅ Login successful!');
    console.log('   Session data:', JSON.stringify(data, null, 2));
    
    // Test a simple operation
    console.log('\n2. Testing database access...');
    const { data: mediaData, error: mediaError } = await supabase
      .from('media')
      .select('*')
      .limit(1);
    
    if (mediaError) {
      console.error('❌ Database access failed:', mediaError.message);
    } else {
      console.log('✅ Database access successful');
      console.log(`   Found ${mediaData ? mediaData.length : 0} media records`);
    }
    
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    
    if (error.message.includes('Invalid login credentials')) {
      console.log('\n💡 Tip: The credentials might be incorrect or the user might not be confirmed.');
      console.log('   If you just created the user, check your email for a confirmation link.');
    }
  }
  
  console.log('\n🏁 Login test complete');
}

// Main execution
async function main() {
  console.log('🚀 Admin User Setup Tool\n');
  
  // Ask user what they want to do
  const action = process.argv[2];
  
  if (action === 'login') {
    await testLogin();
  } else if (action === 'create') {
    await createAdminUser();
  } else {
    console.log('🔧 Usage:');
    console.log('   node create-admin.cjs create  - Create a new admin user');
    console.log('   node create-admin.cjs login   - Test login with existing credentials');
    console.log('\n📝 Default credentials:');
    console.log('   Email: admin@example.com');
    console.log('   Password: SecurePass123!');
  }
}

main();