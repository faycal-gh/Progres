"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { YearSelector, YearData } from "@/components/YearSelector";

interface CCGrade {
  id: number;
  apCode?: string;
  llPeriode?: string;
  llPeriodeAr?: string;
  rattachementMcMcLibelleFr?: string;
  rattachementMcMcLibelleAr?: string;
  note?: number;
  absent?: boolean;
  observation?: string;
  autorisationDemandeRecours?: boolean;
  dateDebutDepotRecours?: string;
  dateLimiteDepotRecours?: string;
}

function GradeCard({ grade }: { grade: CCGrade }) {
  const hasGrade = grade.note !== null && grade.note !== undefined;
  const isPass = hasGrade && (grade.note as number) >= 10;
  const isAbsent = grade.absent === true;

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-3 flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-foreground truncate">
            {grade.rattachementMcMcLibelleFr || grade.rattachementMcMcLibelleAr || "Module"}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              CC
            </Badge>
            {grade.llPeriode && (
              <span className="text-xs text-muted-foreground">{grade.llPeriode}</span>
            )}
          </div>
        </div>
        {isAbsent ? (
          <Badge className="bg-amber-500 hover:bg-amber-500 text-white text-base font-bold px-3 py-1">
            غائب
          </Badge>
        ) : hasGrade ? (
          <Badge
            className={cn(
              "text-base font-bold px-3 py-1 min-w-[60px] justify-center",
              isPass
                ? "bg-emerald-500 hover:bg-emerald-500 text-white"
                : "bg-red-500 hover:bg-red-500 text-white"
            )}
          >
            {grade.note?.toFixed(2)}
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-base font-bold px-3 py-1">
            --
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

export default function CCGradesPage() {
  const { studentData, fetchCCGrades, isAuthenticated, isLoading: authLoading } = useAuth();
  const [ccGrades, setCCGrades] = useState<CCGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeYearId, setActiveYearId] = useState<string | number | null>(null);

  const years: YearData[] = studentData || [];

  useEffect(() => {
    if (years.length > 0 && activeYearId === null) {
      setActiveYearId(years[0].id);
    }
  }, [years, activeYearId]);

  const currentYear = years.find(y => y.id === activeYearId) || years[0];

  useEffect(() => {
    const loadCCGrades = async () => {
      if (!currentYear?.id) {
        if (!authLoading && years.length === 0) {
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await fetchCCGrades(currentYear.id.toString());
        setCCGrades(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load CC grades");
        setCCGrades([]);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && currentYear) {
      loadCCGrades();
    }
  }, [isAuthenticated, currentYear, fetchCCGrades, authLoading, years.length]);

  if (authLoading || (loading && !activeYearId)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">جاري تحميل نقاط المراقبة المستمرة...</p>
      </div>
    );
  }

  if (!studentData || years.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-4">
        <BookOpen className="w-16 h-16 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">لا توجد بيانات متاحة</p>
        <Link href="/dashboard">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة للرئيسية
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-20 space-y-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-lg font-bold">نقاط المراقبة المستمرة</h1>
      </div>

      {/* Year Navigation - using reusable component */}
      <div className="mb-4">
        <YearSelector
          years={years}
          activeYearId={activeYearId || ""}
          onYearSelect={(year) => setActiveYearId(year.id)}
          className="mb-4"
        />
        {currentYear?.niveauLibelleLongLt && (
          <p className="text-xs text-center text-muted-foreground mt-1">
            {currentYear.niveauLibelleLongLt}
          </p>
        )}
      </div>

      {/* Error state */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4 text-center text-destructive">
            {error}
          </CardContent>
        </Card>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {/* CC Grades List */}
      {!loading && ccGrades.length > 0 && (
        <div className="space-y-2">
          <div className="bg-primary text-primary-foreground text-center py-2 px-4 rounded-full font-medium text-sm">
            نقاط المراقبة المستمرة ({ccGrades.length})
          </div>
          {ccGrades.map((grade, index) => (
            <GradeCard key={grade.id || index} grade={grade} />
          ))}
        </div>
      )}

      {/* No grades state */}
      {!loading && !error && ccGrades.length === 0 && (
        <Card className="text-center p-6">
          <CardContent className="space-y-2">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">
              لا توجد نقاط مراقبة مستمرة لهذه السنة
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
