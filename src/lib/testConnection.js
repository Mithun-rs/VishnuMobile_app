/**
 * src/lib/testConnection.js
 * ─────────────────────────────────────────────
 * Run this once to verify Supabase is connected.
 * Call testSupabaseConnection() anywhere in your
 * app (e.g. App.jsx useEffect) then remove it.
 * ─────────────────────────────────────────────
 */

import { supabase } from './supabase';

export async function testSupabaseConnection() {
  try {
    console.log('🔌 Testing Supabase connection...');

    // Simple query — will fail gracefully if table doesn't exist yet
    const { data, error } = await supabase.from('products').select('id').limit(1);

    if (error) {
      // If table doesn't exist yet, that's OK — connection still works
      if (error.code === '42P01') {
        console.log('✅ Supabase CONNECTED! (products table not created yet — that is OK)');
        return true;
      }
      throw error;
    }

    console.log('✅ Supabase CONNECTED! Products table found. Rows returned:', data?.length);
    return true;

  } catch (err) {
    console.error('❌ Supabase connection FAILED:', err.message);
    console.error('Check: SUPABASE_URL and SUPABASE_ANON_KEY in src/lib/supabase.js');
    return false;
  }
}
