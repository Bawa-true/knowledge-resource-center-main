-- =====================================================
-- SUPABASE DIAGNOSTIC SCRIPT
-- =====================================================

-- Check if we can access storage schema
SELECT 'Storage schema access test:' as test;
SELECT EXISTS (
    SELECT FROM information_schema.schemata 
    WHERE schema_name = 'storage'
) as storage_schema_exists;

-- Check storage tables
SELECT 'Storage tables:' as test;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'storage';

-- Check current user and permissions
SELECT 'Current user info:' as test;
SELECT current_user, session_user;

-- Check if we can read from storage.buckets
SELECT 'Can read storage.buckets:' as test;
SELECT COUNT(*) as bucket_count FROM storage.buckets;

-- Check if we can insert into storage.buckets
SELECT 'Testing insert permission...' as test;
BEGIN;
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('test-bucket', 'test-bucket', true);
  SELECT 'Insert successful!' as result;
ROLLBACK;

-- Show any existing buckets
SELECT 'Existing buckets:' as test;
SELECT id, name, public, file_size_limit 
FROM storage.buckets; 