import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

// POST /api/check-in - Update last check-in time
export function useCheckIn() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;
      if (!session) throw new Error("未登入");

      // Update last check-in time in database
      const { error } = await supabase
        .from('users')
        .update({ last_check_in: new Date().toISOString() })
        .eq('id', session.user.id);

      if (error) throw new Error("報平安失敗 (Check-in failed)");
    },
    onSuccess: () => {
      // Invalidate user query to refresh data
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast({
        title: "已報平安！",
        description: "家人可以放心了",
        className: "bg-green-100 border-green-500 text-green-900"
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "操作失敗",
        description: error.message,
      });
    },
  });
}

// GET /api/status/:username - Public status page
export function usePublicStatus(username: string) {
  return useQuery({
    queryKey: ['public-status', username],
    queryFn: async () => {
      console.log('[usePublicStatus] Querying for username:', username);

      // Query user by username (public access)
      const { data, error } = await supabase
        .from('users')
        .select('id, username, display_name, last_check_in')
        .eq('username', username)
        .single();

      if (error) {
        console.error('[usePublicStatus] Query error:', error);
        console.error('[usePublicStatus] Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });

        // User not found
        if (error.code === 'PGRST116') {
          console.warn('[usePublicStatus] User not found');
          return null;
        }
        throw new Error(`Failed to fetch status: ${error.message}`);
      }

      console.log('[usePublicStatus] User found:', data);

      // Calculate isSafe based on last check-in time
      const TIMEOUT_SECONDS = 10; // 測試用：10秒，正式環境應為 86400 (24小時)
      const lastCheckIn = data.last_check_in ? new Date(data.last_check_in).getTime() : 0;
      const now = new Date().getTime();
      const secondsPassed = (now - lastCheckIn) / 1000;
      const isSafe = secondsPassed < TIMEOUT_SECONDS;

      console.log(`[usePublicStatus] Time check: ${secondsPassed.toFixed(1)}s passed, isSafe=${isSafe}`);

      return {
        displayName: data.display_name,
        lastCheckInAt: data.last_check_in,
        isSafe,
      };
    },
    enabled: !!username,
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });
}
