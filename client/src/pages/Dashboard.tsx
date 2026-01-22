import { useUser, useLogout } from "@/hooks/use-auth";
import { useCheckIn } from "@/hooks/use-check-in";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { Loader2, LogOut, Share2, ShieldCheck, HeartPulse, Phone, Settings, Download } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { CHECKIN_TIMEOUT_SECONDS } from "@/config/constants";
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

  // 每秒進行一次本地精準比對
  useEffect(() => {
    const updateSafeStatus = () => {
      if (!user?.lastCheckInAt) {
        // 如果從未報平安，狀態為不安全（需要報平安）
        setLocalIsSafe(false);
        return;
      }

      const lastCheckIn = new Date(user.lastCheckInAt).getTime();
      const now = new Date().getTime();
      const secondsPassed = (now - lastCheckIn) / 1000;
      const isSafe = secondsPassed < CHECKIN_TIMEOUT_SECONDS;

      console.log(`[Dashboard] Safe status check: ${secondsPassed.toFixed(1)}s passed, isSafe=${isSafe}`);
      setLocalIsSafe(isSafe);
    };

    // 立即執行一次
    updateSafeStatus();

    // 每秒更新一次狀態
    const timer = setInterval(updateSafeStatus, 1000);

    return () => clearInterval(timer);
  }, [user?.lastCheckInAt]);

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
        className: "bg-green-100 border-green-500 text-green-900"
      });
    }
  };

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold text-gray-800">{user.displayName}</h1>
          </div>
          <div className="flex gap-2">
            <Drawer>
              <DrawerTrigger asChild>
                <button className="p-3 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                  <Settings className="h-8 w-8" />
                </button>
              </DrawerTrigger>
              <DrawerContent className="z-[100]">
                <div className="mx-auto w-full max-w-sm p-6 space-y-6">
                  <DrawerHeader className="px-0 text-center">
                    <DrawerTitle className="text-2xl font-black">設定選單</DrawerTitle>
                    <DrawerDescription className="text-lg">請選擇您要進行的操作</DrawerDescription>
                  </DrawerHeader>
                  <div className="grid gap-4">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="py-8 text-xl font-bold rounded-2xl justify-start gap-4"
                      onClick={() => {
                        setLocation("/settings");
                      }}
                    >
                      <Settings className="h-6 w-6" /> <span>設定家人電話</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="py-8 text-xl font-bold rounded-2xl justify-start gap-4"
                      onClick={handleShare}
                    >
                      <Share2 className="h-6 w-6" /> <span>分享狀態給家人</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="lg" 
                      className="py-8 text-xl font-bold rounded-2xl justify-start gap-4 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => logout()}
                    >
                      <LogOut className="h-6 w-6" /> <span>登出</span>
                    </Button>
                  </div>
                  <DrawerFooter className="px-0 pt-4">
                    <DrawerClose asChild>
                      <Button variant="secondary" size="lg" className="py-8 text-xl font-bold rounded-2xl w-full">關閉</Button>
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
                  });
                }
              }}
              className="flex items-center justify-between bg-white p-6 rounded-3xl border-4 border-gray-100 shadow-sm hover:border-primary/50 active:bg-gray-50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Phone className="w-8 h-8" />
                </div>
                <span className="text-3xl font-bold text-gray-800">{user.contact1Name || "聯絡人 1"}</span>
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
                  });
                }
              }}
              className="flex items-center justify-between bg-white p-6 rounded-3xl border-4 border-gray-100 shadow-sm hover:border-primary/50 active:bg-gray-50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Phone className="w-8 h-8" />
                </div>
                <span className="text-3xl font-bold text-gray-800">{user.contact2Name || "聯絡人 2"}</span>
              </div>
              <span className="text-xl font-medium text-gray-400">撥打電話</span>
            </a>
          </div>
        </div>

        {/* PWA Install Guide - 只在未安裝時顯示 */}
        {!isInstalled && (
          <div className="bg-green-50 p-8 rounded-3xl border-2 border-green-100 space-y-4">
            <div className="flex items-center gap-3 text-green-700">
              <Download className="w-8 h-8" />
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
                  <Download className="w-7 h-7" />
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