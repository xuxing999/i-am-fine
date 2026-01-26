import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useEffect, useRef } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";

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
        .update({ last_check_in_at: new Date().toISOString() })
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

// GET /api/status/:username - Public status page with Realtime subscription
export function usePublicStatus(username: string) {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  const query = useQuery({
    queryKey: ['public-status', username],
    queryFn: async () => {
      console.log('[usePublicStatus] Querying for username:', username);

      // Query user by username (public access) - 包含動態閾值
      const { data, error } = await supabase
        .from('users')
        .select('id, username, display_name, last_check_in_at, timeout_threshold')
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

      // 使用用戶的動態閾值（預設 24 小時）
      const userThreshold = data.timeout_threshold || 86400;

      // Calculate isSafe based on last check-in time and user's threshold
      const lastCheckIn = data.last_check_in_at ? new Date(data.last_check_in_at).getTime() : 0;
      const now = new Date().getTime();
      const secondsPassed = (now - lastCheckIn) / 1000;
      const isSafe = secondsPassed < userThreshold;

      console.log(`[usePublicStatus] Time check: ${secondsPassed.toFixed(1)}s passed, threshold=${userThreshold}s, isSafe=${isSafe}`);

      return {
        userId: data.id,
        displayName: data.display_name,
        lastCheckInAt: data.last_check_in_at,
        timeoutThreshold: userThreshold,
        isSafe,
      };
    },
    enabled: !!username,
    // 移除輪詢，改用 Realtime
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60, // 1 分鐘
  });

  // Setup Realtime subscription
  useEffect(() => {
    if (!username || !query.data?.userId) {
      return;
    }

    console.log('[usePublicStatus] Setting up Realtime subscription for user:', username);

    // Create a unique channel for this user
    const channel = supabase
      .channel(`user-status-${username}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${query.data.userId}`,
        },
        (payload) => {
          console.log('[Realtime] User status updated:', payload);

          // Update React Query cache immediately
          queryClient.setQueryData(['public-status', username], (oldData: any) => {
            if (!oldData) return oldData;

            const newLastCheckInAt = payload.new.last_check_in_at;
            const newThreshold = payload.new.timeout_threshold || oldData.timeoutThreshold || 86400;

            const lastCheckIn = newLastCheckInAt ? new Date(newLastCheckInAt).getTime() : 0;
            const now = new Date().getTime();
            const secondsPassed = (now - lastCheckIn) / 1000;
            const isSafe = secondsPassed < newThreshold;

            console.log(`[Realtime] Calculated status: ${secondsPassed.toFixed(1)}s passed, threshold=${newThreshold}s, isSafe=${isSafe}`);

            return {
              ...oldData,
              lastCheckInAt: newLastCheckInAt,
              timeoutThreshold: newThreshold,
              isSafe,
            };
          });
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Subscription status:', status);
      });

    channelRef.current = channel;

    // Cleanup on unmount
    return () => {
      console.log('[usePublicStatus] Cleaning up Realtime subscription');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [username, query.data?.userId, queryClient]);

  return query;
}
