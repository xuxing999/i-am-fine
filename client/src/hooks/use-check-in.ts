import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// POST /api/check-in
export function useCheckIn() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.user.checkIn.path, {
        method: api.user.checkIn.method,
        credentials: "include",
      });

      if (!res.ok) throw new Error("報平安失敗 (Check-in failed)");
      return api.user.checkIn.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] });
      toast({ 
        title: "已報平安！", 
        description: "家人可以放心了",
        className: "bg-green-100 border-green-500 text-green-900"
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "操作失敗",
        description: error.message,
      });
    },
  });
}

// GET /api/status/:username (Public)
export function usePublicStatus(username: string) {
  return useQuery({
    queryKey: [api.public.status.path, username],
    queryFn: async () => {
      const url = buildUrl(api.public.status.path, { username });
      const res = await fetch(url);
      
      if (!res.ok) {
        if (res.status === 404) return null; // Handle not found gracefully in UI
        throw new Error("Failed to fetch status");
      }
      
      return api.public.status.responses[200].parse(await res.json());
    },
    enabled: !!username,
    refetchInterval: 60000, // Refresh every minute
  });
}
