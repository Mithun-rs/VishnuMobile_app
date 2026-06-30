import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, supabaseConfigStatus } from '../lib/supabase';
import { ADMIN_ROLES } from '../constants';
import { SafeAreaView, Text, View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

const PROFILE_CACHE_KEY = 'cached_profile';
const SESSION_CACHE_KEY = 'cached_session';

// Change from 6000 to 10000
const withTimeout = (promise, ms = 10000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), ms)
    ),
  ]);

export function AuthProvider({ children }) {
  if (!supabase) {
    return (
      <SafeAreaView style={es.container}>
        <View style={es.card}>
          <Text style={es.title}>Configuration required</Text>
          <Text style={es.body}>Supabase is not configured for this build.</Text>
          {supabaseConfigStatus?.configLoadErrorMessage ? (
            <Text style={es.mono}>
              react-native-config error: {supabaseConfigStatus.configLoadErrorMessage}
            </Text>
          ) : null}
          <Text style={es.body}>
            Create a <Text style={es.bold}>.env</Text> in the project root with:
          </Text>
          <Text style={es.mono}>SUPABASE_URL=...</Text>
          <Text style={es.mono}>SUPABASE_ANON_KEY=...</Text>
          <Text style={es.body}>
            Then do a clean rebuild:{' '}
            <Text style={es.bold}>cd android && gradlew clean</Text> and run Android again.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Resolve profile ───────────────────────────────────────────────
  const resolveProfile = (data, userId, userMeta) => {
    if (data) {
      const isAdminRole = ADMIN_ROLES.includes(data.role);
      return {
        ...data,
        is_approved: isAdminRole ? true : (data.is_approved ?? false),
      };
    }
    const metaRole     = userMeta?.role     || null;
    const metaUsername = userMeta?.username || null;
    const metaName     = userMeta?.full_name || null;
    if (metaRole) {
      return {
        id:          userId,
        username:    metaUsername,
        full_name:   metaName,
        role:        metaRole,
        is_approved: ADMIN_ROLES.includes(metaRole) ? true : false,
      };
    }
    return null;
  };

const fetchProfile = async (userId, userMeta, silent = false) => {
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('profiles')
        .select('id, username, full_name, role, is_approved, phone, salary, assigned_shop')
        .eq('id', userId)
        .maybeSingle(),
      10000 // increase timeout to 10 seconds
    );

    if (!error && data) {
      const resolved = resolveProfile(data, userId, userMeta);
      if (resolved) {
        setProfile(resolved);
        await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(resolved));
        console.log('✅ Profile updated from DB');
      }
    } else {
      // If fetch fails but we have cache, silently keep using cache
      const cached = await AsyncStorage.getItem(PROFILE_CACHE_KEY);
      if (cached) {
        console.log('⚠️ Using cached profile (DB unreachable)');
        setProfile(JSON.parse(cached));
      } else {
        // No cache — fallback to metadata
        const resolved = resolveProfile(null, userId, userMeta);
        if (resolved) setProfile(resolved);
      }
    }
  } catch (e) {
    console.warn('⚠️ Profile fetch failed:', e.message);
    // Always fall back to cache on timeout
    try {
      const cached = await AsyncStorage.getItem(PROFILE_CACHE_KEY);
      if (cached) {
        setProfile(JSON.parse(cached));
        console.log('✅ Restored profile from cache after timeout');
      } else {
        // Last resort — use metadata
        const resolved = resolveProfile(null, userId, userMeta);
        if (resolved) setProfile(resolved);
      }
    } catch (cacheErr) {
      console.warn('Cache read failed:', cacheErr.message);
    }
  }
};

