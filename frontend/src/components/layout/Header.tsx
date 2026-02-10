"use client";

import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function Header() {
  const { studentData, logout } = useAuth();

  // Get student name from the first item in studentData array if available
  const studentName =
    Array.isArray(studentData) && studentData[0]?.individuNomLatin
      ? studentData[0].individuNomLatin
      : "الطالب";

  const initials = studentName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-l from-primary to-primary/90 text-primary-foreground shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Image
              src="/progres-logo.jpg"
              alt="PROGRES Logo"
              width={44}
              height={44}
              className="rounded-xl shadow-md"
            />
            <span className="text-xl font-bold tracking-wide">PROGRES</span>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-white/20 hover:bg-white/30">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-white/30 text-primary-foreground">
                    {initials || <i className="fas fa-user"></i>}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{studentName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    طالب مسجل
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {}}>
                <i className="fas fa-user ml-2"></i>
                الملف الشخصي
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>
                <i className="fas fa-cog ml-2"></i>
                الإعدادات
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                <i className="fas fa-sign-out-alt ml-2"></i>
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
