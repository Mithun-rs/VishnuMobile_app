/**
 * repair_admin.js
 * 
 * This script ensures that the admin@vishnumobileshop.com user has a 
 * corresponding profile record in the 'profiles' table.
 */

const { createClient } = require('@supabase/supabase-js');

// REPLACE THESE WITH YOUR ACTUAL KEYS from Supabase -> Settings -> API
// Use the SERVICE_ROLE_KEY for this script to bypass RLS.
const SUPABASE_URL = 'https://nyoaymnkkwayfegcebrc.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55b2F5bW5ra3dheWZlZ2NlYnJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTQ1ODQyOSwiZXhwIjoyMDkxMDM0NDI5fQ.LJ_x2G5ra1SH1GPKNwULoFH7Whj3ZNfIOcvSPxmZq9Q';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function repair() {
  console.log('--- Repairing Admin Profile ---');
  
  // 1. Get the user ID from Auth
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Error listing users:', listError.message);
    return;
  }

  const adminUser = users.find(u => u.email === 'admin@vishnumobileshop.com');
  if (!adminUser) {
    console.error('Admin user not found in Auth systems.');
    return;
  }

  console.log(`Found Admin User: ${adminUser.id}`);

  // 2. Upsert into profiles
  const { error: upsertError } = await supabase
    .from('profiles')
    .upsert({
      id: adminUser.id,
      username: 'Admin',
      role: 'admin',
      is_approved: true
    });

  if (upsertError) {
    console.error('Error repairing profile:', upsertError.message);
  } else {
    console.log('✅ Admin profile successfully created/updated in "profiles" table.');
  }
}

repair();
