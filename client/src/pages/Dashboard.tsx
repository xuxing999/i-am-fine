import { useUser, useLogout } from "@/hooks/use-auth";
import { useCheckIn } from "@/hooks/use-check-in";
import { Loader2, LogOut, Share2, ShieldCheck, HeartPulse, Phone, Settings, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
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
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [localIsSafe, setLocalIsSafe] = useState(true);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua));
  }, []);

  // 每 100 毫秒進行一次本地精準比對
  useEffect(() => {
    if (!user?.lastCheckInAt) return;

    // 用於測試的變數：逾時時間（秒）
    const TIMEOUT_SECONDS = 30; // 測試用，正式環境應為 86400 (24小時)
    const lastCheckIn = new Date(user.lastCheckInAt).getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const secondsPassed = (now - lastCheckIn) / 1000;
      setLocalIsSafe(secondsPassed < TIMEOUT_SECONDS);
    }, 1000);

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
    const url = `${window.location.origin}/status/${user.username}`;
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "連結已複製",
        description: "請將連結貼上並傳送給家人",
      });
    });
  };

  const isAlreadyCheckedInToday = localIsSafe;

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
                      <Settings className="h-6 w-6" /> 設定家人電話
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="py-8 text-xl font-bold rounded-2xl justify-start gap-4"
                      onClick={handleShare}
                    >
                      <Share2 className="h-6 w-6" /> 分享狀態給家人
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="lg" 
                      className="py-8 text-xl font-bold rounded-2xl justify-start gap-4 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => logout()}
                    >
                      <LogOut className="h-6 w-6" /> 登出
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
          <div className="relative">
            <AnimatePresence>
              {!isAlreadyCheckedInToday && (
                <motion.div
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 1.2, opacity: 0 }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2,
                    ease: "easeOut" 
                  }}
                  className="absolute inset-0 bg-green-400 rounded-full"
                />
              )}
            </AnimatePresence>
            
            <motion.button
              whileTap={!isAlreadyCheckedInToday ? { scale: 0.9 } : {}}
              onClick={() => !isAlreadyCheckedInToday && checkIn()}
              disabled={isCheckingIn || isAlreadyCheckedInToday}
              className={`
                relative z-10
                w-64 h-64 rounded-full
                flex flex-col items-center justify-center gap-4
                text-white shadow-2xl
                transition-all duration-500
                ${isAlreadyCheckedInToday 
                  ? "bg-gray-300 shadow-none cursor-default" 
                  : "bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 active:shadow-inner"}
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

        {/* PWA Install Guide */}
        <div className="bg-green-50 p-8 rounded-3xl border-2 border-green-100 space-y-4">
          <div className="flex items-center gap-3 text-green-700">
            <Download className="w-8 h-8" />
            <h3 className="text-2xl font-black">把應用放在桌面</h3>
          </div>
          <p className="text-xl text-green-800 font-medium leading-relaxed">
            {isIOS ? (
              <span>點擊下方的「分享」按鈕 <span className="inline-block px-2 border rounded">分享</span>，再選擇「加入主畫面」，報平安更快速！</span>
            ) : (
              <span>點擊瀏覽器右上角的選單，選擇「安裝應用程式」，之後在桌面就能直接開啟囉！</span>
            )}
          </p>
        </div>
      </main>
    </div>
  );
}