import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

// 閾值預設選項
export const THRESHOLD_OPTIONS = {
  TEST: 30, // 30 秒測試
  HALF_DAY: 43200, // 12 小時
  FULL_DAY: 86400, // 24 小時
} as const;

export type ThresholdValue = typeof THRESHOLD_OPTIONS[keyof typeof THRESHOLD_OPTIONS];

// 閾值描述
export const THRESHOLD_LABELS: Record<ThresholdValue, { label: string; description: string; toast: string }> = {
  [THRESHOLD_OPTIONS.TEST]: {
    label: "開發者測試 (30秒)",
    description: "供展示與功能測試使用",
    toast: "已進入測試模式，警報將於 30 秒後觸發。",
  },
  [THRESHOLD_OPTIONS.HALF_DAY]: {
    label: "緊密守護 (12小時)",
    description: "建議早晚各報平安一次",
    toast: "已切換為緊密守護模式，每 12 小時報平安一次。",
  },
  [THRESHOLD_OPTIONS.FULL_DAY]: {
    label: "日常報備 (24小時)",
    description: "標準模式",
    toast: "已切換為日常報備模式，每 24 小時報平安一次。",
  },
};

/**
 * Hook: 管理用戶的報平安超時閾值設定
 */
export function useUpdateThreshold() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (newThreshold: ThresholdValue) => {
      // 獲取當前會話
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;
      if (!session) throw new Error("未登入");

      // 更新閾值
      const { error } = await supabase
        .from('users')
        .update({ timeout_threshold: newThreshold })
        .eq('id', session.user.id);

      if (error) throw new Error("更新閾值失敗");

      return newThreshold;
    },
    onSuccess: (newThreshold) => {
      // 立即刷新 user 資料
      queryClient.invalidateQueries({ queryKey: ['user'] });

      // 顯示溫馨提示
      const thresholdInfo = THRESHOLD_LABELS[newThreshold];
      toast({
        title: "閾值已更新",
        description: thresholdInfo.toast,
        className: "bg-green-100 border-green-500 text-green-900",
        duration: 3000, // 3 秒後自動關閉
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "更新失敗",
        description: error.message,
      });
    },
  });
}

/**
 * 輔助函數：格式化閾值為人類可讀的文字
 */
export function formatThreshold(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} 秒`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} 分鐘`;
  } else if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} 小時`;
  } else {
    const days = Math.floor(seconds / 86400);
    return `${days} 天`;
  }
}
