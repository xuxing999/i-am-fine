-- =====================================================
-- Supabase Setup SQL
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Enable Row Level Security on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Policy: Allow public read access to specific columns for status page
-- This allows the public status page (/status/:username) to work
CREATE POLICY "Public can read user status"
ON users FOR SELECT
USING (true)
WITH CHECK (true);

-- Note: The above policy allows public read access to ALL columns.
-- If you want to restrict which columns are visible publicly,
-- you'll need to handle that in your application code by only selecting
-- specific columns (id, username, display_name, last_check_in_at)

-- Policy: New users can be inserted during registration
-- This is handled by Supabase Auth triggers, but we need to allow inserts
CREATE POLICY "Users can insert own profile"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

-- =====================================================
-- IMPORTANT: After running this SQL, you need to:
-- 1. Get your Supabase project URL and ANON key from:
--    https://supabase.com/dashboard/project/kpduuujmcsytteyegggx/settings/api
-- 2. Add them to your .env file:
--    VITE_SUPABASE_URL=https://kpduuujmcsytteyegggx.supabase.co
--    VITE_SUPABASE_ANON_KEY=your-anon-key-here
-- 3. Add the same variables to Vercel environment variables:
--    vercel env add VITE_SUPABASE_URL
--    vercel env add VITE_SUPABASE_ANON_KEY
-- =====================================================
