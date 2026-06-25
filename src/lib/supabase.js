/**
 * src/lib/supabase.js
 * ─────────────────────────────────────────────
 * Supabase client for Vishnu Mobile Shop
 * Credentials are loaded from .env via react-native-config
 * ─────────────────────────────────────────────
 *
 * HOW TO CONFIGURE:
 *  1. Go to https://app.supabase.com → Settings → API
 *  2. Copy "Project URL" and "anon public" key
 *  3. Paste them in the .env file at project root:
 *       SUPABASE_URL=https://...supabase.co
 *       SUPABASE_ANON_KEY=eyJ...
 *  4. Rebuild the app: npx react-native run-android
 */

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// NOTE:
// `react-native-config` can crash at import-time if its native module isn't
// linked/loaded in the current binary (e.g. after adding the dependency but
// before a clean rebuild). To avoid taking down the whole app at startup,
// we load it defensively and let the UI show a helpful setup message.
let Config = null;
let configLoadError = null;
try {
  // eslint-disable-next-line global-require
  const mod = require('react-native-config');
  Config = mod?.default ?? mod;
} catch (e) {
  configLoadError = e;
}

// ─── 🔑 SUPABASE CREDENTIALS (loaded from .env) ──────────────────────────────
const SUPABASE_URL = Config?.SUPABASE_URL;
const SUPABASE_ANON_KEY = Config?.SUPABASE_ANON_KEY;

// Warn in development if .env is missing or incomplete
if (__DEV__ && (configLoadError || !SUPABASE_URL || !SUPABASE_ANON_KEY)) {
  console.error(
    (configLoadError
      ? '❌ Failed to load react-native-config (native module missing).\n' +
        'Do a clean rebuild:\n' +
        '  cd android && gradlew clean && cd ..\n' +
        '  npx react-native run-android\n\n'
      : '❌ Missing Supabase credentials in .env!\n\n') +
      'Make sure your project root has a `.env` file with:\n' +
      '  SUPABASE_URL=https://...supabase.co\n' +
      '  SUPABASE_ANON_KEY=eyJ...\n'
  );
}

// ── Service Role Key Removed! ────────────────────────────────────────────────
// The Service Key has been removed for security.
// Admin operations (like creating users) are now handled by Supabase Edge Functions.
// ─────────────────────────────────────────────────────────────────────────────

export const supabaseConfigStatus = {
  configLoadErrorMessage: configLoadError ? String(configLoadError?.message ?? configLoadError) : null,
  hasSupabaseUrl: Boolean(SUPABASE_URL),
  hasSupabaseAnonKey: Boolean(SUPABASE_ANON_KEY),
};

// Regular client — used everywhere (session-aware, RLS applies)
export const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    : null;


export default supabase;
