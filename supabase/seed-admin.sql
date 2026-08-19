-- Create first admin user (run once in Supabase SQL Editor)
-- 1) Dashboard → Authentication → Providers → enable Email
-- 2) Dashboard → Authentication → Users → Add user:
--    Email: admin@admin.elimarket.local
--    Password: (your secure password)
-- 3) Then run this to grant admin role:

UPDATE public.profiles
SET role = 'admin', full_name = 'Admin'
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'admin@admin.elimarket.local'
);

-- Login at /login with username: admin  (or full email)
