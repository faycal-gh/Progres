"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { studentData, logout } = useAuth();

  const studentName =
    Array.isArray(studentData) && studentData[0]?.individuNomLatin
      ? studentData[0].individuNomLatin
      : "الطالب";

  const initials = studentName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header
      className="sticky top-0 z-50 w-full bg-[#e8f5f0] shadow-[0_4px_12px_rgba(28,163,126,0.1),0_-1px_0_rgba(255,255,255,0.8)]"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-14.5 items-center justify-between" dir="rtl">

          {/* Right — Brand */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-[10px] flex items-center justify-center bg-[#1ca37e] shadow-[4px_4px_10px_rgba(28,163,126,0.35),-2px_-2px_6px_rgba(255,255,255,0.5)]"
            >
              <span className="font-black text-[15px] text-white">P</span>
            </div>
            <div>
              <p className="font-black text-[13px] tracking-[0.5px] uppercase leading-tight text-[#2a4a3a]">
                PROGRES
              </p>
              <p className="text-[10px] leading-tight text-[#8ab8a0]">
                Progiciel de Gestion Intégré
              </p>
            </div>
          </div>

          {/* Left — User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-2 rounded-full px-3 py-1.5 cursor-pointer outline-none transition-all duration-200 bg-[#e8f5f0] shadow-[4px_4px_10px_rgba(28,163,126,0.12),-4px_-4px_10px_rgba(255,255,255,0.85)]"
              >
                {/* avatar — inset neumorphic */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs bg-[#e8f5f0] shadow-[inset_2px_2px_5px_rgba(28,163,126,0.15),inset_-2px_-2px_5px_rgba(255,255,255,0.9)] text-[#1ca37e]"
                >
                  {initials || <i className="fas fa-user text-xs" />}
                </div>
                <span
                  className="text-[12.5px] font-semibold max-w-25 truncate hidden sm:block text-[#2a4a3a]"
                >
                  {studentName}
                </span>
                <i className="fas fa-chevron-down text-[9px] text-[#8ab8a0]" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-56 rounded-2xl mt-1 border-0 bg-[#e8f5f0] shadow-[8px_8px_20px_rgba(28,163,126,0.14),-8px_-8px_20px_rgba(255,255,255,0.9)]"
              align="end"
              forceMount
            >
              <DropdownMenuLabel className="font-normal px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 bg-[#e8f5f0] shadow-[inset_3px_3px_6px_rgba(28,163,126,0.12),inset_-3px_-3px_6px_rgba(255,255,255,0.9)] text-[#1ca37e]"
                  >
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#2a4a3a]">
                      {studentName}
                    </p>
                    <p className="text-xs text-[#8ab8a0]">
                      طالب مسجل
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="bg-[rgba(28,163,126,0.1)]" />

              <div className="p-1">
                <DropdownMenuItem
                  onClick={() => {}}
                  className="rounded-xl cursor-pointer text-sm py-2 text-[#4a7a62]"
                >
                  <i className="fas fa-user ml-2 text-xs text-[#1ca37e]" />
                  الملف الشخصي
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {}}
                  className="rounded-xl cursor-pointer text-sm py-2 text-[#4a7a62]"
                >
                  <i className="fas fa-cog ml-2 text-xs text-[#1ca37e]" />
                  الإعدادات
                </DropdownMenuItem>
              </div>

              <DropdownMenuSeparator className="bg-[rgba(28,163,126,0.1)]" />

              <div className="p-1">
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-500 focus:bg-red-50 focus:text-red-600 rounded-xl mb-0.5 cursor-pointer text-sm py-2"
                >
                  <i className="fas fa-sign-out-alt ml-2 text-xs" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </header>
  );
}