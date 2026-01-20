import { useUser } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, api } from "@shared/routes";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useLocation } from "wouter";
import { z } from "zod";

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
      const res = await apiRequest("PUT", api.user.updateProfile.path, values);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "設定已儲存",
        description: "您的家人聯絡資訊已成功更新。",
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

      <main className="max-w-md mx-auto px-6 pt-10 pb-20">
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