"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { AuthGuard } from "@/components/layout/AuthGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AuthGuard>
        <div
          className="min-h-screen flex flex-col relative overflow-hidden bg-[#eef7f4]"
        >
          <div
            className="fixed pointer-events-none z-0 w-[700px] h-[700px] rounded-full -top-[220px] -right-[180px] bg-[radial-gradient(circle,rgba(28,163,126,0.1)_0%,transparent_65%)] blur-[60px]"
          />
          <div
            className="fixed pointer-events-none z-0 w-[500px] h-[500px] rounded-full -bottom-[140px] -left-[100px] bg-[radial-gradient(circle,rgba(28,163,126,0.07)_0%,transparent_65%)] blur-[60px]"
          />

          <Header />
          <main className="flex-1 pb-20 relative z-10">{children}</main>
          <BottomNav />
        </div>
      </AuthGuard>
    </AuthProvider>
  );
}