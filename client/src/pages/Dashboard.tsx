import { useUser, useLogout } from "@/hooks/use-auth";
import { useCheckIn } from "@/hooks/use-check-in";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { Loader2, LogOut, Share2, ShieldCheck, HeartPulse, Phone, Settings, Download } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: user, isLoading: isLoadingUser } = useUser();
  const { mutate: logout } = useLogout();
  const { mutate: checkIn, isPending: isCheckingIn } = useCheckIn();
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [localIsSafe, setLocalIsSafe] = useState(true);
  const [isIOS, setIsIOS] = useState(false);
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Debug user data on mount
  useEffect(() => {
    console.log('[Dashboard] User data:', user);
    console.log('[Dashboard] User keys:', user ? Object.keys(user) : 'user is null/undefined');
    console.log('[Dashboard] User.username:', user?.username);
    console.log('[Dashboard] User.displayName:', user?.displayName);
  }, [user]);

  useEffect(() => {
    const ua = window.navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua));
  }, []);

  // 每秒進行一次本地精準比對（使用動態閾值）
  useEffect(() => {
    const updateSafeStatus = () => {
      if (!user?.lastCheckInAt) {
        // 如果從未報平安，狀態為不安全（需要報平安）
        setLocalIsSafe(false);
        return;
      }

      // 🆕 FTUE 優化：檢查是否為新用戶（剛註冊未報平安）
      // 如果 lastCheckInAt 與 createdAt 相差 < 10 秒，視為「從未報平安」
      if (user.createdAt) {
        const lastCheckIn = new Date(user.lastCheckInAt).getTime();
        const createdAt = new Date(user.createdAt).getTime();
        const timeSinceCreation = Math.abs(lastCheckIn - createdAt) / 1000;

        if (timeSinceCreation < 10) {
          // 新用戶剛註冊，lastCheckInAt 是 DB 預設值，視為「從未報平安」
          console.log(`[Dashboard] 新用戶首次登入，按鈕應可點擊`);
          setLocalIsSafe(false);
          return;
        }
      }

      // 🔧 使用動態閾值判斷：基於時間差而非日期
      const lastCheckIn = new Date(user.lastCheckInAt).getTime();
      const now = new Date().getTime();
      const secondsPassed = (now - lastCheckIn) / 1000;
      const userThreshold = user.timeoutThreshold || 86400; // 預設 24 小時

      // 如果時間差小於閾值，視為「已報平安」（按鈕灰色）
      // 如果時間差大於等於閾值，視為「需要報平安」（按鈕綠色）
      const isWithinThreshold = secondsPassed < userThreshold;

      console.log(`[Dashboard] Time check: ${secondsPassed.toFixed(1)}s passed, threshold=${userThreshold}s, isWithinThreshold=${isWithinThreshold}`);
      setLocalIsSafe(isWithinThreshold);
    };

    // 立即執行一次
    updateSafeStatus();

    // 每秒更新一次狀態
    const timer = setInterval(updateSafeStatus, 1000);

    return () => clearInterval(timer);
  }, [user?.lastCheckInAt, user?.createdAt, user?.timeoutThreshold]);

  // Realtime 訂閱：監聽自己的 user 資料變更（包含 timeout_threshold）
  useEffect(() => {
    if (!user?.id) return;

    console.log('[Dashboard] Setting up Realtime subscription for user:', user.id);

    // 訂閱自己的 user 資料變更
    const channel = supabase
      .channel(`dashboard-user-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          console.log('[Dashboard Realtime] User data updated:', payload);

          // 立即刷新 user 資料（包含新的 timeout_threshold）
          queryClient.invalidateQueries({ queryKey: ['user'] });

          // 如果 timeout_threshold 變更了，顯示提示
          if (payload.new.timeout_threshold !== payload.old.timeout_threshold) {
            console.log(`[Dashboard Realtime] Threshold changed: ${payload.old.timeout_threshold} → ${payload.new.timeout_threshold}`);
          }
        }
      )
      .subscribe((status) => {
        console.log('[Dashboard Realtime] Subscription status:', status);
      });

    channelRef.current = channel;

    return () => {
      console.log('[Dashboard] Cleaning up Realtime subscription');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user?.id, queryClient]);

  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  const handleShare = () => {
    console.log('[Dashboard] handleShare - user:', user);
    console.log('[Dashboard] handleShare - user.username:', user.username);

    if (!user.username) {
      toast({
        variant: "destructive",
        title: "無法分享",
        description: "找不到您的用戶名，請重新登入"
      });
      return;
    }

    const url = `${window.location.origin}/status/${user.username}`;
    console.log('[Dashboard] Generated share URL:', url);

    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "連結已複製",
        description: `連結：${url}`,
        duration: 3000, // 3 秒後自動關閉
      });
    }).catch((err) => {
      console.error('[Dashboard] Failed to copy URL:', err);
      toast({
        variant: "destructive",
        title: "複製失敗",
        description: "請手動複製連結：" + url
      });
    });
  };

  // 已報平安 = 在時限內報過平安
  // 未報平安 = 從未報平安 OR 超過時限
  const isAlreadyCheckedInToday = localIsSafe;

  // 處理 PWA 安裝
  const handlePWAInstall = async () => {
    const success = await promptInstall();
    if (success) {
      toast({
        title: "安裝成功",
        description: "應用程式已加入您的裝置",
        className: "bg-green-100 border-green-500 text-green-900",
        duration: 3000, // 3 秒後自動關閉
      });
    }
  };

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-9 w-9 text-primary" />
            <h1 className="text-3xl font-black text-gray-900">{user.displayName}</h1>
          </div>
          <div className="flex gap-2">
            <Drawer>
              <DrawerTrigger asChild>
                <button
                  className="min-w-[44px] min-h-[44px] p-3 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors active:scale-95"
                  aria-label="開啟設定選單"
                >
                  <Settings className="h-7 w-7" />
                </button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mx-auto w-full max-w-sm p-6 space-y-6 pointer-events-auto">
                  <DrawerHeader className="px-0 text-center">
                    <DrawerTitle className="text-2xl font-black text-gray-900">設定選單</DrawerTitle>
                    <DrawerDescription className="text-lg text-gray-600">請選擇您要進行的操作</DrawerDescription>
                  </DrawerHeader>
                  <div className="grid gap-4">
                    <Button
                      variant="outline"
                      size="lg"
                      className="min-h-[60px] py-8 text-xl font-bold rounded-2xl justify-start gap-3 active:scale-95 transition-transform"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation("/settings");
                      }}
                    >
                      <Settings className="h-6 w-6 flex-shrink-0" /> <span>設定家人電話</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="min-h-[60px] py-8 text-xl font-bold rounded-2xl justify-start gap-3 active:scale-95 transition-transform"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare();
                      }}
                    >
                      <Share2 className="h-6 w-6 flex-shrink-0" /> <span>分享狀態給家人</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="lg"
                      className="min-h-[60px] py-8 text-xl font-bold rounded-2xl justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 active:scale-95 transition-transform"
                      onClick={(e) => {
                        e.stopPropagation();
                        logout();
                      }}
                    >
                      <LogOut className="h-6 w-6 flex-shrink-0" /> <span>登出</span>
                    </Button>
                  </div>
                  <DrawerFooter className="px-0 pt-4">
                    <DrawerClose asChild>
                      <Button
                        variant="secondary"
                        size="lg"
                        className="min-h-[60px] py-8 text-xl font-bold rounded-2xl w-full active:scale-95 transition-transform"
                        onClick={(e) => e.stopPropagation()}
                      >
                        關閉
                      </Button>
                    </DrawerClose>
                  </DrawerFooter>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 pt-10 space-y-12">
        {/* Status Display */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-black text-gray-900">
            {isAlreadyCheckedInToday ? "太棒了！" : "您好！"}
          </h2>
          <p className="text-2xl font-medium text-gray-600 leading-relaxed">
            {isAlreadyCheckedInToday 
              ? "已經告訴孩子，您今天很好喔！" 
              : "點點大按鈕，讓孩子放心。"}
          </p>
        </div>

        {/* Primary Action - Huge Circular Button */}
        <div className="flex justify-center py-8">
          <motion.button
            whileTap={!isAlreadyCheckedInToday ? { scale: 0.9 } : {}}
            onClick={() => !isAlreadyCheckedInToday && checkIn()}
            disabled={isCheckingIn || isAlreadyCheckedInToday}
            className={`
              ${!isAlreadyCheckedInToday ? 'check-in-button breathing' : ''}
              w-64 h-64 rounded-full
              flex flex-col items-center justify-center gap-4
              text-white shadow-2xl
              transition-all duration-300
              ${isAlreadyCheckedInToday
                ? "bg-gray-300 shadow-none cursor-default"
                : "bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"}
            `}
          >
            {isCheckingIn ? (
              <Loader2 className="w-20 h-20 animate-spin" />
            ) : (
              <HeartPulse className={`w-24 h-24 ${!isAlreadyCheckedInToday ? "animate-pulse" : ""}`} />
            )}
            <span className="text-4xl font-black">
              {isCheckingIn ? "更新中" : isAlreadyCheckedInToday ? "今天也很好" : "我很好！"}
            </span>
          </motion.button>
        </div>

        {/* Emergency Contacts - Quick Call Style */}
        <div className="space-y-6">
          <h3 className="text-2xl font-black text-gray-800 text-center">找家人聊聊</h3>
          <div className="grid grid-cols-1 gap-4">
            <a 
              href={user.contact1Phone ? `tel:${user.contact1Phone}` : "#"}
              onClick={(e) => {
                if (!user.contact1Phone) {
                  e.preventDefault();
                  toast({
                    title: "溫馨提示",
                    description: "請先到設定頁面填寫家人的聯絡電話喔！",
                    duration: 3000, // 3 秒後自動關閉
                  });
                }
              }}
              className="flex items-center justify-between bg-white p-6 rounded-3xl border-4 border-gray-100 shadow-sm hover:border-primary/50 active:bg-gray-50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Phone className="w-7 h-7" />
                </div>
                <span className="text-3xl font-bold text-gray-900">{user.contact1Name || "聯絡人 1"}</span>
              </div>
              <span className="text-xl font-medium text-gray-400">撥打電話</span>
            </a>
            <a 
              href={user.contact2Phone ? `tel:${user.contact2Phone}` : "#"}
              onClick={(e) => {
                if (!user.contact2Phone) {
                  e.preventDefault();
                  toast({
                    title: "溫馨提示",
                    description: "請先到設定頁面填寫家人的聯絡電話喔！",
                    duration: 3000, // 3 秒後自動關閉
                  });
                }
              }}
              className="flex items-center justify-between bg-white p-6 rounded-3xl border-4 border-gray-100 shadow-sm hover:border-primary/50 active:bg-gray-50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Phone className="w-7 h-7" />
                </div>
                <span className="text-3xl font-bold text-gray-900">{user.contact2Name || "聯絡人 2"}</span>
              </div>
              <span className="text-xl font-medium text-gray-400">撥打電話</span>
            </a>
          </div>
        </div>

        {/* PWA Install Guide - 只在未安裝時顯示 */}
        {!isInstalled && (
          <div className="bg-green-50 p-8 rounded-3xl border-2 border-green-100 space-y-4">
            <div className="flex items-center gap-3 text-green-700">
              <Download className="w-7 h-7" />
              <h3 className="text-2xl font-black">把應用放在桌面</h3>
            </div>

            {isInstallable ? (
              // Android/Chrome - 顯示直接安裝按鈕
              <div className="space-y-4">
                <p className="text-xl text-green-800 font-medium leading-relaxed">
                  點擊下方按鈕，將「平安守護」加入您的手機桌面，下次使用更方便！
                </p>
                <button
                  onClick={handlePWAInstall}
                  className="w-full py-6 px-6 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-2xl font-black text-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <Download className="w-6 h-6" />
                  <span>立即安裝到桌面</span>
                </button>
              </div>
            ) : isIOS ? (
              // iOS - 顯示手動安裝說明
              <p className="text-xl text-green-800 font-medium leading-relaxed">
                點擊下方的「分享」按鈕 <span className="inline-block px-2 border border-green-600 rounded">分享</span>，再選擇「加入主畫面」，報平安更快速！
              </p>
            ) : (
              // 其他瀏覽器 - 顯示通用說明
              <p className="text-xl text-green-800 font-medium leading-relaxed">
                點擊瀏覽器右上角的選單，選擇「安裝應用程式」或「加到主畫面」，之後在桌面就能直接開啟囉！
              </p>
            )}
          </div>
        )}

        {/* 已安裝提示 */}
        {isInstalled && (
          <div className="bg-blue-50 p-6 rounded-3xl border-2 border-blue-100 text-center">
            <p className="text-xl text-blue-800 font-medium">
              ✨ 應用已成功安裝！您可以從桌面直接開啟使用。
            </p>
          </div>
        )}
      </main>
    </div>
  );
}