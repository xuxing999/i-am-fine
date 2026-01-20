import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { zhTW } from "date-fns/locale";

interface StatusCardProps {
  isSafe: boolean;
  lastCheckInAt: string | null;
  className?: string;
  showDetails?: boolean;
  isPublic?: boolean;
}

export function StatusCard({ isSafe, lastCheckInAt, className = "", showDetails = true, isPublic = false }: StatusCardProps) {
  const timeAgo = lastCheckInAt 
    ? formatDistanceToNow(new Date(lastCheckInAt), { addSuffix: true, locale: zhTW })
    : "尚未報平安";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`
        rounded-3xl p-6 shadow-xl border-2 transition-colors duration-500
        ${isSafe 
          ? "bg-green-50 border-green-200 shadow-green-900/5" 
          : isPublic 
            ? "bg-red-600 border-red-700 text-white shadow-red-900/20" 
            : "bg-red-50 border-red-200 shadow-red-900/5"}
        ${className}
      `}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20 
          }}
          className={`
            p-4 rounded-full 
            ${isSafe ? "bg-green-100 text-green-600" : isPublic ? "bg-white text-red-600" : "bg-red-100 text-red-600"}
          `}
        >
          {isSafe ? (
            <CheckCircle2 className="w-16 h-16 md:w-20 md:h-20" />
          ) : (
            <AlertCircle className="w-16 h-16 md:w-20 md:h-20" />
          )}
        </motion.div>

        <div>
          <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${isSafe ? "text-green-800" : isPublic ? "text-white" : "text-red-800"}`}>
            {isSafe ? "今日已確認平安" : "需要報平安"}
          </h2>
          <p className={`text-lg font-medium ${isSafe ? "text-muted-foreground" : isPublic ? "text-red-100" : "text-red-600"}`}>
            {isSafe ? "目前狀態顯示為安全" : "逾時未更新狀態"}
          </p>
        </div>

        {showDetails && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full mt-4 ${isPublic && !isSafe ? "bg-red-700 text-white" : "text-muted-foreground bg-white/50"}`}>
            <Clock className="w-5 h-5" />
            <span className="text-base md:text-lg">
              最後更新：{timeAgo}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
