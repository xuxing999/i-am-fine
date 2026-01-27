import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useUser } from '@/hooks/use-auth';

/**
 * JellySplash - 專業級果凍感啟動動畫
 *
 * 特點：
 * - 使用 #00c16e 品牌綠色
 * - cubic-bezier(0.34, 1.56, 0.64, 1) 彈性曲線（Material Design Easing）
 * - GPU 加速 (transform + opacity)
 * - 自動防止長輩誤觸（動畫期間禁用底層互動）
 * - 等待 Auth 初始化完成，防止閃爍
 */
export function JellySplash() {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanding, setIsExpanding] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const { isLoading: isAuthLoading } = useUser();

  // 確保最小顯示時間（防止動畫太快消失）
  useEffect(() => {
    const minTimer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 500); // 最少顯示 500ms，讓動畫有足夠時間呈現

    return () => clearTimeout(minTimer);
  }, []);

  // 當 Auth 載入完成且最小時間已過，開始消失動畫
  useEffect(() => {
    if (!isAuthLoading && minTimeElapsed) {
      // 延遲 50ms 開始擴張動畫（讓 Auth 完成的狀態穩定）
      const expandTimer = setTimeout(() => {
        setIsExpanding(true);
      }, 50);

      // 800ms 後完全隱藏（動畫 750ms + 50ms buffer）
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 800);

      return () => {
        clearTimeout(expandTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [isAuthLoading, minTimeElapsed]);

  // 完全移除元素，避免佔用 DOM
  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Splash Layer - 固定層，阻止底層互動 */}
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
        style={{
          backgroundColor: '#00c16e',
          pointerEvents: isExpanding ? 'none' : 'auto', // 動畫期間阻止點擊穿透
        }}
      >
        {/* Logo Container - 從中心擴張 */}
        <div
          className="jelly-splash-circle"
          style={{
            transform: isExpanding ? 'scale(30)' : 'scale(1)',
            opacity: isExpanding ? 0 : 1,
          }}
        >
          <ShieldCheck className="jelly-splash-logo" />
        </div>
      </div>

      {/* Internal Styles - 嵌入式 CSS 以確保動畫精準控制 */}
      <style>{`
        .jelly-splash-circle {
          position: relative;
          width: 120px;
          height: 120px;
          background-color: #00c16e;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 750ms cubic-bezier(0.34, 1.56, 0.64, 1),
                      opacity 750ms ease-out;
          will-change: transform, opacity;
          backface-visibility: hidden;
          transform: translateZ(0);
        }

        .jelly-splash-logo {
          width: 64px;
          height: 64px;
          color: white;
          stroke-width: 2.5;
          filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15));
        }

        /* GPU 加速優化 */
        .jelly-splash-circle,
        .jelly-splash-logo {
          backface-visibility: hidden;
          perspective: 1000px;
        }
      `}</style>
    </>
  );
}
