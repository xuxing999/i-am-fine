-- =====================================================
-- Migration: Add created_at column to users table
-- Purpose: Support FTUE optimization (First Time User Experience)
-- Date: 2026-01-22
-- =====================================================

-- Step 1: Check if column exists (informational query)
-- Run this first to verify the current state
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
ORDER BY ordinal_position;

-- Step 2: Add created_at column if it doesn't exist
-- This will fail gracefully if the column already exists
DO $$
BEGIN
  -- Check if column exists
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'created_at'
  ) THEN
    -- Add the column with default value
    ALTER TABLE public.users
    ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

    -- Set created_at for existing users (use last_check_in_at as fallback)
    UPDATE public.users
    SET created_at = COALESCE(last_check_in_at, NOW())
    WHERE created_at IS NULL;

    RAISE NOTICE 'Column created_at has been added successfully';
  ELSE
    RAISE NOTICE 'Column created_at already exists, skipping';
  END IF;
END $$;

-- Step 3: Verify the column was added
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
  AND column_name = 'created_at';

-- Step 4: Check sample data
SELECT id, username, display_name, last_check_in_at, created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 5;

-- =====================================================
-- IMPORTANT NOTES:
-- =====================================================
-- 1. This migration is IDEMPOTENT - safe to run multiple times
-- 2. Existing users will have created_at = last_check_in_at (reasonable fallback)
-- 3. New users will get created_at = NOW() automatically
-- 4. The column is nullable to support edge cases
-- 5. After running this, the FTUE optimization will work correctly
--
-- USAGE:
-- 1. Copy this entire file
-- 2. Go to Supabase Dashboard > SQL Editor
-- 3. Paste and run
-- 4. Verify the output shows "Column created_at has been added successfully"
-- =====================================================
