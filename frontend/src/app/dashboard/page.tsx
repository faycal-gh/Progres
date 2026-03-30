"use client";

import { useAuth } from "@/contexts/AuthContext";
import { DashboardTile, defaultGradients } from "@/components/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const dashboardTiles = [
  {
    icon: "fas fa-user",
    title: "البيانات الشخصية",
    description: "عرض وتعديل المعلومات الشخصية",
    href: "/dashboard/profile",
  },
  {
    icon: "fas fa-robot",
    title: "توصيات التخصص",
    description: "استشارة التوصيات المتاحة",
    href: "/dashboard/recommendations",
  },
  {
    icon: "fas fa-book-open",
    title: "التسجيلات",
    description: "متابعة التسجيلات الجامعية",
    href: "/dashboard/enrollments",
  },
  {
    icon: "fas fa-graduation-cap",
    title: "السجل الأكاديمي",
    description: "الدرجات والنتائع الدراسية",
    href: "/dashboard/student-details",
  },
  {
    icon: "fas fa-clipboard-check",
    title: "نقاط المراقبة المستمرة",
    description: "نتائج الأعمال الموجهة والتطبيقية",
    href: "/dashboard/cc-grades",
  },
  {
    icon: "fas fa-file-contract",
    title: "نقاط الامتحانات",
    description: "نتائج الامتحانات الفصلية والنهائية",
    href: "/dashboard/exams",
  },
  {
    icon: "fas fa-calculator",
    title: "حساب المعدل",
    description: "احسب معدلك الفصلي والسنوي",
    href: "/dashboard/calculator",
  },
];

export default function DashboardPage() {
  const { isLoading, studentData, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Skeleton className="h-28 w-full rounded-2xl mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[150px] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const studentName =
    Array.isArray(studentData) && studentData[0]?.individuNomLatin
      ? studentData[0].individuNomLatin
      : "الطالب";

  return (
    <div dir="rtl" className="min-h-screen">
      <div className="container mx-auto px-4 py-6 pb-24">

        <div
          className="rounded-[22px] px-8 py-10 mb-7 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #1ca37e 0%, #17956f 100%)",
            boxShadow: "0 8px 32px rgba(28,163,126,0.35)",
          }}
        >
          <div
            className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)",
            }}
          />

          <div
            className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)",
            }}
          />
          <div className="flex items-end justify-between gap-4 relative z-10">
            <div>
              <h1
                className="text-[30px] md:text-[33px] font-black leading-tight mb-2 text-white"
              >
                أهلاً بك،{" "}
                <span style={{ color: "rgba(255,255,255,0.85)" }}>{studentName}</span>
              </h1>
              <p
                className="text-[13px] leading-relaxed max-w-[360px]"
                style={{ color: "rgba(255,255,255,0.70)" }}
              >
                استكشف الخدمات المتاحة لك عبر بوابة الطالب
              </p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              className="shrink-0 rounded-[10px] border-0 transition-all duration-200 hover:bg-white/30"
              style={{
                background: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(6px)",
                color: "white",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)",
              }}
              onClick={logout}
            >
              <i className="fas fa-sign-out-alt ml-2 text-xs" />
              خروج
            </Button>
          </div>
        </div>

        {/* ── Section title ── */}
        <div className="flex items-center justify-between mb-5">
          <span
            className="text-[10.5px] font-semibold tracking-[1.5px] uppercase"
            style={{ color: "#8ab8a0" }}
          >
            الخدمات
          </span>
        </div>

        {/* ── Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dashboardTiles.map((tile, index) => (
            <DashboardTile
              key={index}
              icon={tile.icon}
              title={tile.title}
              description={tile.description}
              href={tile.href}
              gradient={defaultGradients[index % defaultGradients.length]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}