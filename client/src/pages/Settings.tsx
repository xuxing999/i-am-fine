import { useUser } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Save, Clock } from "lucide-react";
import { useLocation } from "wouter";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { useUpdateThreshold, THRESHOLD_OPTIONS, THRESHOLD_LABELS, type ThresholdValue } from "@/hooks/use-threshold-settings";

const settingsSchema = z.object({
  contact1Name: z.string().min(1, "請輸入聯絡人姓名"),
  contact1Phone: z.string().min(8, "請輸入有效的電話號碼"),
  contact2Name: z.string().optional(),
  contact2Phone: z.string().optional(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

export default function Settings() {
  const { data: user } = useUser();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const updateThreshold = useUpdateThreshold();

  // 當前閾值（從用戶資料讀取，預設 24 小時）
  const currentThreshold = (user?.timeoutThreshold || THRESHOLD_OPTIONS.FULL_DAY) as ThresholdValue;

  const form = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      contact1Name: user?.contact1Name || "",
      contact1Phone: user?.contact1Phone || "",
      contact2Name: user?.contact2Name || "",
      contact2Phone: user?.contact2Phone || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: SettingsForm) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("未登入");

      const { error } = await supabase
        .from('users')
        .update({
          contact1_name: values.contact1Name,
          contact1_phone: values.contact1Phone,
          contact2_name: values.contact2Name || null,
          contact2_phone: values.contact2Phone || null,
        })
        .eq('id', session.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast({
        title: "設定已儲存",
        description: "您的家人聯絡資訊已成功更新。",
        duration: 3000, // 3 秒後自動關閉
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "儲存失敗",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setLocation("/")}
            className="rounded-full"
          >
            <ArrowLeft className="h-8 w-8" />
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">設定家人電話</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 pt-10 pb-20 space-y-10">
        {/* 閾值設定區塊 */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b-2 border-green-100 pb-2">
            <Clock className="h-8 w-8 text-green-600" />
            <h2 className="text-2xl font-black text-green-600">報平安間隔設定</h2>
          </div>

          {/* iOS 風格 Segmented Control */}
          <div className="bg-gray-100 p-2 rounded-2xl">
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(THRESHOLD_OPTIONS).map(([key, value]) => {
                const isSelected = currentThreshold === value;
                const info = THRESHOLD_LABELS[value];

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => updateThreshold.mutate(value)}
                    disabled={updateThreshold.isPending}
                    className={`
                      relative py-4 px-3 rounded-xl font-bold transition-all duration-200
                      ${isSelected
                        ? 'bg-white shadow-md text-green-700 scale-[1.02]'
                        : 'bg-transparent text-gray-600 hover:bg-gray-200/50'
                      }
                      ${updateThreshold.isPending ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}
                    `}
                  >
                    <div className="space-y-1">
                      <div className="text-sm leading-tight">
                        {info.label.split(' ')[0]}
                        <br />
                        <span className="text-lg font-black">
                          {info.label.split(' ')[1]}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 當前選中模式的詳細說明 */}
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4">
            <p className="text-green-800 text-center font-medium">
              {THRESHOLD_LABELS[currentThreshold].description}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-10">
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-blue-600 border-b-2 border-blue-100 pb-2">主要聯絡人</h2>
              <FormField
                control={form.control}
                name="contact1Name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xl font-bold">姓名（如：兒子、大女兒）</FormLabel>
                    <FormControl>
                      <Input {...field} className="text-xl py-6 rounded-2xl border-2 focus:ring-4" placeholder="請輸入姓名" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact1Phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xl font-bold">電話號碼</FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" className="text-xl py-6 rounded-2xl border-2 focus:ring-4" placeholder="09xxxxxxxx" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-black text-purple-600 border-b-2 border-purple-100 pb-2">備用聯絡人（選填）</h2>
              <FormField
                control={form.control}
                name="contact2Name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xl font-bold">姓名</FormLabel>
                    <FormControl>
                      <Input {...field} className="text-xl py-6 rounded-2xl border-2 focus:ring-4" placeholder="請輸入姓名" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact2Phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xl font-bold">電話號碼</FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" className="text-xl py-6 rounded-2xl border-2 focus:ring-4" placeholder="09xxxxxxxx" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full py-8 text-2xl font-black rounded-3xl shadow-xl hover:shadow-2xl transition-all"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <Loader2 className="mr-2 h-8 w-8 animate-spin" />
              ) : (
                <Save className="mr-2 h-8 w-8" />
              )}
              儲存設定
            </Button>
          </form>
        </Form>
      </main>
    </div>
  );
}