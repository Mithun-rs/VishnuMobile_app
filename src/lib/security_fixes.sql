-- ════════════════════════════════════════════════════════════════════
-- SECURITY FIXES & OPTIMIZATIONS
-- Run ONLY this file in Supabase → SQL Editor → New Query → Run
-- ════════════════════════════════════════════════════════════════════

-- ─── 1. Prevent Privilege Escalation on Profiles ─────────────────────
-- A trigger to block updates to `role` or `is_approved` by non-admins
CREATE OR REPLACE FUNCTION prevent_privilege_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if restricted columns changed
  IF NEW.role IS DISTINCT FROM OLD.role OR NEW.is_approved IS DISTINCT FROM OLD.is_approved THEN
    -- Allow change ONLY if acting via service_role OR if jwt role is admin
    IF auth.role() != 'service_role' AND auth.role() != 'postgres' THEN
      IF (auth.jwt() -> 'user_metadata' ->> 'role') != 'admin' THEN
        RAISE EXCEPTION 'Unauthorized column update: only admins can change role or approval status';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS restrict_profile_updates ON profiles;
CREATE TRIGGER restrict_profile_updates
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_privilege_escalation();


-- ─── 2. Secure `handle_new_user` Trigger ─────────────────────────────
-- Ignore metadata for roles to prevent client-side injection during signup.
-- Any new user defaults to 'staff' and FALSE for is_approved.
-- Edge Functions will explicitly UPDATE the profile afterward.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role, is_approved)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email, 'User_' || substr(NEW.id::text, 1, 8)),
    'staff',  -- Strictly enforce default role
    FALSE     -- Strictly enforce unapproved status
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─── 3. Eliminate Infinite Recursion from RLS Policies ───────────────
-- Replace table-lookups with secure JWT metadata checks

-- Categories
DROP POLICY IF EXISTS "categories_admin_write" ON categories;
CREATE POLICY "categories_admin_write" ON categories
  FOR ALL USING ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' );

-- Products
DROP POLICY IF EXISTS "products_admin_write" ON products;
CREATE POLICY "products_admin_write" ON products
  FOR ALL USING ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' );

-- Staff
DROP POLICY IF EXISTS "staff_admin_only" ON staff;
CREATE POLICY "staff_admin_only" ON staff
  FOR ALL USING ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' );

-- Attendance Logs
-- IMPORTANT:
-- Staff must be able to INSERT their own attendance scans.
-- Admin must be able to view all logs.
DROP POLICY IF EXISTS "attendance_admin_only"             ON attendance_logs;
DROP POLICY IF EXISTS "attendance_authenticated"          ON attendance_logs;
DROP POLICY IF EXISTS "attendance_insert_own"             ON attendance_logs;
DROP POLICY IF EXISTS "attendance_select_own_or_admin"    ON attendance_logs;
DROP POLICY IF EXISTS "attendance_update_admin_only"      ON attendance_logs;
DROP POLICY IF EXISTS "attendance_delete_admin_only"      ON attendance_logs;

-- Staff can insert only for themselves
CREATE POLICY "attendance_insert_own" ON attendance_logs
  FOR INSERT
  WITH CHECK (auth.uid() = staff_id);

-- Staff can read only their own logs; admin can read all
CREATE POLICY "attendance_select_own_or_admin" ON attendance_logs
  FOR SELECT
  USING (
    auth.uid() = staff_id
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Only admin can update/delete attendance logs (avoid tampering)
CREATE POLICY "attendance_update_admin_only" ON attendance_logs
  FOR UPDATE
  USING ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' );

CREATE POLICY "attendance_delete_admin_only" ON attendance_logs
  FOR DELETE
  USING ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' );

-- Orders
DROP POLICY IF EXISTS "orders_read" ON orders;
CREATE POLICY "orders_read" ON orders
  FOR SELECT USING (
    auth.uid() = created_by OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Order Items
DROP POLICY IF EXISTS "order_items_read" ON order_items;
CREATE POLICY "order_items_read" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND (orders.created_by = auth.uid() OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
    )
  );

-- ════════════════════════════════════════════════════════════════════
-- DONE.
-- ════════════════════════════════════════════════════════════════════
