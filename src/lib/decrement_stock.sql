-- ════════════════════════════════════════════════════════════════════
-- Create decrement_stock function
-- Called after checkout to reduce stockQty automatically
-- Run in: Supabase → SQL Editor → New Query
-- ════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION decrement_stock(product_id TEXT, qty INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET "stockQty" = GREATEST("stockQty" - qty, 0)
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
