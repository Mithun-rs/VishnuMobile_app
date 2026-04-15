-- ════════════════════════════════════════════════════════════════════
-- FIX: Correct admin role (trigger defaulted both users to 'staff')
-- Run in: Supabase → SQL Editor → New Query
-- ════════════════════════════════════════════════════════════════════

-- Step 1: Check current roles (should show both as 'staff' — the bug)
SELECT p.id, p.username, p.role, u.email
FROM public.profiles p
JOIN auth.users u ON u.id = p.id;

-- Step 2: Fix admin role
UPDATE public.profiles
SET role = 'admin', username = 'Admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'admin@vishnumobileshop.com'
);

-- Step 3: Confirm fix
SELECT p.id, p.username, p.role, u.email
FROM public.profiles p
JOIN auth.users u ON u.id = p.id;
