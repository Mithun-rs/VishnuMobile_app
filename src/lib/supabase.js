/**
 * src/lib/supabase.js
 * ─────────────────────────────────────────────
 * Supabase client for Vishnu Mobile Shop
 * ─────────────────────────────────────────────
 *
 * HOW TO GET YOUR KEYS:
 *  1. Go to https://app.supabase.com
 *  2. Open your project → Settings → API
 *  3. Copy "Project URL", "anon public" key AND "service_role" key
 *  4. Paste them below
 */

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// ─── 🔑 YOUR SUPABASE CREDENTIALS ────────────────────────────────────────────
const SUPABASE_URL      = 'https://nyoaymnkkwayfegcebrc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55b2F5bW5ra3dheWZlZ2NlYnJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NTg0MjksImV4cCI6MjA5MTAzNDQyOX0.gwPmnMR64Ny0v8Y2IiBXB01Xh_vRUXJ-2UcO2D83UX0';

// ── Service Role Key Removed! ────────────────────────────────────────────────
// The Service Key has been removed for security.
// Admin operations (like creating users) are now handled by Supabase Edge Functions.
// ─────────────────────────────────────────────────────────────────────────────

// Regular client — used everywhere (session-aware, RLS applies)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage:            AsyncStorage,
    autoRefreshToken:   true,
    persistSession:     true,
    detectSessionInUrl: false,
  },
});


export default supabase;
