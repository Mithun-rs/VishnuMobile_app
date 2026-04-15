-- ════════════════════════════════════════════════════════════════════
-- FINAL FIX: Set roles in user_metadata (bypasses RLS entirely)
-- Run in: Supabase → SQL Editor → New Query
-- ════════════════════════════════════════════════════════════════════

UPDATE auth.users
SET raw_user_meta_data = '{"username":"Admin","role":"admin"}'
WHERE email = 'admin@vishnumobileshop.com';

UPDATE auth.users
SET raw_user_meta_data = '{"username":"Staff","role":"staff"}'
WHERE email = 'staff@vishnumobileshop.com';

-- Verify
SELECT email, raw_user_meta_data FROM auth.users
WHERE email IN ('admin@vishnumobileshop.com','staff@vishnumobileshop.com', 'attendance@vishnumobileshop.com');

-- ════════════════════════════════════════════════════════════════════
-- NOTE FOR NEW ATTENDANCE ADMIN & PASSWORD CHANGES:
-- 1. Create a new user (e.g., attendance@vishnumobileshop.com) via the Supabase Dashboard Authentication page.
-- 2. If you need to change the password of the existing admin, you can also easily do it by clicking on the user in the Supabase Dashboard -> "Reset password" or "Change password".
-- 3. After creating the new attendance admin user in the dashboard, run the SQL block below to set their role so they only see the Staff Attendance page:
-- ════════════════════════════════════════════════════════════════════

UPDATE auth.users
SET raw_user_meta_data = '{"username":"AttendanceAdmin","role":"attendance_admin"}'
WHERE email = 'attendance@vishnumobileshop.com';
