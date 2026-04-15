-- ════════════════════════════════════════════════════════════════════
-- STEP 2: Add missing columns (run AFTER fix_rls_recursion.sql)
-- Run in: Supabase → SQL Editor → New Query → Run All
-- ════════════════════════════════════════════════════════════════════

-- ── 1. PROFILES: add missing columns ─────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name  TEXT DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone      TEXT DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email      TEXT DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_bg  TEXT DEFAULT '#EEF0FF';

-- Drop old role check that only allowed admin/staff, re-add with manager
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'staff', 'manager'));

-- ── 2. Update trigger to also save full_name + email ─────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email,'@',1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'staff')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email     = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 3. ORDERS: add default UUID + snake_case columns ─────────────────
ALTER TABLE orders ALTER COLUMN id SET DEFAULT gen_random_uuid()::TEXT;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name   TEXT    DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone           TEXT    DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method  TEXT    DEFAULT 'upi';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gst             NUMERIC(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_payable   NUMERIC(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_items     INTEGER DEFAULT 0;

-- Fix payment_method constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_paymentMethod_check;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE orders
  ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IN ('upi', 'cash', 'card'));

-- ── 4. ORDER_ITEMS: add total column ─────────────────────────────────
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS total NUMERIC(10,2) DEFAULT 0;

-- ── 5. ATTENDANCE LOGS: add staff_id, check_type, session_id ─────────
ALTER TABLE attendance_logs ADD COLUMN IF NOT EXISTS staff_id   UUID REFERENCES auth.users(id);
ALTER TABLE attendance_logs ADD COLUMN IF NOT EXISTS check_type TEXT DEFAULT 'CHECK_IN'
  CHECK (check_type IN ('CHECK_IN', 'CHECK_OUT'));
ALTER TABLE attendance_logs ADD COLUMN IF NOT EXISTS session_id TEXT DEFAULT '';

-- ════════════════════════════════════════════════════════════════════
-- ✅ All columns added! App should work now.
-- ════════════════════════════════════════════════════════════════════
