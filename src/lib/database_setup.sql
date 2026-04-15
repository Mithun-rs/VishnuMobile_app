-- ════════════════════════════════════════════════════════════════════
-- VISHNU MOBILE SHOP — SUPABASE DATABASE SETUP (FIXED)
-- NOTE: camelCase column names are double-quoted so PostgreSQL
--       preserves their case exactly as your frontend expects.
-- Run this in: Supabase → SQL Editor → New Query → Run
-- ════════════════════════════════════════════════════════════════════

-- ─── Clean up if re-running ─────────────────────────────────────────
DROP TABLE IF EXISTS order_items     CASCADE;
DROP TABLE IF EXISTS orders          CASCADE;
DROP TABLE IF EXISTS attendance_logs CASCADE;
DROP TABLE IF EXISTS staff           CASCADE;
DROP TABLE IF EXISTS products        CASCADE;
DROP TABLE IF EXISTS categories      CASCADE;
DROP TABLE IF EXISTS profiles        CASCADE;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.update_product_status();


-- ─── 1. PROFILES ────────────────────────────────────────────────────
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'staff')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ─── 2. CATEGORIES ──────────────────────────────────────────────────
-- cat.id, cat.name, cat.productCount, cat.icon
CREATE TABLE categories (
  id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name           TEXT NOT NULL,
  "productCount" INTEGER DEFAULT 0,
  icon           TEXT DEFAULT '🗂️',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO categories (id, name, "productCount", icon) VALUES
  ('default_1', 'Smartphones', 0, '📱'),
  ('default_2', 'Accessories', 0, '🎧')
ON CONFLICT (id) DO NOTHING;


-- ─── 3. PRODUCTS ────────────────────────────────────────────────────
-- Exact match: product.name, .sku, .currency, .price, .marketPrice,
-- .discount, .status, .category, .image, .description, .color,
-- .storage, .stockQty, .available
CREATE TABLE products (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name          TEXT NOT NULL,
  sku           TEXT UNIQUE NOT NULL,
  currency      TEXT DEFAULT '₹',
  price         NUMERIC(10,2) NOT NULL DEFAULT 0,
  "marketPrice" NUMERIC(10,2) DEFAULT 0,
  discount      NUMERIC(5,2)  DEFAULT 0,
  status        TEXT DEFAULT 'IN STOCK'
                  CHECK (status IN ('IN STOCK','LOW STOCK','OUT OF STOCK')),
  category      TEXT DEFAULT 'Smartphones',
  image         TEXT,
  description   TEXT DEFAULT '',
  color         TEXT DEFAULT '',
  storage       TEXT DEFAULT '',
  "stockQty"    INTEGER DEFAULT 0,
  available     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update status when stockQty changes
CREATE OR REPLACE FUNCTION public.update_product_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."stockQty" > 5 THEN
    NEW.status := 'IN STOCK';
  ELSIF NEW."stockQty" > 0 THEN
    NEW.status := 'LOW STOCK';
  ELSE
    NEW.status := 'OUT OF STOCK';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_product_status
  BEFORE INSERT OR UPDATE OF "stockQty" ON products
  FOR EACH ROW EXECUTE FUNCTION public.update_product_status();

-- Seed default products
INSERT INTO products (id, name, sku, currency, price, status, category, color, storage, "stockQty", image)
VALUES
  ('APP-I5P-256-BL',  'iPhone 15 Pro - Blue Titanium',     'APP-I5P-256-BL',  '₹', 134999, 'IN STOCK',  'Smartphones', 'Blue Titanium', '256 GB', 24, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80'),
  ('SAM-S24U-512-TI', 'Samsung S24 Ultra - Titanium Gray', 'SAM-S24U-512-TI', '₹', 134999, 'LOW STOCK', 'Smartphones', 'Titanium Gray', '512 GB',  3, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80')
ON CONFLICT (id) DO NOTHING;


-- ─── 4. STAFF ───────────────────────────────────────────────────────
-- member.id, .name, .role, .joiningDate, .phone, .address,
-- .username, .avatarBg
CREATE TABLE staff (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'SALES ASSOCIATE'
                  CHECK (role IN ('SALES ASSOCIATE','INVENTORY MGR','SALES LEAD','TECH SUPPORT','MANAGER')),
  "joiningDate" TEXT NOT NULL,
  phone         TEXT NOT NULL,
  address       TEXT DEFAULT '',
  username      TEXT UNIQUE NOT NULL,
  "avatarBg"    TEXT DEFAULT '#E8EAF6',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO staff (id, name, role, "joiningDate", phone, address, username, "avatarBg") VALUES
  ('1', 'Arjun Mehta', 'SALES ASSOCIATE', 'Oct 12, 2023', '+91 98765-43210', '12, Gandhi Nagar, Coimbatore, Tamil Nadu - 641001',       'vms_arjun', '#FFF8E1'),
  ('2', 'Sana Khan',   'INVENTORY MGR',   'Jan 05, 2024', '+91 98765-43211', '45, Nehru Street, Coimbatore, Tamil Nadu - 641002',        'vms_sana',  '#FFF3E0'),
  ('3', 'Rahul Verma', 'SALES ASSOCIATE', 'Mar 15, 2024', '+91 98765-43212', '78, RS Puram, Coimbatore, Tamil Nadu - 641002',            'vms_rahul', '#E8EAF6'),
  ('4', 'Priya Patel', 'SALES LEAD',      'May 01, 2024', '+91 98765-43215', '23, Saibaba Colony, Coimbatore, Tamil Nadu - 641011',      'vms_priya', '#E3F2FD')
ON CONFLICT (id) DO NOTHING;


-- ─── 5. ATTENDANCE LOGS ─────────────────────────────────────────────
-- entry.id, .name, .initials, .role, .time, .status, .avatarColor
CREATE TABLE attendance_logs (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name         TEXT NOT NULL,
  initials     TEXT DEFAULT '',
  role         TEXT NOT NULL,
  time         TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'PRESENT'
                 CHECK (status IN ('PRESENT','LATE','HALF-DAY','ABSENT')),
  "avatarColor" TEXT DEFAULT '#4A90D9',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);


-- ─── 6. ORDERS ──────────────────────────────────────────────────────
-- bill.customerName, .phoneNumber, .paymentMethod,
-- .subtotal, .gstAmount, .totalPayable, tx.status
CREATE TABLE orders (
  id               TEXT PRIMARY KEY,
  "customerName"   TEXT DEFAULT '',
  "phoneNumber"    TEXT DEFAULT '',
  "paymentMethod"  TEXT DEFAULT 'upi'
                     CHECK ("paymentMethod" IN ('upi','cash','card')),
  subtotal         NUMERIC(10,2) DEFAULT 0,
  "gstAmount"      NUMERIC(10,2) DEFAULT 0,
  "totalPayable"   NUMERIC(10,2) DEFAULT 0,
  status           TEXT DEFAULT 'COMPLETED'
                     CHECK (status IN ('COMPLETED','PROCESSING','PENDING','CANCELLED')),
  created_by       UUID REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);


-- ─── 7. ORDER ITEMS ─────────────────────────────────────────────────
-- item.id, item.name, item.sku, item.price, item.qty, item.image
CREATE TABLE order_items (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  order_id    TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  TEXT REFERENCES products(id),
  name        TEXT NOT NULL,
  sku         TEXT NOT NULL,
  price       NUMERIC(10,2) NOT NULL,
  qty         INTEGER NOT NULL DEFAULT 1,
  image       TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);


-- ════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE products        ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff           ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items     ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- categories — anyone authenticated can read, only admin writes
CREATE POLICY "categories_read" ON categories
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "categories_admin_write" ON categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- products — anyone authenticated can read, only admin writes
CREATE POLICY "products_read" ON products
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "products_admin_write" ON products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- staff — admin only
CREATE POLICY "staff_admin_only" ON staff
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- attendance — admin only
CREATE POLICY "attendance_admin_only" ON attendance_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- orders — users see own orders, admin sees all
CREATE POLICY "orders_insert_own" ON orders
  FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "orders_read" ON orders
  FOR SELECT USING (
    auth.uid() = created_by OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- order_items
CREATE POLICY "order_items_read" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND (orders.created_by = auth.uid() OR
             EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );
CREATE POLICY "order_items_insert" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND orders.created_by = auth.uid()
    )
  );

-- ════════════════════════════════════════════════════════════════════
-- SUCCESS — All 7 tables created with exact frontend column names!
-- ════════════════════════════════════════════════════════════════════
