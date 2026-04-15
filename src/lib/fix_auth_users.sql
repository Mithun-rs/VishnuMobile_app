-- ════════════════════════════════════════════════════════════════════
-- FIX: Add missing fields to manually-inserted auth users
-- Run in: Supabase → SQL Editor → New Query
-- ════════════════════════════════════════════════════════════════════

UPDATE auth.users
SET
  is_sso_user        = FALSE,
  is_super_admin     = FALSE,
  deleted_at         = NULL,
  confirmation_token = '',
  recovery_token     = '',
  email_change_token_new = '',
  email_change       = ''
WHERE email IN (
  'admin@vishnumobileshop.com',
  'staff@vishnumobileshop.com'
);
