import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegister, type InsertUser } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Loader2, UserPlus, Phone, User } from "lucide-react";
import { motion } from "framer-motion";
import { z } from "zod";

const insertUserSchema = z.object({
  username: z.string().min(3, "帳號至少需要 3 個字元"),
  password: z.string().min(6, "密碼至少需要 6 個字元"),
  displayName: z.string().min(1, "請輸入顯示名稱"),
  contact1Name: z.string().optional(),
  contact1Phone: z.string().optional(),
  contact2Name: z.string().optional(),
  contact2Phone: z.string().optional(),
});

export default function Register() {
  const { mutate: registerUser, isPending } = useRegister();
  const { register, handleSubmit, formState: { errors } } = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
  });

  const onSubmit = (data: InsertUser) => {
    registerUser(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto space-y-8 bg-white p-8 rounded-3xl shadow-xl border border-gray-100"
      >
        <div className="text-center border-b pb-6">
          <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-black text-gray-900">註冊新帳號</h1>
          <p className="mt-2 text-lg font-medium text-gray-600">建立您的平安守護檔案</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Account Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 flex-shrink-0" /> 帳號資訊
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">顯示名稱 (姓名)</label>
                <input
                  type="text"
                  className="block w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-primary focus:ring-0"
                  placeholder="例如：王小明"
                  {...register("displayName")}
                />
                {errors.displayName && <p className="text-red-500 text-sm mt-1">{errors.displayName.message}</p>}
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">帳號</label>
                <input
                  type="text"
                  className="block w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-primary focus:ring-0"
                  placeholder="用於登入"
                  {...register("username")}
                />
                {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">密碼</label>
                <input
                  type="password"
                  className="block w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-primary focus:ring-0"
                  placeholder="請設定密碼"
                  {...register("password")}
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
              </div>
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <Phone className="w-5 h-5 flex-shrink-0" /> 緊急聯絡人
            </h3>
            
            <div className="bg-blue-50 p-4 rounded-xl space-y-4">
              <p className="text-sm text-blue-800 font-medium">聯絡人 1</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  className="block w-full rounded-lg border-white px-3 py-2 shadow-sm focus:border-primary focus:ring-0"
                  placeholder="姓名"
                  {...register("contact1Name")}
                />
                <input
                  type="tel"
                  className="block w-full rounded-lg border-white px-3 py-2 shadow-sm focus:border-primary focus:ring-0"
                  placeholder="電話號碼"
                  {...register("contact1Phone")}
                />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl space-y-4">
              <p className="text-sm text-blue-800 font-medium">聯絡人 2 (選填)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  className="block w-full rounded-lg border-white px-3 py-2 shadow-sm focus:border-primary focus:ring-0"
                  placeholder="姓名"
                  {...register("contact2Name")}
                />
                <input
                  type="tel"
                  className="block w-full rounded-lg border-white px-3 py-2 shadow-sm focus:border-primary focus:ring-0"
                  placeholder="電話號碼"
                  {...register("contact2Phone")}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-primary px-6 py-4 text-xl font-black text-white shadow-lg hover:bg-primary/90 focus:ring-4 focus:ring-primary/30 disabled:opacity-70 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>註冊中...</span>
              </>
            ) : (
              "完成註冊"
            )}
          </button>

          <div className="text-center">
            <Link href="/login" className="text-base text-gray-600 hover:text-primary font-medium hover:underline transition-colors">
              已有帳號？返回登入
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
