-- ════════════════════════════════════════════════════════════════════
-- CREATE USERS — CORRECT SUPABASE SQL
-- Run in: Supabase → SQL Editor → New Query
-- ════════════════════════════════════════════════════════════════════

-- Admin User
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@vishnumobileshop.com'
  ) THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'admin@vishnumobileshop.com',
      crypt('Admin@123', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"username":"Admin","role":"admin"}',
      NOW(),
      NOW()
    );
  END IF;
END $$;


-- Staff User
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'staff@vishnumobileshop.com'
  ) THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'staff@vishnumobileshop.com',
      crypt('Staff@123', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"username":"Staff","role":"staff"}',
      NOW(),
      NOW()
    );
  END IF;
END $$;
