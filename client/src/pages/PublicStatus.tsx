import { usePublicStatus } from "@/hooks/use-check-in";
import { StatusCard } from "@/components/StatusCard";
import { Loader2, ShieldQuestion, ExternalLink } from "lucide-react";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";

export default function PublicStatus() {
  const [, params] = useRoute("/status/:username");
  const username = params?.username || "";
  const { data: status, isLoading, error } = usePublicStatus(username);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto space-y-8"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{status.displayName}</h1>
          <p className="text-lg text-gray-500">目前的平安狀態</p>
        </div>

        <StatusCard 
          isSafe={status.isSafe} 
          lastCheckInAt={status.lastCheckInAt}
          className="shadow-2xl"
        />

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 text-center space-y-4">
          <p className="text-gray-600">
            這是 <span className="font-bold text-gray-900">{status.displayName}</span> 的即時狀態頁面。
            <br />
            您可以將此頁面加入書籤以便隨時查看。
          </p>
          <div className="pt-4 border-t">
            <Link href="/" className="inline-flex items-center text-primary font-medium hover:underline gap-1">
              我也要使用平安守護 <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
