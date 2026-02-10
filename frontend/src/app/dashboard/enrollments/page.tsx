"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, School, GraduationCap, BookOpen, Layers, Target, Award } from "lucide-react";
import Link from "next/link";

interface EnrollmentData {
  id: number;
  anneeAcademiqueCode: string;
  llEtablissementLatin?: string;
  llEtablissementArabe?: string;
  cycleLibelleLongLt?: string;
  refLibelleCycle?: string;
  niveauLibelleLongLt?: string;
  refLibelleNiveau?: string;
  llDomaine?: string;
  ofLlFiliere?: string;
  ofLlSpecialite?: string;
}

export default function EnrollmentsPage() {
  const { studentData, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-3 pb-24">
        <div className="max-w-md mx-auto space-y-3">
          <Skeleton className="h-10 w-32" />
          {[1, 2].map(i => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-10 w-full rounded-full" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const enrollments: EnrollmentData[] = Array.isArray(studentData) ? studentData : [];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-3 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="p-1 hover:bg-muted rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold">التسجيلات</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-3 py-4 space-y-4">
        {enrollments.map((enrollment, index) => (
          <div key={enrollment.id || index}>
            {/* Year Badge */}
            <div className="bg-primary text-primary-foreground text-center py-2 px-4 rounded-full font-bold text-sm mb-3">
              {enrollment.anneeAcademiqueCode}
            </div>

            {/* Enrollment Details */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 space-y-3">
                <DetailRow
                  icon={<School className="w-4 h-4" />}
                  label="الجامعة"
                  value={enrollment.llEtablissementArabe || enrollment.llEtablissementLatin || "غير متوفر"}
                />
                <DetailRow
                  icon={<Layers className="w-4 h-4" />}
                  label="الطور"
                  value={enrollment.cycleLibelleLongLt || enrollment.refLibelleCycle || "غير متوفر"}
                />
                <DetailRow
                  icon={<GraduationCap className="w-4 h-4" />}
                  label="المستوى"
                  value={enrollment.niveauLibelleLongLt || enrollment.refLibelleNiveau || "غير متوفر"}
                />
                <DetailRow
                  icon={<BookOpen className="w-4 h-4" />}
                  label="الميدان"
                  value={enrollment.llDomaine || "غير متوفر"}
                />
                <DetailRow
                  icon={<Target className="w-4 h-4" />}
                  label="الشعبة"
                  value={enrollment.ofLlFiliere || "غير متوفر"}
                />
                <DetailRow
                  icon={<Award className="w-4 h-4" />}
                  label="التخصص"
                  value={enrollment.ofLlSpecialite || "غير متوفر"}
                />
              </CardContent>
            </Card>
          </div>
        ))}

        {enrollments.length === 0 && (
          <Card className="text-center p-6">
            <p className="text-muted-foreground">لا توجد بيانات تسجيل</p>
          </Card>
        )}
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="text-primary mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0 text-right">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground">{value}</p>
      </div>
    </div>
  );
}
