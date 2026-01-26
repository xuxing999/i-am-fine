-- =====================================================
-- 新增 timeout_threshold 欄位
-- 用於儲存用戶自訂的報平安超時閾值（秒）
-- =====================================================

-- 步驟 1: 新增欄位（預設 24 小時）
ALTER TABLE users
ADD COLUMN IF NOT EXISTS timeout_threshold INTEGER DEFAULT 86400 NOT NULL;

-- 步驟 2: 為現有用戶設定預設值（確保沒有 NULL）
UPDATE users
SET timeout_threshold = 86400
WHERE timeout_threshold IS NULL;

-- 步驟 3: 新增註解說明
COMMENT ON COLUMN users.timeout_threshold IS '報平安超時閾值（秒）：30秒(測試)、43200秒(12小時)、86400秒(24小時)';

-- 步驟 4: 驗證欄位已成功新增
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'timeout_threshold';

-- =====================================================
-- 預期結果：
-- column_name         | data_type | column_default
-- --------------------|-----------|---------------
-- timeout_threshold   | integer   | 86400
-- =====================================================
