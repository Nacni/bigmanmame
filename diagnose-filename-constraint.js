// Simple diagnostic script to check for filename constraint issues
async function diagnoseFilenameConstraint() {
  console.log('🔍 Diagnosing filename constraint issue...');
  
  try {
    // Import the supabase client from the project
    const { supabase } = await import('./src/lib/supabase.js');
    
    console.log('1. Testing insert with explicit null filename...');
    
    // Try to insert a record with explicit null filename
    const { data, error } = await supabase
      .from('media')
      .insert({
        url: 'https://example.com/test.mp4',
        title: 'Test Video',
        filename: null,
        category: 'Test'
      })
      .select();
    
    if (error) {
      console.error('❌ Insert failed:', error.message);
      console.error('   Error code:', error.code);
      console.error('   Error details:', error.details);
      console.error('   Error hint:', error.hint);
    } else {
      console.log('✅ Insert successful');
      console.log('   Data:', data);
      
      // Clean up
      if (data && data[0]) {
        await supabase.from('media').delete().eq('id', data[0].id);
        console.log('   Cleaned up test record');
      }
    }
    
    console.log('\n2. Testing insert without filename field...');
    
    // Try to insert a record without the filename field
    const { data: data2, error: error2 } = await supabase
      .from('media')
      .insert({
        url: 'https://example.com/test2.mp4',
        title: 'Test Video 2',
        category: 'Test'
      })
      .select();
    
    if (error2) {
      console.error('❌ Insert failed:', error2.message);
      console.error('   Error code:', error2.code);
      console.error('   Error details:', error2.details);
      console.error('   Error hint:', error2.hint);
    } else {
      console.log('✅ Insert successful');
      console.log('   Data:', data2);
      
      // Clean up
      if (data2 && data2[0]) {
        await supabase.from('media').delete().eq('id', data2[0].id);
        console.log('   Cleaned up test record');
      }
    }
    
  } catch (err) {
    console.error('❌ Script error:', err.message);
    console.error('   This might be due to module import issues');
  }
  
  console.log('\n🏁 Diagnostic complete');
}

// Run the diagnostic
diagnoseFilenameConstraint();