-- =====================================================
-- 測試 RLS 政策 - 驗證公開狀態頁面的訪問權限
-- =====================================================

-- 1. 檢查當前的 RLS 政策
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users'
ORDER BY policyname;

-- 2. 檢查 RLS 是否已啟用
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'users';

-- 3. 查看 users 表格的所有欄位
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- 4. 測試查詢（模擬公開訪問）
-- 請將 'your_username' 替換為實際註冊的用戶名
SELECT id, username, display_name, last_check_in
FROM users
WHERE username = 'your_username';

-- =====================================================
-- 如果上面的查詢返回「permission denied」或「row-level security policy」錯誤
-- 請執行以下修復腳本：
-- =====================================================

-- 刪除現有的公開讀取政策
DROP POLICY IF EXISTS "Public can read user status" ON users;

-- 重新創建公開讀取政策（允許匿名訪問）
CREATE POLICY "Public can read user status"
ON users FOR SELECT
TO anon, authenticated
USING (true);

-- 驗證政策已創建
SELECT policyname, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'users'
  AND policyname = 'Public can read user status';

-- =====================================================
-- 完整的 RLS 政策設置（如果需要從頭開始）
-- =====================================================

-- 先刪除所有現有政策
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Public can read user status" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- 確保 RLS 已啟用
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 1. 允許匿名用戶和已認證用戶讀取所有用戶資料（公開狀態頁面需要）
CREATE POLICY "Public can read user status"
ON users FOR SELECT
TO anon, authenticated
USING (true);

-- 2. 允許已認證用戶插入自己的資料（註冊時需要）
CREATE POLICY "Users can insert own profile"
ON users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 3. 允許已認證用戶更新自己的資料（報平安、設定時需要）
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 驗證所有政策
SELECT
    policyname,
    roles,
    cmd,
    CASE
        WHEN qual IS NULL THEN '(no condition)'
        ELSE qual
    END as using_clause
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users'
ORDER BY policyname;
