-- =====================================================
-- Migration: Fix column naming consistency
-- Purpose: Align database columns with Drizzle schema
-- Date: 2026-01-22
-- =====================================================

-- Step 1: Check current table structure
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
ORDER BY ordinal_position;

-- Step 2: Rename column if needed (idempotent)
DO $$
BEGIN
  -- Check if old column name exists
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'last_check_in'
  ) THEN
    -- Rename to match schema
    ALTER TABLE public.users
    RENAME COLUMN last_check_in TO last_check_in_at;

    RAISE NOTICE 'Column last_check_in renamed to last_check_in_at';
  ELSIF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'last_check_in_at'
  ) THEN
    RAISE NOTICE 'Column last_check_in_at already exists, skipping';
  ELSE
    -- Column doesn't exist at all, create it
    ALTER TABLE public.users
    ADD COLUMN last_check_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

    RAISE NOTICE 'Column last_check_in_at created';
  END IF;
END $$;

-- Step 3: Ensure other required columns exist
DO $$
BEGIN
  -- contact1_name
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'contact1_name'
  ) THEN
    ALTER TABLE public.users ADD COLUMN contact1_name TEXT;
    RAISE NOTICE 'Column contact1_name created';
  END IF;

  -- contact1_phone
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'contact1_phone'
  ) THEN
    ALTER TABLE public.users ADD COLUMN contact1_phone TEXT;
    RAISE NOTICE 'Column contact1_phone created';
  END IF;

  -- contact2_name
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'contact2_name'
  ) THEN
    ALTER TABLE public.users ADD COLUMN contact2_name TEXT;
    RAISE NOTICE 'Column contact2_name created';
  END IF;

  -- contact2_phone
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'contact2_phone'
  ) THEN
    ALTER TABLE public.users ADD COLUMN contact2_phone TEXT;
    RAISE NOTICE 'Column contact2_phone created';
  END IF;
END $$;

-- Step 4: Verify final structure
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
ORDER BY ordinal_position;

-- =====================================================
-- USAGE:
-- 1. Open Supabase Dashboard > SQL Editor
-- 2. Paste and run this entire script
-- 3. Verify output shows successful column operations
-- =====================================================
