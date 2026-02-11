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
        <div className="min-h-screen flex flex-col bg-background">
          <Header />
          <main className="flex-1 pb-20">{children}</main>
          <BottomNav />
        </div>
      </AuthGuard>
    </AuthProvider>
  );
}
