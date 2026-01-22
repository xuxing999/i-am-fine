import { usePublicStatus } from "@/hooks/use-check-in";
import { Loader2, ShieldCheck, ShieldAlert, Phone, Clock, ShieldQuestion, ExternalLink } from "lucide-react";
import { useRoute, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { CHECKIN_TIMEOUT_SECONDS } from "@/config/constants";

export default function PublicStatus() {
  const [match, params] = useRoute("/status/:username");
  const username = params?.username || "";

  console.log('[PublicStatus] Route match:', match);
  console.log('[PublicStatus] Params:', params);
  console.log('[PublicStatus] Username from params:', username);

  const { data: status, isLoading, error } = usePublicStatus(username);
  const [localIsSafe, setLocalIsSafe] = useState(true);
  const queryClient = useQueryClient();

  // 每秒進行一次本地精準比對，確保倒數精確同步
  useEffect(() => {
    const updateSafeStatus = () => {
      if (!status?.lastCheckInAt) {
        setLocalIsSafe(false);
        return;
      }

      const lastCheckIn = new Date(status.lastCheckInAt).getTime();
      const now = new Date().getTime();
      const secondsPassed = (now - lastCheckIn) / 1000;
      const isSafe = secondsPassed < CHECKIN_TIMEOUT_SECONDS;

      console.log(`[PublicStatus] Safe status check: ${secondsPassed.toFixed(1)}s passed, isSafe=${isSafe}`);
      setLocalIsSafe(isSafe);
    };

    // 立即執行一次
    updateSafeStatus();

    // 每秒更新一次狀態
    const timer = setInterval(updateSafeStatus, 1000);

    return () => clearInterval(timer);
  }, [status?.lastCheckInAt]);

  // 同步 API 回傳的狀態
  useEffect(() => {
    if (status) {
      setLocalIsSafe(status.isSafe);
    }
  }, [status]);

  // 每 5 秒自動重新獲取數據 (後台輪詢作為保險)
  useEffect(() => {
    if (!username) return;

    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['public-status', username] });
    }, 5000);

    return () => clearInterval(interval);
  }, [username, queryClient]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <ShieldQuestion className="h-20 w-20 text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800">找不到使用者</h1>
        <p className="text-gray-500 mt-2">連結可能錯誤或該使用者不存在</p>
        <Link href="/" className="mt-8 px-6 py-3 bg-white border border-gray-300 rounded-xl font-medium text-gray-700 shadow-sm hover:bg-gray-50">
          前往首頁
        </Link>
      </div>
    );
  }

  const isSafe = localIsSafe;

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${isSafe ? "bg-green-50" : "bg-red-50"}`}>
      <main className="max-w-md mx-auto px-6 pt-16 pb-20 space-y-12">
        {/* Status Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black text-gray-900">
            {status.displayName}
          </h1>
          <p className={`text-2xl font-bold leading-relaxed ${isSafe ? "text-green-700" : "text-red-700"}`}>
            {isSafe 
              ? `${status.displayName}今天很好喔！` 
              : `${status.displayName}還沒說他很好，請打個電話關心一下。`}
          </p>
        </div>

        {/* Status Icon - Huge Circle */}
        <div className="flex justify-center py-8">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={isSafe ? "safe" : "alert"}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", damping: 15 }}
                className={`
                  w-64 h-64 rounded-full
                  flex flex-col items-center justify-center
                  shadow-2xl
                  ${isSafe ? "bg-green-500" : "bg-red-500"}
                `}
              >
                {isSafe ? (
                  <ShieldCheck className="w-32 h-32 text-white" />
                ) : (
                  <ShieldAlert className="w-32 h-32 text-white animate-bounce" />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Breathing animation for safe status */}
            {isSafe && (
              <motion.div
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.3, opacity: 0 }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 3,
                  ease: "easeOut" 
                }}
                className="absolute inset-0 bg-green-400 rounded-full -z-10"
              />
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="space-y-4">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border-2 border-white shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-bold">最後報平安時間</p>
              <p className="text-xl font-black text-gray-800">
                {status.lastCheckInAt 
                  ? format(new Date(status.lastCheckInAt), "MM/dd HH:mm:ss", { locale: zhTW })
                  : "尚未有報平安紀錄"}
              </p>
            </div>
          </div>

          <a 
            href={`tel:${status.displayName}`} // Note: In a real app we'd use a real phone field.
            className={`
              flex items-center justify-between p-6 rounded-3xl border-4 shadow-xl transition-all active:scale-95
              ${isSafe 
                ? "bg-white border-green-100 text-green-700 hover:border-green-300" 
                : "bg-red-600 border-red-500 text-white hover:bg-red-700"}
            `}
          >
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isSafe ? "bg-green-100" : "bg-white/20"}`}>
                <Phone className="w-7 h-7" />
              </div>
              <span className="text-2xl font-black">撥打電話給 {status.displayName}</span>
            </div>
          </a>
        </div>

        <div className={`rounded-2xl p-6 shadow-sm border text-center space-y-4 ${!isSafe ? "bg-red-600 border-red-400 text-white" : "bg-white border-gray-200 text-gray-600"}`}>
          <p>
            這是 <span className={`font-bold ${!isSafe ? "text-white" : "text-gray-900"}`}>{status.displayName}</span> 的即時狀態頁面。
            <br />
            您可以將此頁面加入書籤以便隨時查看。
          </p>
          <div className={`pt-4 border-t ${!isSafe ? "border-red-400" : "border-gray-100"}`}>
            <Link href="/" className={`inline-flex items-center font-medium hover:underline gap-1 ${!isSafe ? "text-red-100" : "text-primary"}`}>
              我也要使用平安守護 <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <p className="text-center text-gray-400 font-medium pt-4">
          平安守護 - 守護您最愛的家人
        </p>
      </main>
    </div>
  );
}
