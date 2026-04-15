-- ════════════════════════════════════════════════════════════════════
-- MIGRATION v2 — Full patch for Vishnu Mobile Shop
-- Run in: Supabase → SQL Editor → New Query → Run All
-- ════════════════════════════════════════════════════════════════════


-- ── 1. PROFILES: add missing columns ─────────────────────────────────

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name  TEXT DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone      TEXT DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email      TEXT DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_bg  TEXT DEFAULT '#EEF0FF';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS salary     NUMERIC(10,2) DEFAULT NULL;

-- Drop old role check that only allowed admin/staff, re-add with manager
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'staff', 'manager'));

-- ── 2. PROFILES: update trigger to save full_name + email ─────────────

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

-- ── 3. PROFILES: RLS — allow authenticated users to read ALL profiles ──

DROP POLICY IF EXISTS "profiles_select_own"           ON profiles;
DROP POLICY IF EXISTS "profiles_select_authenticated" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own"           ON profiles;
DROP POLICY IF EXISTS "profiles_admin_update_all"     ON profiles;
DROP POLICY IF EXISTS "profiles_admin_delete"         ON profiles;

CREATE POLICY "profiles_select_authenticated" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_admin_write" ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );


-- ── 4. ORDERS: add default UUID to id + snake_case columns ───────────

-- Give id a default so Billing page doesn't need to supply one
ALTER TABLE orders ALTER COLUMN id SET DEFAULT gen_random_uuid()::TEXT;

-- Add snake_case columns (Billing_page.jsx sends these)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name   TEXT    DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone           TEXT    DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method  TEXT    DEFAULT 'upi';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gst             NUMERIC(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_payable   NUMERIC(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_items     INTEGER DEFAULT 0;

-- Fix payment_method check to allow all three methods
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_paymentMethod_check;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE orders
  ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IN ('upi', 'cash', 'card'));

-- ── 5. ORDER_ITEMS: add total column ─────────────────────────────────

ALTER TABLE order_items ADD COLUMN IF NOT EXISTS total NUMERIC(10,2) DEFAULT 0;

-- Fix RLS so any authenticated user can insert orders
DROP POLICY IF EXISTS "orders_insert_own" ON orders;
CREATE POLICY "orders_insert_authenticated" ON orders
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "order_items_insert" ON order_items;
CREATE POLICY "order_items_insert_authenticated" ON order_items
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ── 6. RPC: ensure decrement_stock exists ────────────────────────────

CREATE OR REPLACE FUNCTION decrement_stock(product_id TEXT, qty INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET "stockQty" = GREATEST("stockQty" - qty, 0)
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow authenticated users to call it
GRANT EXECUTE ON FUNCTION decrement_stock(TEXT, INTEGER) TO authenticated;


-- ════════════════════════════════════════════════════════════════════
-- ✅ Migration complete! All issues fixed.
-- ════════════════════════════════════════════════════════════════════
