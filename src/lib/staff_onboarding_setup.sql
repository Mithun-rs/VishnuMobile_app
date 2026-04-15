-- ════════════════════════════════════════════════════════════════════
-- IMMEDIATE FIX: Stop infinite recursion + Add is_approved setup
-- Run ONLY this file in Supabase → SQL Editor → New Query → Run
-- ════════════════════════════════════════════════════════════════════

-- ─── Step 1: Drop ALL conflicting profiles policies ──────────────────
DROP POLICY IF EXISTS "profiles_select_own"            ON profiles;
DROP POLICY IF EXISTS "profiles_select_all"            ON profiles;
DROP POLICY IF EXISTS "profiles_select_authenticated"  ON profiles;
DROP POLICY IF EXISTS "profiles_update_own"            ON profiles;
DROP POLICY IF EXISTS "profiles_admin_update"          ON profiles;
DROP POLICY IF EXISTS "profiles_admin_update_all"      ON profiles;
DROP POLICY IF EXISTS "profiles_admin_delete"          ON profiles;
DROP POLICY IF EXISTS "profiles_admin_insert"          ON profiles;
DROP POLICY IF EXISTS "profiles_admin_all"             ON profiles;
DROP POLICY IF EXISTS "profiles_admin_write"           ON profiles;
DROP POLICY IF EXISTS "profiles_read_own_approval"     ON profiles;

-- ─── Step 2: Recreate SAFE policies (JWT-based, no DB recursion) ──────

-- Any authenticated user can read ALL profile rows
-- (needed so admin can see staff list, staff can see own profile)
CREATE POLICY "profiles_select_all" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Any authenticated user can update only THEIR OWN profile row
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admin can update ANY profile row (for approving staff)
-- Uses JWT metadata — NOT a DB lookup, zero recursion risk
CREATE POLICY "profiles_admin_update_all" ON profiles
  FOR UPDATE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Allow new profiles to be inserted (needed when creating staff)
CREATE POLICY "profiles_admin_insert" ON profiles
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Admin can delete profiles
CREATE POLICY "profiles_admin_delete" ON profiles
  FOR DELETE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- ─── Step 3: Add is_approved column ──────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT FALSE;

-- All existing admin and attendance_admin users are auto-approved
UPDATE profiles SET is_approved = TRUE
WHERE role IN ('admin', 'attendance_admin');

-- ─── Step 4: Create pending_login_requests table ──────────────────────
CREATE TABLE IF NOT EXISTS pending_login_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  username     TEXT NOT NULL,
  full_name    TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  status       TEXT NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'approved', 'rejected'))
);

ALTER TABLE pending_login_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_insert_pending"    ON pending_login_requests;
DROP POLICY IF EXISTS "staff_read_own_pending"  ON pending_login_requests;
DROP POLICY IF EXISTS "admin_update_pending"    ON pending_login_requests;
DROP POLICY IF EXISTS "admin_delete_pending"    ON pending_login_requests;

-- Any authenticated user can insert (staff triggering a request)
CREATE POLICY "allow_insert_pending" ON pending_login_requests
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Anyone authenticated can read (admin sees all, staff sees own — app filters)
CREATE POLICY "staff_read_own_pending" ON pending_login_requests
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admin can update (approve / reject)
CREATE POLICY "admin_update_pending" ON pending_login_requests
  FOR UPDATE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Admin can delete
CREATE POLICY "admin_delete_pending" ON pending_login_requests
  FOR DELETE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- ─── Step 5: Add missing orders columns (safe if already exist) ───────
ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_by     UUID REFERENCES auth.users(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_items    INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name  TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cash';

-- ════════════════════════════════════════════════════════════════════
-- ✅ DONE — Now reload the app (shake device → Reload or press r in Metro)
-- ════════════════════════════════════════════════════════════════════
