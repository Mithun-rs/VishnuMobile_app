-- ════════════════════════════════════════════════════════════════════
-- DEFINITIVE FIX: Profiles + RLS
-- Run in: Supabase → SQL Editor → New Query
-- ════════════════════════════════════════════════════════════════════

-- Step 1: See current state (LEFT JOIN shows missing profiles too)
SELECT
  u.email,
  p.id,
  p.username,
  p.role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email IN (
  'admin@vishnumobileshop.com',
  'staff@vishnumobileshop.com'
);

-- Step 2: Upsert profiles with correct data (handles both missing + wrong role)
INSERT INTO public.profiles (id, username, role)
SELECT id, 'Admin', 'admin'
FROM auth.users
WHERE email = 'admin@vishnumobileshop.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin', username = 'Admin';

INSERT INTO public.profiles (id, username, role)
SELECT id, 'Staff', 'staff'
FROM auth.users
WHERE email = 'staff@vishnumobileshop.com'
ON CONFLICT (id) DO UPDATE SET role = 'staff', username = 'Staff';

-- Step 3: Fix RLS — drop old policy, add one that actually works
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Step 4: Verify final state
SELECT
  u.email,
  p.username,
  p.role
FROM auth.users u
JOIN public.profiles p ON p.id = u.id
WHERE u.email IN (
  'admin@vishnumobileshop.com',
  'staff@vishnumobileshop.com'
);
