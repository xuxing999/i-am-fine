import { useEffect, useState } from 'react';
import { X, Download, Share } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * PWAInstallGuide - 智能 PWA 安裝引導組件
 *
 * 功能：
 * - 自動偵測裝置類型（iOS Safari / Android Chrome）
 * - iOS: 顯示底部浮動氣泡，指引用戶使用「分享」按鈕
 * - Android: 提供一鍵安裝按鈕（監聽 beforeinstallprompt）
 * - 關閉後 7 天內不再顯示
 * - 已安裝 PWA 時自動隱藏
 */

const STORAGE_KEY = 'pwa-install-guide-dismissed';
const DISMISS_DURATION_DAYS = 7;

interface PWAInstallGuideProps {
  onInstall?: () => void;
}

export function PWAInstallGuide({ onInstall }: PWAInstallGuideProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'other'>('other');
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    // 1. 檢查是否已安裝 PWA
    const isInstalled =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isInstalled) {
      console.log('[PWAInstallGuide] Already installed, hiding guide');
      return;
    }

    // 2. 檢查是否在關閉期間內（7天）
    const dismissedAt = localStorage.getItem(STORAGE_KEY);
    if (dismissedAt) {
      const dismissTime = new Date(dismissedAt).getTime();
      const now = new Date().getTime();
      const daysPassed = (now - dismissTime) / (1000 * 60 * 60 * 24);

      if (daysPassed < DISMISS_DURATION_DAYS) {
        console.log('[PWAInstallGuide] Dismissed recently, hiding guide');
        return;
      }
    }

    // 3. 偵測裝置類型
    const detectDevice = () => {
      const ua = window.navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
      const isAndroid = /Android/.test(ua);

      if (isIOS) {
        return 'ios';
      } else if (isAndroid) {
        return 'android';
      }
      return 'other';
    };

    const device = detectDevice();
    setDeviceType(device);

    // 4. iOS: 延遲 2 秒後顯示引導氣泡
    if (device === 'ios') {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }

    // 5. Android: 監聽 beforeinstallprompt 事件
    if (device === 'android') {
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setInstallPrompt(e);
        setIsVisible(true);
        console.log('[PWAInstallGuide] beforeinstallprompt event captured');
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  // 關閉引導（記錄到 localStorage）
  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    setIsVisible(false);
  };

  // Android 一鍵安裝
  const handleAndroidInstall = async () => {
    if (!installPrompt) return;

    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        console.log('[PWAInstallGuide] User accepted install');
        onInstall?.();
      }

      // 無論接受或拒絕，都記錄關閉狀態
      handleDismiss();
    } catch (error) {
      console.error('[PWAInstallGuide] Install error:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {/* iOS 引導氣泡 */}
      {deviceType === 'ios' && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed bottom-6 left-4 right-4 z-[9998] mx-auto max-w-md"
        >
          <div className="relative bg-gradient-to-br from-green-500 to-green-600 rounded-3xl p-6 shadow-2xl border-2 border-white/20">
            {/* 關閉按鈕 */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition-all"
              aria-label="關閉"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Share className="w-6 h-6 text-white" />
              </div>

              <div className="flex-1 text-white">
                <h3 className="text-xl font-black mb-2">快速安裝到桌面</h3>
                <p className="text-base font-medium leading-relaxed mb-3">
                  點擊 Safari 底部的 <span className="inline-flex items-center justify-center w-6 h-6 bg-white/30 rounded mx-1">
                    <Share className="w-3 h-3" />
                  </span> 「分享」按鈕，然後選擇「加入主畫面」即可完成安裝。
                </p>

                <button
                  onClick={handleDismiss}
                  className="w-full py-3 bg-white text-green-600 font-black text-lg rounded-2xl hover:bg-white/90 active:scale-95 transition-all shadow-lg"
                >
                  我知道了
                </button>
              </div>
            </div>

            {/* 動態指示箭頭 */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut"
              }}
              className="absolute -bottom-8 left-1/2 -translate-x-1/2"
            >
              <div className="text-green-500 text-4xl">↓</div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Android 一鍵安裝按鈕 */}
      {deviceType === 'android' && installPrompt && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed top-20 left-4 right-4 z-[9998] mx-auto max-w-md"
        >
          <div className="relative bg-gradient-to-br from-green-500 to-green-600 rounded-3xl p-5 shadow-2xl border-2 border-white/20">
            {/* 關閉按鈕 */}
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition-all"
              aria-label="關閉"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Download className="w-6 h-6 text-white" />
              </div>

              <div className="flex-1 text-white">
                <h3 className="text-xl font-black">安裝到桌面</h3>
                <p className="text-sm font-medium">下次使用更方便快速</p>
              </div>
            </div>

            <button
              onClick={handleAndroidInstall}
              className="w-full py-4 bg-white text-green-600 font-black text-xl rounded-2xl hover:bg-white/90 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Download className="w-6 h-6" />
              <span>立即安裝</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
