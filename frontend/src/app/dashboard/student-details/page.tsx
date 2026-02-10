"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronLeft, ChevronRight, AlertCircle, BookOpen } from "lucide-react";
import { YearSelector } from "@/components/YearSelector";

interface ExamData {
  periodeLibelleFr: string;
  niveauLibelleLongLt: string;
  bilanUes: {
    bilanMcs: {
      mcLibelleFr: string;
      coefficient: number;
      moyenneGenerale: number;
    }[];
  }[];
}

interface YearData {
  uuid: string;
  id: number;
  anneeAcademiqueCode: string;
}

// Calculate average for a period
function calculatePeriodAverage(period: ExamData): number {
  let totalWeighted = 0;
  let totalCoeff = 0;

  period.bilanUes.forEach((ue) => {
    ue.bilanMcs.forEach((mc) => {
      totalWeighted += mc.moyenneGenerale * mc.coefficient;
      totalCoeff += mc.coefficient;
    });
  });

  return totalCoeff > 0
    ? Math.round((totalWeighted / totalCoeff) * 100) / 100
    : 0;
}

// Loading skeleton component matching the original style
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="bg-primary py-8 px-4">
        <div className="max-w-[1200px] mx-auto">
          <Skeleton className="h-9 w-48 mx-auto mb-2 bg-primary-foreground/20" />
          <Skeleton className="h-5 w-64 mx-auto bg-primary-foreground/20" />
        </div>
      </div>

      {/* Year nav skeleton */}
      <div className="max-w-[1200px] mx-auto px-4">
        <Card className="rounded-xl p-4 shadow-md -mt-8 mb-6 border-0">
          <div className="flex gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-28 rounded-xl" />
            ))}
          </div>
        </Card>

        {/* Content skeleton */}
        <Card className="rounded-2xl p-6 shadow-md border-0">
          <Skeleton className="h-8 w-64 mb-6" />
          <Skeleton className="h-12 w-full rounded-xl mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// Exam card component matching original design
function ExamCard({
  mc,
}: {
  mc: { mcLibelleFr: string; coefficient: number; moyenneGenerale: number };
}) {
  const isHigh = mc.moyenneGenerale >= 10;

  return (
    <Card className="bg-muted rounded-xl p-5 border border-border transition-all duration-300 hover:-translate-y-[3px] hover:shadow-md flex flex-col h-full overflow-hidden">
      <h4 className="font-semibold text-base mb-3 text-foreground leading-snug break-words line-clamp-2">
        {mc.mcLibelleFr}
      </h4>
      <div className="text-muted-foreground text-sm mt-auto flex justify-between items-end gap-2">
        <Badge
          variant="secondary"
          className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100 shrink-0"
        >
          المعامل: {mc.coefficient}
        </Badge>
        <div className="flex flex-col items-end shrink-0">
          <span className="text-xs mb-1 text-muted-foreground">المعدل</span>
          <Badge
            variant={isHigh ? "default" : "destructive"}
            className={`font-bold text-xl py-1 px-3 min-w-[60px] text-center ${isHigh
              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-destructive/10 text-destructive hover:bg-destructive/10"
              }`}
          >
            {mc.moyenneGenerale.toFixed(2)}
          </Badge>
        </div>
      </div>
    </Card>
  );
}

// Period header component
function PeriodHeader({ period }: { period: ExamData }) {
  const periodAverage = calculatePeriodAverage(period);
  const isHigh = periodAverage >= 10;

  return (
    <div className="bg-primary p-4 rounded-xl mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 col-span-full">
      <h3 className="text-primary-foreground text-lg sm:text-xl font-semibold m-0">
        {period.periodeLibelleFr} ({period.niveauLibelleLongLt})
      </h3>
      <div className="flex items-center gap-2">
        <span className="font-medium text-primary-foreground/90">المعدل:</span>
        <Badge
          variant={isHigh ? "default" : "destructive"}
          className={`font-bold text-lg py-1 px-3 ${isHigh
            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400"
            : "bg-destructive/10 text-destructive hover:bg-destructive/10"
            }`}
        >
          {periodAverage.toFixed(2)}
        </Badge>
      </div>
    </div>
  );
}

export default function StudentDetailsPage() {
  const { studentData, fetchExamData, isLoading: authLoading } = useAuth();
  const [examDataByYear, setExamDataByYear] = useState<Map<string, ExamData[]>>(
    new Map(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeYear, setActiveYear] = useState<string>("");


  useEffect(() => {
    const loadExamData = async () => {
      if (!studentData) {
        setIsLoading(false);
        return;
      }

      const yearDataArray = studentData as YearData[];
      const newExamData = new Map<string, ExamData[]>();

      // Set first year as active
      if (yearDataArray.length > 0 && !activeYear) {
        setActiveYear(yearDataArray[0].anneeAcademiqueCode);
      }

      try {
        for (const yearData of yearDataArray) {
          const examData = await fetchExamData(yearData.id.toString());
          newExamData.set(yearData.anneeAcademiqueCode, examData as ExamData[]);
        }
        setExamDataByYear(newExamData);
      } catch (err) {
        setError("خطأ في تحميل بيانات الامتحانات");
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      loadExamData();
    }
  }, [studentData, fetchExamData, authLoading, activeYear]);



  if (authLoading || isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-[1200px] mx-auto">
          <Alert variant="destructive" className="rounded-xl p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
            <AlertDescription className="text-xl">{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!studentData || !Array.isArray(studentData)) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-[1200px] mx-auto">
          <Card className="rounded-xl p-8 text-center border-0">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-primary/30" />
            <p className="text-xl text-muted-foreground">لا توجد بيانات طالب</p>
          </Card>
        </div>
      </div>
    );
  }

  const yearDataArray = studentData as YearData[];
  const currentYearExams = examDataByYear.get(activeYear) || [];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-8 shadow-md">
        <div className="max-w-[1200px] mx-auto px-4">
          <h1 className="text-center text-3xl sm:text-4xl font-bold mb-2">
            السجل الأكاديمي
          </h1>
          <p className="text-center text-primary-foreground/80 text-base sm:text-lg">
            عرض النتائج والمعدلات الدراسية
          </p>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-4 py-6">
        {/* Years Navigation - using reusable component */}
        <YearSelector
          years={yearDataArray}
          activeYearId={activeYear}
          onYearSelect={(year) => setActiveYear(year.anneeAcademiqueCode)}
          className="-mt-8 mb-6"
        />

        {/* Year Section Content - matching original */}
        <Card className="rounded-2xl p-6 sm:p-8 shadow-md border-0 animate-in fade-in duration-500">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 mb-6 border-b-2 border-border">
            <h2 className="text-foreground text-xl sm:text-2xl font-bold">
              السنة الأكاديمية
            </h2>
            <span className="text-primary text-lg sm:text-xl font-bold">
              {activeYear}
            </span>
          </div>

          <CardContent className="p-0">
            {currentYearExams.length > 0 ? (
              <div className="space-y-8">
                {currentYearExams.map((period, periodIndex) => (
                  <div key={periodIndex}>
                    <PeriodHeader period={period} />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {period.bilanUes.map((ue, ueIndex) =>
                        ue.bilanMcs.map((mc, mcIndex) => (
                          <ExamCard
                            key={`${periodIndex}-${ueIndex}-${mcIndex}`}
                            mc={mc}
                          />
                        )),
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="bg-muted rounded-xl p-8 text-center border-0">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-primary/30" />
                <p className="text-xl text-muted-foreground">
                  لا توجد بيانات امتحانات لهذه السنة
                </p>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
