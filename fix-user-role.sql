-- Fix user role in database to match auth metadata
-- This script updates the user's role in the users table to 'admin'

-- Update the specific user's role to admin
UPDATE public.users 
SET role = 'admin' 
WHERE id = '9f78e76a-7aab-4e15-a1b2-6d0fc39541a7';

-- Verify the update
SELECT id, email, role, created_at 
FROM public.users 
WHERE id = '9f78e76a-7aab-4e15-a1b2-6d0fc39541a7';

-- Check all admin users
SELECT id, email, role, created_at 
FROM public.users 
WHERE role = 'admin'; 