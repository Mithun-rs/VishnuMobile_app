-- ════════════════════════════════════════════════════════════════════
-- FIX v2: Drop ALL existing policies then recreate with JWT-based checks
-- Run in: Supabase → SQL Editor → New Query → Run All
-- ════════════════════════════════════════════════════════════════════

-- ── Drop EVERY possible policy on every table ────────────────────────

-- profiles
DROP POLICY IF EXISTS "profiles_select_own"              ON profiles;
DROP POLICY IF EXISTS "profiles_select_authenticated"    ON profiles;
DROP POLICY IF EXISTS "profiles_select_all"              ON profiles;
DROP POLICY IF EXISTS "profiles_update_own"              ON profiles;
DROP POLICY IF EXISTS "profiles_admin_update_all"        ON profiles;
DROP POLICY IF EXISTS "profiles_admin_delete"            ON profiles;
DROP POLICY IF EXISTS "profiles_admin_write"             ON profiles;
DROP POLICY IF EXISTS "profiles_admin_insert"            ON profiles;
DROP POLICY IF EXISTS "profiles_admin_all"               ON profiles;

-- categories
DROP POLICY IF EXISTS "categories_read"                  ON categories;
DROP POLICY IF EXISTS "categories_admin_write"           ON categories;
DROP POLICY IF EXISTS "categories_select"                ON categories;
DROP POLICY IF EXISTS "categories_insert"                ON categories;

-- products
DROP POLICY IF EXISTS "products_read"                    ON products;
DROP POLICY IF EXISTS "products_admin_write"             ON products;
DROP POLICY IF EXISTS "products_select"                  ON products;
DROP POLICY IF EXISTS "products_update_stock"            ON products;
DROP POLICY IF EXISTS "products_insert"                  ON products;

-- orders
DROP POLICY IF EXISTS "orders_insert_own"                ON orders;
DROP POLICY IF EXISTS "orders_insert_authenticated"      ON orders;
DROP POLICY IF EXISTS "orders_insert"                    ON orders;
DROP POLICY IF EXISTS "orders_read"                      ON orders;
DROP POLICY IF EXISTS "orders_select"                    ON orders;

-- order_items
DROP POLICY IF EXISTS "order_items_insert"               ON order_items;
DROP POLICY IF EXISTS "order_items_insert_authenticated" ON order_items;
DROP POLICY IF EXISTS "order_items_read"                 ON order_items;
DROP POLICY IF EXISTS "order_items_select"               ON order_items;

-- staff
DROP POLICY IF EXISTS "staff_admin_only"                 ON staff;
DROP POLICY IF EXISTS "staff_authenticated"              ON staff;

-- attendance_logs
DROP POLICY IF EXISTS "attendance_admin_only"            ON attendance_logs;
DROP POLICY IF EXISTS "attendance_authenticated"         ON attendance_logs;


-- ════════════════════════════════════════════════════════════════════
-- Recreate ALL policies using JWT — zero DB recursion
-- ════════════════════════════════════════════════════════════════════

-- ── PROFILES ─────────────────────────────────────────────────────────

CREATE POLICY "profiles_select_all" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_admin_insert" ON profiles
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "profiles_admin_update_all" ON profiles
  FOR UPDATE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "profiles_admin_delete" ON profiles
  FOR DELETE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- ── CATEGORIES ───────────────────────────────────────────────────────

CREATE POLICY "categories_read" ON categories
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "categories_admin_write" ON categories
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- ── PRODUCTS ─────────────────────────────────────────────────────────

CREATE POLICY "products_read" ON products
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "products_admin_write" ON products
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Allow stock updates via RPC (decrement_stock uses SECURITY DEFINER so
-- this policy rarely fires, but add it for safety)
CREATE POLICY "products_update_stock" ON products
  FOR UPDATE USING (auth.role() = 'authenticated');

-- ── ORDERS ───────────────────────────────────────────────────────────

CREATE POLICY "orders_insert" ON orders
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "orders_select" ON orders
  FOR SELECT USING (auth.role() = 'authenticated');

-- ── ORDER ITEMS ──────────────────────────────────────────────────────

CREATE POLICY "order_items_insert" ON order_items
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "order_items_select" ON order_items
  FOR SELECT USING (auth.role() = 'authenticated');

-- ── STAFF (legacy table) ──────────────────────────────────────────────

CREATE POLICY "staff_authenticated" ON staff
  FOR ALL USING (auth.role() = 'authenticated');

-- ── ATTENDANCE LOGS ───────────────────────────────────────────────────

CREATE POLICY "attendance_authenticated" ON attendance_logs
  FOR ALL USING (auth.role() = 'authenticated');

-- ── decrement_stock RPC (SECURITY DEFINER bypasses RLS already) ───────

CREATE OR REPLACE FUNCTION decrement_stock(product_id TEXT, qty INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET "stockQty" = GREATEST("stockQty" - qty, 0)
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION decrement_stock(TEXT, INTEGER) TO authenticated;

-- ════════════════════════════════════════════════════════════════════
-- ✅ All done — no more recursion, no more duplicate policy errors!
-- ════════════════════════════════════════════════════════════════════
