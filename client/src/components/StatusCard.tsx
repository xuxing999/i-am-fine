import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { zhTW } from "date-fns/locale";

interface StatusCardProps {
  isSafe: boolean;
  lastCheckInAt: string | null;
  className?: string;
  showDetails?: boolean;
}

export function StatusCard({ isSafe, lastCheckInAt, className = "", showDetails = true }: StatusCardProps) {
  const timeAgo = lastCheckInAt 
    ? formatDistanceToNow(new Date(lastCheckInAt), { addSuffix: true, locale: zhTW })
    : "尚未報平安";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`
        rounded-3xl p-6 shadow-xl border-2
        ${isSafe 
          ? "bg-green-50 border-green-200 shadow-green-900/5" 
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
            ${isSafe ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}
          `}
        >
          {isSafe ? (
            <CheckCircle2 className="w-16 h-16 md:w-20 md:h-20" />
          ) : (
            <AlertCircle className="w-16 h-16 md:w-20 md:h-20" />
          )}
        </motion.div>

        <div>
          <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${isSafe ? "text-green-800" : "text-red-800"}`}>
            {isSafe ? "今日已確認平安" : "需要報平安"}
          </h2>
          <p className="text-lg text-muted-foreground font-medium">
            {isSafe ? "目前狀態顯示為安全" : "超過24小時未更新狀態"}
          </p>
        </div>

        {showDetails && (
          <div className="flex items-center gap-2 text-muted-foreground bg-white/50 px-4 py-2 rounded-full mt-4">
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
