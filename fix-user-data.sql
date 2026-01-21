-- =====================================================
-- 修復用戶數據 - 更新缺失的 username 和 display_name
-- =====================================================

-- 步驟 1: 查看當前所有用戶的數據
SELECT
    id,
    username,
    display_name,
    contact1_name,
    last_check_in
FROM users
ORDER BY last_check_in DESC NULLS LAST;

-- 步驟 2: 找出 username 為 NULL 的用戶
SELECT
    id,
    username,
    display_name,
    last_check_in
FROM users
WHERE username IS NULL OR display_name IS NULL;

-- 步驟 3: 修復特定用戶的數據
-- 請替換以下內容：
--   'USER_UUID_HERE' - 替換為用戶的實際 UUID (從上面的查詢結果中複製)
--   'actual_username' - 替換為用戶實際的用戶名
--   'Actual Display Name' - 替換為用戶實際的顯示名稱

-- 範例：
-- UPDATE users
-- SET
--     username = 'john',
--     display_name = 'John Doe'
-- WHERE id = '0d47bc99-af7b-4c67-b94b-a2ad83b098d5';

-- 您的實際更新語句（請取消註釋並修改）：
UPDATE users
SET
    username = 'YOUR_ACTUAL_USERNAME',  -- 請替換為實際的用戶名
    display_name = 'YOUR_DISPLAY_NAME'  -- 請替換為實際的顯示名稱
WHERE id = '0d47bc99-af7b-4c67-b94b-a2ad83b098d5';  -- 這是您的用戶 ID

-- 步驟 4: 驗證更新結果
SELECT
    id,
    username,
    display_name,
    contact1_name,
    last_check_in
FROM users
WHERE id = '0d47bc99-af7b-4c67-b94b-a2ad83b098d5';

-- =====================================================
-- 快速修復：如果您不記得用戶名
-- =====================================================

-- 查詢 Supabase Auth 中對應的 email
-- 然後從 email 中提取用戶名（email 格式是 username@gmail.com）

-- 從 auth.users 表格查詢（需要有權限）
SELECT
    id,
    email,
    created_at
FROM auth.users
WHERE id = '0d47bc99-af7b-4c67-b94b-a2ad83b098d5';

-- =====================================================
-- 批量修復所有 NULL 用戶名的用戶
-- =====================================================

-- 注意：這會將所有 username 為 NULL 的用戶的 username 和 display_name
-- 設置為他們的 ID（不推薦，但可以作為臨時方案）

-- UPDATE users
-- SET
--     username = COALESCE(username, id::text),
--     display_name = COALESCE(display_name, id::text)
-- WHERE username IS NULL OR display_name IS NULL;
