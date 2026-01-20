import { useUser, useLogout } from "@/hooks/use-auth";
import { useCheckIn } from "@/hooks/use-check-in";
import { StatusCard } from "@/components/StatusCard";
import { Loader2, LogOut, Share2, ShieldCheck, HeartPulse } from "lucide-react";
import { motion } from "framer-motion";
import { differenceInHours } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { data: user, isLoading: isLoadingUser } = useUser();
  const { mutate: logout } = useLogout();
  const { mutate: checkIn, isPending: isCheckingIn } = useCheckIn();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect if not logged in (handled by wrapper usually, but defensive here)
  if (!user) {
    setLocation("/login");
    return null;
  }

  const lastCheckIn = user.lastCheckInAt ? new Date(user.lastCheckInAt) : null;
  const hoursSinceLastCheckIn = lastCheckIn ? differenceInHours(new Date(), lastCheckIn) : 999;
  const isSafe = hoursSinceLastCheckIn < 24;

  const handleShare = () => {
    const url = `${window.location.origin}/status/${user.username}`;
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "連結已複製",
        description: "請將連結貼上並傳送給家人",
      });
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold text-gray-800">{user.displayName}</h1>
          </div>
          <button 
            onClick={() => logout()}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="登出"
          >
            <LogOut className="h-6 w-6" />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-8 space-y-8">
        {/* Status Display */}
        <StatusCard 
          isSafe={isSafe} 
          lastCheckInAt={user.lastCheckInAt} 
          className="w-full"
        />

        {/* Primary Action */}
        <div className="py-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => checkIn()}
            disabled={isCheckingIn}
            className={`
              w-full relative overflow-hidden group
              bg-gradient-to-br from-green-500 to-green-600 
              text-white rounded-3xl p-8 
              shadow-lg shadow-green-500/30
              hover:shadow-xl hover:shadow-green-500/40 hover:-translate-y-1
              transition-all duration-300
              disabled:opacity-80 disabled:cursor-not-allowed
            `}
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-3xl" />
            
            <div className="relative flex flex-col items-center justify-center gap-4">
              {isCheckingIn ? (
                <Loader2 className="w-20 h-20 animate-spin" />
              ) : (
                <HeartPulse className="w-20 h-20 animate-pulse" />
              )}
              <span className="text-3xl font-black tracking-wider text-shadow">
                {isCheckingIn ? "更新中..." : "我平安無事"}
              </span>
              <span className="text-lg font-medium opacity-90">
                點擊此處報平安
              </span>
            </div>
          </motion.button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-3 bg-white p-5 rounded-2xl border-2 border-gray-100 shadow-sm hover:border-primary/50 hover:bg-primary/5 active:bg-primary/10 transition-colors"
          >
            <Share2 className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold text-gray-700">分享狀態給家人</span>
          </button>
        </div>

        {/* Contacts Info (Read Only) */}
        {(user.contact1Name || user.contact2Name) && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">緊急聯絡人</h3>
            <div className="space-y-4">
              {user.contact1Name && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">{user.contact1Name}</span>
                  <a href={`tel:${user.contact1Phone}`} className="text-primary font-bold hover:underline">
                    {user.contact1Phone}
                  </a>
                </div>
              )}
              {user.contact2Name && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">{user.contact2Name}</span>
                  <a href={`tel:${user.contact2Phone}`} className="text-primary font-bold hover:underline">
                    {user.contact2Phone}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
