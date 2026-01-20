import { useUser, useLogout } from "@/hooks/use-auth";
import { useCheckIn } from "@/hooks/use-check-in";
import { StatusCard } from "@/components/StatusCard";
import { Loader2, LogOut, Share2, ShieldCheck, HeartPulse, Phone, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Dashboard() {
  const { data: user, isLoading: isLoadingUser } = useUser();
  const { mutate: logout } = useLogout();
  const { mutate: checkIn, isPending: isCheckingIn } = useCheckIn();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [localIsSafe, setLocalIsSafe] = useState(true);

  // 每 100 毫秒進行一次本地精準比對
  useEffect(() => {
    if (!user?.lastCheckInAt) return;

    // 用於測試的變數：逾時時間（秒）
    const TIMEOUT_SECONDS = 30;
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

  // Status Display
  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold text-gray-800">{user.displayName}</h1>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-3 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                  <Settings className="h-8 w-8" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setLocation("/settings")} className="py-3 text-lg cursor-pointer">
                  <Settings className="mr-2 h-5 w-5" /> 設定家人電話
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare} className="py-3 text-lg cursor-pointer">
                  <Share2 className="mr-2 h-5 w-5" /> 分享狀態給家人
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => logout()} className="py-3 text-lg text-red-600 cursor-pointer">
                  <LogOut className="mr-2 h-5 w-5" /> 登出
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
      </main>
    </div>
  );
}
