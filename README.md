# 我很好 (I'm Fine) — 獨居者的數位平安鐘

> 讓愛不需言說，讓關心不再打擾
> 一個專為獨居長輩與在外遊子打造的隱形守護系統

[![PWA Ready](https://img.shields.io/badge/PWA-Ready-success)](https://web.dev/progressive-web-apps/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e)](https://supabase.com/)

---

## 📖 專案緣起

在這個快速變遷的社會中，越來越多的長輩獨自生活，子女遠在他方。每一通「你還好嗎？」的電話，都承載著深深的牽掛，卻也可能打斷長輩寶貴的休息時光。

**「我很好」** 不是一個冰冷的 App，而是一座連結愛與安心的數位橋樑。我們相信，最好的守護，是讓被守護者感受到自由，讓守護者得到安心。

---

## 💡 核心價值

### 🌟 減少焦慮
- 子女不必反覆致電確認平安，減少「打擾」的心理負擔
- 長輩不需記得複雜操作，一鍵報平安，生活節奏不被打斷

### 🛡️ 隱形守護
- 沒有繁瑣的通知轟炸，只在真正需要時輕聲提醒
- 尊重隱私，不追蹤位置，不記錄行為，只關心「你是否安好」

### ⚡ 極簡操作
- 為數位能力較弱的使用者設計，大字體、大按鈕、零學習成本
- PWA 技術，無需下載 App Store，一鍵加入桌面即可使用

---

## ✨ 主要功能

### 1️⃣ 定時平安報到
- 長輩每天只需點擊一次「我很好」按鈕
- 系統記錄最後報到時間，自動更新狀態頁面
- 支援自定義報到週期（24小時 / 12小時 / 自定義）

### 2️⃣ 異常未報警示
- 超過設定時間未報到，自動通知守護者圈子
- 多層級提醒機制：溫和提示 → 主動關心 → 緊急聯繫
- 避免誤報：可設定「延遲通知」緩衝時間

### 3️⃣ 守護者圈子（Trust Circle）
- 支援多位家人共同守護，分散關心壓力
- 即時狀態頁面，隨時查看長輩最新報平安時間
- 一鍵撥打電話功能，緊急時刻快速聯繫

### 4️⃣ 低門檻 UI 設計
- **大按鈕設計**：主要操作區域達 256×256px
- **高對比配色**：綠色（安全）/ 紅色（警示），清晰易辨
- **語音提示**：未來將整合語音引導功能
- **離線可用**：PWA 技術確保網路不穩時仍可操作

---

## 🏗️ 技術架構

### 前端技術棧
```
React 18.3 + TypeScript 5.6
Vite 7.3 (PWA Plugin)
Tailwind CSS 4.x
React Query (狀態管理)
Wouter (輕量路由)
```

### 後端技術棧
```
Supabase (PostgreSQL + Realtime)
  ├─ Authentication (使用者認證)
  ├─ Database (用戶資料 + 報到記錄)
  ├─ Row Level Security (隱私保護)
  └─ Edge Functions (未來整合通知系統)
```

### 高可靠性通知系統（規劃中）
- **Push Notifications**：Web Push API + Service Worker
- **SMS 備援**：整合 Twilio / AWS SNS 簡訊通知
- **Email 通知**：SMTP 郵件警示
- **多通道容錯**：確保至少一種通知方式送達

### 資料庫設計原則
#### 隱私去識別化
- 不儲存敏感個人資訊（身分證、詳細地址）
- 電話號碼加密存儲，僅用於緊急聯繫
- 報到記錄保留 30 天後自動清除

#### 高可用性
- Supabase Postgres 自動備份（每日）
- Realtime 即時同步，確保狀態更新延遲 < 1 秒
- CDN 加速，全球部署確保訪問速度

---

## 🗺️ 開發路線圖

### 🚀 Phase 1: MVP 核心功能（已完成）
- [x] 使用者註冊 / 登入系統
- [x] 一鍵報平安功能
- [x] 即時狀態頁面（公開連結分享）
- [x] PWA 安裝支援（iOS / Android）
- [x] 守護者聯絡人管理

### 🔔 Phase 2: 智能通知系統（開發中）
- [ ] Web Push Notifications（瀏覽器推播）
- [ ] SMS 簡訊警示（整合 Twilio）
- [ ] Email 通知備援
- [ ] 通知偏好設定（靜音時段、頻率控制）

### 🏠 Phase 3: IoT 感測器整合
- [ ] **電力偵測**：偵測家中用電情況判斷活動狀態
- [ ] **門禁感應**：整合智慧門鎖，記錄進出時間
- [ ] **穿戴裝置**：Apple Watch / 小米手環心率監測
- [ ] **環境感測**：溫濕度、煙霧偵測異常警報

### 🚑 Phase 4: 緊急救援聯動
- [ ] **一鍵 SOS**：緊急按鈕直接撥打 119
- [ ] **GPS 定位**（選擇性開啟）：緊急時分享位置
- [ ] **社區聯防**：整合鄰里守望系統
- [ ] **醫療資訊卡**：儲存過敏史、常用藥物等資訊

### 🌐 Phase 5: 社會防護網擴展
- [ ] **志工媒合系統**：連結在地志工定期關懷
- [ ] **社福資源整合**：串接政府長照資源
- [ ] **數據儀表板**（去識別化）：協助社福機構掌握區域需求
- [ ] **多語言支援**：服務新住民家庭

---

## 🛠️ 本地開發

### 環境需求
```bash
Node.js >= 18.0
npm >= 9.0
```

### 安裝與啟動
```bash
# 1. 克隆專案
git clone https://github.com/xuxing999/i-am-fine.git
cd i-am-fine

# 2. 安裝依賴
npm install

# 3. 設定環境變數
cp .env.example .env
# 編輯 .env，填入你的 Supabase 金鑰

# 4. 啟動開發伺服器
npm run dev
```

### 環境變數設定
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 建置生產版本
```bash
npm run build
# 輸出至 dist/public/
```

---

## 📱 PWA 安裝指南

### Android / Chrome
1. 使用 Chrome 瀏覽器開啟網站
2. 點擊右上角選單 → **「安裝應用程式」**
3. 確認安裝，應用將出現在桌面

### iOS / Safari
1. 使用 Safari 瀏覽器開啟網站
2. 點擊底部 **「分享」** 按鈕
3. 選擇 **「加入主畫面」**
4. 點擊「加入」，應用將出現在桌面

---

## 🤝 貢獻指南

我們歡迎任何形式的貢獻！無論是：
- 🐛 回報 Bug
- 💡 提出新功能建議
- 📝 改善文件
- 🌐 提供翻譯
- 💻 提交程式碼

請參考 [CONTRIBUTING.md](CONTRIBUTING.md)（建立中）了解詳細流程。

---

## 📄 授權條款

本專案採用 **MIT License** 開源授權。

我們相信科技應該服務每一個人，尤其是最需要幫助的族群。歡迎各組織、團體基於本專案進行改良與推廣，共同編織更緊密的社會安全網。

---

## 💌 聯絡我們

- **專案維護者**：XUDEV
- **Email**：待補充
- **GitHub Issues**：[回報問題](https://github.com/xuxing999/i-am-fine/issues)

---

## 🙏 致謝

感謝所有關心獨居長輩議題的朋友們。
這個專案的每一行程式碼，都承載著「讓愛更簡單」的初衷。

**讓我們一起，用科技溫暖每一個孤單的角落。**

---

<div align="center">

**🤖 Generated with [Claude Code](https://claude.com/claude-code)**

Made with ❤️ for every family that cares

</div>
