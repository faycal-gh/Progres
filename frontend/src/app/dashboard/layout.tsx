"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 pb-20">{children}</main>
        <BottomNav />
      </div>
    </AuthProvider>
  );
}
