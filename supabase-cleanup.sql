-- =====================================================
-- Supabase Data Cleanup Script
-- 清理孤立的測試數據
-- =====================================================

-- IMPORTANT: 這個腳本會刪除所有測試用戶數據！
-- 請確保您了解這個操作的後果。

-- 步驟 1: 查看現有的用戶數據
SELECT id, username, display_name, created_at
FROM public.users
ORDER BY created_at DESC;

-- 步驟 2: 刪除特定用戶的數據（替換 'username_here' 為實際的用戶名）
-- 例如：DELETE FROM public.users WHERE username = 'super';
-- DELETE FROM public.users WHERE username = 'username_here';

-- 步驟 3: 刪除所有測試用戶數據（謹慎使用！）
-- 取消註釋下面這行以刪除所有用戶數據：
-- DELETE FROM public.users;

-- =====================================================
-- 注意事項
-- =====================================================
-- 1. 這個腳本只清理 public.users 表格的數據
-- 2. Supabase Auth 中的用戶需要在後台手動刪除：
--    前往：Authentication > Users
--    找到對應的用戶並點擊刪除
-- 3. 或者，您可以讓修復後的註冊流程自動處理這些情況

-- =====================================================
-- 快速清理特定用戶（推薦）
-- =====================================================
-- 如果您知道哪個用戶名有問題，直接刪除：

-- 刪除 'super' 用戶的數據
DELETE FROM public.users WHERE username = 'super';

-- 確認刪除結果
SELECT id, username, display_name, created_at
FROM public.users
ORDER BY created_at DESC;

-- =====================================================
-- 之後的步驟
-- =====================================================
-- 1. 在 Supabase Dashboard 的 Authentication > Users 中手動刪除 super@gmail.com
-- 2. 重新註冊 'super' 帳號
-- 3. 或者直接使用新的用戶名註冊
