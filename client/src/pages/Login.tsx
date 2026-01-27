import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Loader2, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const loginSchema = z.object({
  username: z.string().min(1, "請輸入帳號"),
  password: z.string().min(1, "請輸入密碼"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const { mutate: login, isPending } = useLogin();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 bg-white p-8 rounded-3xl shadow-xl border border-gray-100"
      >
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <ShieldCheck className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">
            平安守護
          </h1>
          <p className="mt-2 text-lg font-medium text-gray-600">
            歡迎回來，請登入您的帳號
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-lg font-medium text-gray-700 mb-2">
                帳號 (Username)
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                className="block w-full rounded-xl border-gray-300 px-4 py-4 text-lg shadow-sm focus:border-primary focus:ring-primary bg-gray-50 border-2"
                placeholder="請輸入您的帳號"
                {...register("username")}
              />
              {errors.username && (
                <p className="mt-1 text-red-600 text-sm">{errors.username.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-lg font-medium text-gray-700 mb-2">
                密碼 (Password)
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="block w-full rounded-xl border-gray-300 px-4 py-4 text-lg shadow-sm focus:border-primary focus:ring-primary bg-gray-50 border-2"
                placeholder="請輸入您的密碼"
                {...register("password")}
              />
              {errors.password && (
                <p className="mt-1 text-red-600 text-sm">{errors.password.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-4 text-xl font-black text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 shadow-lg shadow-primary/30 transition-all active:scale-[0.98]"
          >
            {isPending ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>登入中...</span>
              </>
            ) : (
              "登入 (Login)"
            )}
          </button>

          <div className="text-center mt-4">
            <p className="text-base text-gray-600">
              還沒有帳號嗎？{" "}
              <Link href="/register" className="font-bold text-primary hover:text-primary/80 hover:underline transition-colors">
                立即註冊
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
