-- ════════════════════════════════════════════════════════════════════
-- CREATE PROFILES — Backfill for pre-existing auth users
-- Run in: Supabase → SQL Editor → New Query
--
-- WHY: The handle_new_user trigger only fires for NEW signups.
-- Since admin & staff were inserted directly into auth.users
-- before the trigger existed, their profiles were never created.
-- This script backfills them safely.
-- ════════════════════════════════════════════════════════════════════

-- Admin profile
INSERT INTO public.profiles (id, username, role)
SELECT
  id,
  'Admin',
  'admin'
FROM auth.users
WHERE email = 'admin@vishnumobileshop.com'
ON CONFLICT (id) DO NOTHING;


-- Staff profile
INSERT INTO public.profiles (id, username, role)
SELECT
  id,
  'Staff',
  'staff'
FROM auth.users
WHERE email = 'staff@vishnumobileshop.com'
ON CONFLICT (id) DO NOTHING;


-- ── Verify: you should see 2 rows ───────────────────────────────────
SELECT id, username, role FROM public.profiles;
