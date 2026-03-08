"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const actualUsername =
      username.trim() || usernameRef.current?.value?.trim() || "";
    const actualPassword =
      password.trim() || passwordRef.current?.value?.trim() || "";

    if (!actualUsername || !actualPassword) {
      toast.error("يرجى إدخال اسم المستخدم وكلمة المرور");
      return;
    }

    setIsLoading(true);

    try {
      await login(actualUsername, actualPassword);
      toast.success("تم تسجيل الدخول بنجاح");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "حدث خطأ أثناء تسجيل الدخول";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center px-6 py-10 bg-[#eef7f4] font-[Tajawal,Open_Sans,sans-serif] relative overflow-hidden"
    >
      <div className="fixed -top-[10%] -right-[10%] w-1/2 h-1/2 rounded-full bg-[radial-gradient(circle,rgba(28,163,126,0.07)_0%,transparent_70%)] pointer-events-none" />
      <div className="fixed -bottom-[10%] -left-[10%] w-1/2 h-1/2 rounded-full bg-[radial-gradient(circle,rgba(28,163,126,0.05)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[440px] animate-[lfIn_0.75s_cubic-bezier(0.22,1,0.36,1)_both]">

        <div className="flex items-center gap-3.5 mb-6 direction-rtl">
          <div className="w-[54px] h-[54px] bg-[#1ca37e] rounded-[15px] flex items-center justify-center font-bold text-[1.55rem] text-white shrink-0 shadow-[0_4px_18px_rgba(28,163,126,0.30)] relative overflow-hidden">
            P
          </div>
          <div>
            <h2 className="font-bold text-[1.05rem] text-[#0d1f16] tracking-[0.06em] uppercase">
              PROGRES
            </h2>
            <p className="text-[0.85rem] text-[#6b8f7e] font-normal mt-0.5">
              Progiciel de Gestion Intégré
            </p>
          </div>
        </div>

        {/* Title */}
        <div className="text-right mb-2">
          <h1 className="text-[2rem] font-bold text-[#0d1f16] leading-tight">
            تسجيل الدخول
          </h1>
          <p className="text-[0.9rem] text-[#6b8f7e] mt-1">
            أدخل بياناتك للوصول إلى حسابك
          </p>
        </div>

        <div className="w-10 h-[3px] bg-[#1ca37e] rounded-full ml-auto  mb-4" />

        <p className="text-[1.3rem] font-bold text-[#456256] text-center mb-5">
          بوابة الطالب
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div className="space-y-1.5">
            <Label
              htmlFor="username"
              className="text-[0.82rem] font-semibold text-[#456256]"
            >
              اسم المستخدم
            </Label>
            <div className="relative rounded-2xl bg-[#f3f5f4] shadow-[6px_6px_14px_rgba(170,192,182,0.55),_-6px_-6px_14px_rgba(255,255,255,0.92)] focus-within:shadow-[inset_3px_3px_8px_rgba(170,192,182,0.50),_inset_-3px_-3px_8px_rgba(255,255,255,0.88)] transition-shadow duration-200">
              <Input
                ref={usernameRef}
                id="username"
                type="text"
                placeholder="أدخل اسم المستخدم"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                autoComplete="username"
                className="h-14 w-full pl-12 pr-5 bg-transparent border-none shadow-none outline-none text-right text-[#0d1f16] placeholder:text-[#b0c8bb] rounded-2xl focus-visible:ring-0 focus-visible:border-none disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ fontSize: "1rem" }}
              />
              <span className="absolute left-[17px] top-1/2 -translate-y-1/2 text-[#8fa99a] pointer-events-none flex items-center transition-colors duration-200 [.group:focus-within_&]:text-[#1ca37e]">
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label
              htmlFor="password"
              className="text-[0.82rem] font-semibold text-[#456256]"
            >
              كلمة المرور
            </Label>
            <div className="relative rounded-2xl bg-[#f3f5f4] shadow-[6px_6px_14px_rgba(170,192,182,0.55),_-6px_-6px_14px_rgba(255,255,255,0.92)] focus-within:shadow-[inset_3px_3px_8px_rgba(170,192,182,0.50),_inset_-3px_-3px_8px_rgba(255,255,255,0.88)] transition-shadow duration-200">
              <Input
                ref={passwordRef}
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="current-password"
                className="h-14 w-full pl-12 pr-5 bg-transparent border-none shadow-none outline-none text-right text-[#0d1f16] placeholder:text-[#b0c8bb] rounded-2xl focus-visible:ring-0 focus-visible:border-none disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ fontSize: "1rem" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                className="absolute left-[14px] top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-[#8fa99a] flex items-center p-1.5 rounded-lg hover:text-[#1ca37e] hover:bg-[#e8f8f3] transition-colors duration-200"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 mt-2.5 bg-[#1ca37e] text-white border-none rounded-2xl text-[1.05rem] font-bold tracking-wide cursor-pointer flex items-center justify-center gap-2.5 relative overflow-hidden shadow-[0_4px_20px_rgba(28,163,126,0.32),inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#22b98e] hover:shadow-[0_8px_28px_rgba(28,163,126,0.40)] active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            <span className="absolute top-0 -left-[120%] w-4/5 h-full g-gradient-to-r from-transparent via-white/15 to-transparent skew-x-[-15deg] transition-[left] duration-500 group-hover:left-[140%]" />
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                جاري التحميل...
              </>
            ) : (
              <>
                <LogIn size={18} />
                تسجيل الدخول
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-9 text-center">
          <div className="flex items-center justify-center gap-2.5 mb-2">
            <Image
              src="/dz.png"
              alt="الجزائر"
              width={32}
              height={22}
              className="rounded-[3px] shadow-[0_1px_6px_rgba(0,0,0,0.15)]"
            />
            <p className="text-[0.82rem] font-semibold text-[#456256]">
              وزارة التعليم العالي والبحث العلمي
            </p>
          </div>
          <p className="text-[0.72rem] text-[#8fa99a]">
            © 2026 جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </div>
  );
}