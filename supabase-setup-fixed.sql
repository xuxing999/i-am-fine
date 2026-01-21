-- =====================================================
-- Supabase Setup SQL - FIXED VERSION
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Step 1: Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Public can read user status" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Step 2: Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 3: Create policies

-- Policy 1: Users can insert their own profile during registration
-- This is CRITICAL for registration to work
CREATE POLICY "Users can insert own profile"
ON users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy 2: Users can read their own profile
CREATE POLICY "Users can read own profile"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 3: Public can read user status (for public status page)
-- This allows anonymous users to view status pages
CREATE POLICY "Public can read user status"
ON users FOR SELECT
TO anon, authenticated
USING (true);

-- Policy 4: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'users';

-- List all policies on users table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users'
ORDER BY policyname;

-- =====================================================
-- IMPORTANT NOTES:
-- =====================================================
-- 1. Make sure Supabase Auth email confirmation is DISABLED:
--    Go to: Authentication > Providers > Email
--    Toggle OFF "Confirm email"
--
-- 2. Your .env should contain:
--    VITE_SUPABASE_URL=https://kpduuujmcsytteyegggx.supabase.co
--    VITE_SUPABASE_ANON_KEY=your-anon-key-here
--
-- 3. After running this SQL, try:
--    - Register a new account
--    - Check the browser console for detailed logs
--    - If registration fails, check the error message for policy violations
-- =====================================================