useEffect(() => {
  let mounted = true;

  const init = async () => {
    try {
      // ── Step 1: Load cache INSTANTLY ──────────────────────────
      const [cachedSession, cachedProfile] = await Promise.all([
        AsyncStorage.getItem(SESSION_CACHE_KEY),
        AsyncStorage.getItem(PROFILE_CACHE_KEY),
      ]);

      if (cachedProfile && mounted) {
        setProfile(JSON.parse(cachedProfile));
        setSession(cachedSession ? JSON.parse(cachedSession) : null);
        setLoading(false); // ✅ App opens immediately
      }

      // ── Step 2: Get session from Supabase ─────────────────────
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      if (session?.user) {
        setSession(session);
        await AsyncStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(session));

        // ── Step 3: Use JWT metadata FIRST (instant, no network) ─
        const meta = session.user.user_metadata;
        const metaRole = meta?.role || null;

        if (metaRole && !cachedProfile) {
          // No cache exists — use metadata to show app immediately
          const quickProfile = {
            id:            session.user.id,
            username:      meta?.username  || null,
            full_name:     meta?.full_name || null,
            role:          metaRole,
            is_approved:   ADMIN_ROLES.includes(metaRole) ? true : (meta?.is_approved ?? false),
            phone:         meta?.phone     || null,
            salary:        meta?.salary    || null,
            assigned_shop: meta?.assigned_shop || 'shop1',
          };
          setProfile(quickProfile);
          setLoading(false); // ✅ Show app with metadata profile
        }

        // ── Step 4: Fetch real profile in background ──────────────
        // Don't await — runs silently without blocking UI
        supabase
          .from('profiles')
          .select('id, username, full_name, role, is_approved, phone, salary, assigned_shop')
          .eq('id', session.user.id)
          .maybeSingle()
          .then(async ({ data, error }) => {
            if (!mounted) return;
            if (!error && data) {
              const isAdmin = ADMIN_ROLES.includes(data.role);
              const resolved = {
                ...data,
                is_approved: isAdmin ? true : (data.is_approved ?? false),
              };
              setProfile(resolved);
              await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(resolved));
              console.log('✅ Profile refreshed from DB');
            }
          })
          .catch(e => console.log('Background profile fetch failed:', e.message));

      } else {
        // No session — clear everything
        if (mounted) {
          setSession(null);
          setProfile(null);
          setLoading(false);
          await AsyncStorage.multiRemove([SESSION_CACHE_KEY, PROFILE_CACHE_KEY]);
        }
      }
    } catch (e) {
      console.warn('Auth init error:', e.message);
      if (mounted) setLoading(false);
    }
  };

  init();

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (_event, session) => {
      if (!mounted) return;
      setSession(session);
      if (session?.user) {
        await AsyncStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(session));
        // Use metadata immediately
        const meta = session.user.user_metadata;
        if (meta?.role) {
          const quickProfile = {
            id:            session.user.id,
            username:      meta?.username  || null,
            full_name:     meta?.full_name || null,
            role:          meta.role,
            is_approved:   ADMIN_ROLES.includes(meta.role) ? true : false,
            phone:         meta?.phone     || null,
            salary:        meta?.salary    || null,
            assigned_shop: meta?.assigned_shop || 'shop1',
          };
          setProfile(quickProfile);
        }
        // Then fetch real profile in background
        supabase
          .from('profiles')
          .select('id, username, full_name, role, is_approved, phone, salary, assigned_shop')
          .eq('id', session.user.id)
          .maybeSingle()
          .then(async ({ data, error }) => {
            if (!mounted || error || !data) return;
            const isAdmin = ADMIN_ROLES.includes(data.role);
            const resolved = {
              ...data,
              is_approved: isAdmin ? true : (data.is_approved ?? false),
            };
            setProfile(resolved);
            await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(resolved));
          })
          .catch(() => {});
      } else {
        setProfile(null);
        await AsyncStorage.multiRemove([SESSION_CACHE_KEY, PROFILE_CACHE_KEY]);
      }
      if (mounted) setLoading(false);
    }
  );

  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, []);

  // ── Sign out ──────────────────────────────────────────────────────
  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    await AsyncStorage.multiRemove([SESSION_CACHE_KEY, PROFILE_CACHE_KEY]);
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

const es = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#F5F6FA',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  card: {
    width: '100%', maxWidth: 420, backgroundColor: '#fff',
    borderRadius: 18, padding: 20, borderWidth: 1, borderColor: '#E2E8F0',
  },
  title:  { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 10 },
  body:   { fontSize: 14, color: '#334155', lineHeight: 20, marginBottom: 10 },
  bold:   { fontWeight: '800', color: '#0F172A' },
  mono:   {
    fontSize: 12, fontFamily: 'monospace', color: '#0F172A',
    backgroundColor: '#F1F5F9', paddingVertical: 6, paddingHorizontal: 10,
    borderRadius: 10, marginBottom: 8,
  },
});