"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: "fas fa-home", label: "الرئيسية" },
  { href: "/dashboard/student-card", icon: "fas fa-id-card", label: "بطاقة" },
  { href: "/dashboard/profile", icon: "fas fa-user", label: "حسابي" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: "#e8f5f0",
        boxShadow:
          "0 -4px 14px rgba(28,163,126,0.1), 0 1px 0 rgba(255,255,255,0.8)",
      }}
    >
      <div className="flex justify-around items-center py-2 px-4 pb-5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === "/dashboard" && pathname === "/dashboard");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-6 rounded-[14px] transition-all duration-200",
                isActive ? "py-2.5 -mt-3" : "py-2",
              )}
              style={
                isActive
                  ? {
                      color: "#1ca37e",
                      background: "#e8f5f0",
                      boxShadow:
                        "inset 3px 3px 8px rgba(28,163,126,0.15), inset -3px -3px 8px rgba(255,255,255,0.9)",
                    }
                  : { color: "#8ab8a0" }
              }
            >
              <i
                className={cn(
                  item.icon,
                  "text-lg transition-transform duration-200",
                  isActive && "scale-110",
                )}
              />
              <span className="text-[10.5px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}