-- ════════════════════════════════════════════════════════════════════
-- LEAVES + HOLIDAYS SETUP (Vishnu Mobile Shop)
-- Run in: Supabase → SQL Editor → New Query → Run
-- Safe to re-run (uses IF NOT EXISTS / DROP POLICY IF EXISTS)
-- ════════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────────
-- 1) LEAVE REQUESTS
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.leave_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  from_date    TIMESTAMPTZ NOT NULL,
  to_date      TIMESTAMPTZ NOT NULL,

  reason       TEXT DEFAULT '',
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  decided_at   TIMESTAMPTZ,
  decided_by   UUID REFERENCES public.profiles(id)
);

ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leave_insert_own"          ON public.leave_requests;
DROP POLICY IF EXISTS "leave_select_own_or_admin" ON public.leave_requests;
DROP POLICY IF EXISTS "leave_update_admin_only"   ON public.leave_requests;
DROP POLICY IF EXISTS "leave_delete_admin_only"   ON public.leave_requests;

-- Staff can apply leave only for themselves
CREATE POLICY "leave_insert_own" ON public.leave_requests
  FOR INSERT
  WITH CHECK (auth.uid() = staff_id);

-- Staff can see their own requests; admin can see all
CREATE POLICY "leave_select_own_or_admin" ON public.leave_requests
  FOR SELECT
  USING (
    auth.uid() = staff_id
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Only admin can approve/reject (update)
CREATE POLICY "leave_update_admin_only" ON public.leave_requests
  FOR UPDATE
  USING ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' );

-- Optional: only admin can delete
CREATE POLICY "leave_delete_admin_only" ON public.leave_requests
  FOR DELETE
  USING ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' );


-- ────────────────────────────────────────────────────────────────────
-- 2) HOLIDAYS
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.holidays (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date       DATE NOT NULL UNIQUE,
  title      TEXT NOT NULL DEFAULT 'Holiday',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "holidays_select_authenticated" ON public.holidays;
DROP POLICY IF EXISTS "holidays_admin_write"          ON public.holidays;

-- Everyone logged in can see holiday calendar
CREATE POLICY "holidays_select_authenticated" ON public.holidays
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only admin can add/update/delete holidays
CREATE POLICY "holidays_admin_write" ON public.holidays
  FOR ALL
  USING ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' );

-- ════════════════════════════════════════════════════════════════════
-- ✅ Done
-- ════════════════════════════════════════════════════════════════════

