"use client";

import { useAuth } from "@/contexts/AuthContext";
import { DashboardTile, defaultGradients } from "@/components/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const dashboardTiles = [
  {
    icon: "fas fa-user",
    title: "البيانات الشخصية",
    description: "عرض المعلومات الشخصية والأكاديمية",
    href: "/dashboard/profile",
  },
  {
    icon: "fas fa-robot",
    title: "توصيات التخصص",
    description: "اقتراحات ذكية للتخصصات المناسبة",
    href: "/dashboard/recommendations",
  },
  {
    icon: "fas fa-book-open",
    title: "التسجيلات",
    description: "قائمة التسجيلات الأكاديمية",
    href: "/dashboard/enrollments",
  },
  {
    icon: "fas fa-graduation-cap",
    title: "السجل الأكاديمي",
    description: "الدرجات والنتائج الدراسية",
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
    description: "نتائج الامتحانات النهائية",
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
        <Skeleton className="h-24 w-full rounded-xl mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
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
    <div className="container mx-auto px-4 py-6 pb-24">

      <Card className="mb-6 bg-gradient-to-l from-primary to-primary/90 text-primary-foreground border-0 shadow-lg overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-lg md:text-xl font-bold mb-1">
                أهلاً بك {studentName}
              </h1>
              <p className="text-primary-foreground/80 text-sm">
                استكشف الخدمات المتاحة
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-0"
              onClick={logout}
            >
              <i className="fas fa-sign-out-alt ml-2"></i>
              خروج
            </Button>
          </div>
        </CardContent>
      </Card>


      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
  );
}
