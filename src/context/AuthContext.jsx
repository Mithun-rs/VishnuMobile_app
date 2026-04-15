/**
 * src/context/AuthContext.jsx
 * ─────────────────────────────────────────
 * Global Auth state — wraps the entire app.
 * Provides: session, profile, loading, signOut
 * ─────────────────────────────────────────
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

// ── Timeout helper ─────────────────────────────────────────────────
const withTimeout = (promise, ms = 6000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), ms)
    ),
  ]);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null); // { id, username, role, is_approved }
  const [loading, setLoading] = useState(true);

  // ── Fetch profile from DB, with metadata fallback ─────────────────
  const fetchProfile = async (userId, userMeta) => {
    try {
      // Try reading from DB first — most authoritative
      // Uses * so it works whether or not is_approved column exists yet
      const { data, error } = await withTimeout(
        supabase
          .from('profiles')
          .select('id, username, full_name, role, is_approved')
          .eq('id', userId)
          .maybeSingle()
      );

      if (!error && data) {
        // Admins are ALWAYS approved — never block them even if DB says false
        const isAdminRole = data.role === 'admin' || data.role === 'attendance_admin';
        const resolvedProfile = {
          ...data,
          is_approved: isAdminRole ? true : (data.is_approved ?? false),
        };
        console.log('✅ Profile from DB:', JSON.stringify(resolvedProfile));
        setProfile(resolvedProfile);
        return;
      }

      if (error) {
        console.warn('⚠️ Profile DB error (may be missing column):', error.message);
      }
    } catch (e) {
      console.warn('⚠️ Profile fetch failed/timed out:', e.message);
    }

    // ── Fallback: JWT user_metadata ──────────────────────────────
    const metaRole     = userMeta?.role      || null;
    const metaUsername = userMeta?.username  || null;
    const metaName     = userMeta?.full_name || null;

    if (metaRole) {
      const isAdminMeta = metaRole === 'admin' || metaRole === 'attendance_admin';
      console.log('✅ Profile from metadata:', metaRole);
      setProfile({
        id:          userId,
        username:    metaUsername,
        full_name:   metaName,
        role:        metaRole,
        is_approved: isAdminMeta ? true : false,
      });
      return;
    }

    // Last resort: treat as unauthenticated
    console.warn('❌ Could not resolve profile — setting null');
    setProfile(null);
  };

  useEffect(() => {
    let mounted = true;

    // ── Initial session restore ──────────────────────────────────
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      if (session?.user) {
        await fetchProfile(session.user.id, session.user.user_metadata);
      }
      if (mounted) setLoading(false);
    });

    // ── Listen for sign in / sign out / token refresh ────────────
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;
        setLoading(true);
        setSession(session);
        if (session?.user) {
          await fetchProfile(session.user.id, session.user.user_metadata);
        } else {
          setProfile(null);
        }
        if (mounted) setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ── Sign out ──────────────────────────────────────────────────
  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ session, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
