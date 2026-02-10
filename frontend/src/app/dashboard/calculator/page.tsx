"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Calculator,
  BookOpen,
  AlertCircle,
  RotateCcw,
  TrendingUp,
  Award,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface ModuleData {
  mcLibelleFr: string;
  coefficient: number;
  moyenneGenerale?: number;
}

interface ExamData {
  periodeLibelleFr: string;
  niveauLibelleLongLt: string;
  bilanUes: {
    ueLibelleFr?: string;
    bilanMcs: ModuleData[];
  }[];
}

interface YearData {
  uuid: string;
  id: number;
  anneeAcademiqueCode: string;
  ouvertureOffreFormationId?: number;
  niveauId?: number;
}

interface SubjectDto {
  id?: number;
  mcLibelleFr?: string;
  mcLibelleAr?: string;
  periodeLibelleFr?: string;
  periodeLibelleAr?: string;
  coefficientExamen?: number;
  coefficientControleContinu?: number;
  coefficientControleIntermediaire?: number;
}

interface CCGrade {
  id: number;
  observation?: string;
  note?: number;
  apCodeMatiere?: string;
  apLibelleFr?: string;
  apLibelleAr?: string;
}

interface ModuleWithMark extends ModuleData {
  id: string;
  mark: string;
  customCoefficient: string;
  ueIndex: number;
  mcIndex: number;
}


function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary py-8 px-4">
        <div className="max-w-[1200px] mx-auto">
          <Skeleton className="h-9 w-48 mx-auto mb-2 bg-primary-foreground/20" />
          <Skeleton className="h-5 w-64 mx-auto bg-primary-foreground/20" />
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4">
        <Card className="rounded-xl p-4 shadow-md -mt-8 mb-6 border-0">
          <div className="flex gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-28 rounded-xl" />
            ))}
          </div>
        </Card>

        <Card className="rounded-2xl p-6 shadow-md border-0">
          <Skeleton className="h-8 w-64 mb-6" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl mb-4" />
          ))}
        </Card>
      </div>
    </div>
  );
}

function ModuleRow({
  module,
  onMarkChange,
  onCoeffChange,
}: {
  module: ModuleWithMark;
  onMarkChange: (id: string, value: string) => void;
  onCoeffChange: (id: string, value: string) => void;
}) {
  const mark = parseFloat(module.mark);
  const isValidMark = !isNaN(mark) && mark >= 0 && mark <= 20;
  const isValidated = isValidMark && mark >= 10;
  const isCoeffEditable = module.coefficient === 0;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-muted rounded-xl border border-border transition-all duration-300 hover:shadow-sm">
      {/* Module Name */}
      <div className="flex-1 min-w-0 w-full sm:w-auto">
        <h4 className="font-medium text-foreground text-sm leading-snug break-words">
          {module.mcLibelleFr}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          {isCoeffEditable ? (
            <div className="flex items-center gap-1">
              <span className="text-xs text-primary">المعامل:</span>
              <Input
                type="number"
                min="0"
                step="0.5"
                placeholder="--"
                value={module.customCoefficient}
                onChange={(e) => onCoeffChange(module.id, e.target.value)}
                className="w-16 h-7 text-center text-sm font-medium bg-primary/10 border-primary/30"
              />
            </div>
          ) : (
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary hover:bg-primary/10 shrink-0"
            >
              المعامل: {module.coefficient}
            </Badge>
          )}
        </div>
      </div>

      {/* Mark Input */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Input
            type="number"
            min="0"
            max="20"
            step="0.01"
            value={module.mark}
            onChange={(e) => onMarkChange(module.id, e.target.value)}
            className={`w-24 text-center text-lg font-bold ${isValidMark
              ? isValidated
                ? "border-emerald-500 focus-visible:ring-emerald-500"
                : "border-destructive focus-visible:ring-destructive"
              : "border-destructive focus-visible:ring-destructive"
              }`}
          />
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            /20
          </span>
        </div>

        {/* Validation indicator */}
        {isValidMark && (
          <div className="flex items-center">
            {isValidated ? (
              <CheckCircle className="w-6 h-6 text-emerald-500" />
            ) : (
              <XCircle className="w-6 h-6 text-destructive" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ResultsSummary({
  moyenne,
  totalModules,
  validatedModules,
}: {
  moyenne: number;
  totalModules: number;
  validatedModules: number;
}) {
  const isValid = moyenne >= 10;

  return (
    <Card className="bg-card rounded-xl border-0 shadow-md sticky top-4">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="w-5 h-5 text-primary" />
          ملخص النتائج
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Average */}
        <div className="text-center p-4 rounded-xl bg-muted">
          <p className="text-sm text-muted-foreground mb-1">المعدل</p>
          <div
            className={`text-4xl font-bold ${isValid ? "text-emerald-600" : "text-destructive"
              }`}
          >
            {moyenne.toFixed(2)}
          </div>
          <span className="text-muted-foreground">/20</span>
          <Badge
            variant={isValid ? "default" : "destructive"}
            className={`mt-2 ${isValid
              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
              : "bg-destructive/10 text-destructive hover:bg-destructive/10"
              }`}
          >
            {isValid ? "ناجح" : "راسب"}
          </Badge>
        </div>


      </CardContent>
    </Card>
  );
}

interface ExamGrade {
  id: number;
  codeMatiere?: string;
  libelleMatiere?: string;
  libelleMatiereArabe?: string;
  mcLibelleFr?: string;
  mcLibelleAr?: string;
  rattachementMcMcLibelleFr?: string;
  rattachementMcMcLibelleAr?: string;
  noteExamen?: number;
  rattachementMcCoefficient?: number;
  rattachementMcCredit?: number;
}

export default function CalculatorPage() {
  const {
    studentData,
    fetchExamData,
    fetchExamGrades,
    fetchSubjects,
    fetchCCGrades,
    isLoading: authLoading
  } = useAuth();
  const [examDataByYear, setExamDataByYear] = useState<Map<string, ExamData[]>>(
    new Map(),
  );
  const [examGradesByYear, setExamGradesByYear] = useState<Map<string, ExamGrade[]>>(new Map());
  const [subjectsByYear, setSubjectsByYear] = useState<Map<string, SubjectDto[]>>(new Map());
  const [ccGradesByYear, setCcGradesByYear] = useState<Map<string, CCGrade[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeYear, setActiveYear] = useState<string>("");
  const [activePeriod, setActivePeriod] = useState<number>(0);
  const [marks, setMarks] = useState<Map<string, string>>(new Map());
  const [customCoefficients, setCustomCoefficients] = useState<
    Map<string, string>
  >(new Map());

  useEffect(() => {
    const loadData = async () => {
      if (!studentData) {
        setIsLoading(false);
        return;
      }

      const yearDataArray = studentData as YearData[];

      if (!Array.isArray(yearDataArray) || yearDataArray.length === 0) {
        setIsLoading(false);
        return;
      }

      const newExamData = new Map<string, ExamData[]>();
      const newExamGrades = new Map<string, ExamGrade[]>();
      const newSubjects = new Map<string, SubjectDto[]>();
      const newCcGrades = new Map<string, CCGrade[]>();

      if (yearDataArray.length > 0 && !activeYear) {
        setActiveYear(yearDataArray[0].anneeAcademiqueCode);
      }

      try {
        for (const yearData of yearDataArray) {
          try {
            const examData = await fetchExamData(yearData.id.toString());
            if (examData) {
              newExamData.set(
                yearData.anneeAcademiqueCode,
                examData as ExamData[],
              );
            }

            const grades = await fetchExamGrades(yearData.id.toString());
            if (Array.isArray(grades)) {
              newExamGrades.set(yearData.anneeAcademiqueCode, grades);
            }

            const ccGrades = await fetchCCGrades(yearData.id.toString());
            if (Array.isArray(ccGrades)) {
              newCcGrades.set(yearData.anneeAcademiqueCode, ccGrades);
            }

            if (yearData.ouvertureOffreFormationId && yearData.niveauId) {
              const subjects = await fetchSubjects(
                yearData.ouvertureOffreFormationId.toString(),
                yearData.niveauId.toString()
              );
              if (Array.isArray(subjects)) {
                newSubjects.set(yearData.anneeAcademiqueCode, subjects);
              }
            }
          } catch (yearErr) {
          }
        }
        setExamDataByYear(newExamData);
        setExamGradesByYear(newExamGrades);
        setCcGradesByYear(newCcGrades);
        setSubjectsByYear(newSubjects);

        if (newExamData.size === 0) {
          setError("لا توجد بيانات متاحة");
        }
      } catch (err) {
        setError("خطأ في تحميل بيانات المواد");
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      loadData();
    }
  }, [studentData, fetchExamData, fetchExamGrades, fetchSubjects, fetchCCGrades, authLoading, activeYear]);

  const findGradeForModule = (moduleName: string, grades: ExamGrade[]): string | null => {
    const normalizedName = moduleName.trim().toLowerCase();

    const grade = grades.find(g => {
      const candidates = [
        g.libelleMatiereArabe,
        g.mcLibelleAr,
        g.rattachementMcMcLibelleAr,
        g.libelleMatiere,
        g.mcLibelleFr,
        g.rattachementMcMcLibelleFr
      ];

      return candidates.some(c => c && c.trim().toLowerCase() === normalizedName);
    });

    if (grade && grade.noteExamen !== undefined && grade.noteExamen !== null) {
      return grade.noteExamen.toString();
    }

    return null;
  };

  const findCoefficientForModule = (moduleName: string, grades: ExamGrade[]): number | null => {
    const normalizedName = moduleName.trim().toLowerCase();

    const grade = grades.find(g => {
      const candidates = [
        g.libelleMatiereArabe,
        g.mcLibelleAr,
        g.rattachementMcMcLibelleAr,
        g.libelleMatiere,
        g.mcLibelleFr,
        g.rattachementMcMcLibelleFr
      ];

      return candidates.some(c => c && c.trim().toLowerCase() === normalizedName);
    });

    if (grade && grade.rattachementMcCoefficient !== undefined && grade.rattachementMcCoefficient !== null && grade.rattachementMcCoefficient > 0) {
      return grade.rattachementMcCoefficient;
    }

    return null;
  };

  const currentModules = useMemo<ModuleWithMark[]>(() => {
    const yearExams = examDataByYear.get(activeYear) || [];
    const yearGrades = examGradesByYear.get(activeYear) || [];
    const yearSubjects = subjectsByYear.get(activeYear) || [];
    const yearCcGrades = ccGradesByYear.get(activeYear) || [];
    const period = yearExams[activePeriod];

    const modules: ModuleWithMark[] = [];

    const processedModuleNames = new Set<string>();

    if (period) {
      period.bilanUes.forEach((ue, ueIndex) => {
        ue.bilanMcs.forEach((mc, mcIndex) => {
          const id = `${activeYear}-${activePeriod}-${ueIndex}-${mcIndex}`;
          const normalizedName = mc.mcLibelleFr.trim().toLowerCase();
          processedModuleNames.add(normalizedName);

          // Find subject match (for additional info)
          const subject = yearSubjects.find(s =>
            (s.mcLibelleFr && s.mcLibelleFr.trim().toLowerCase() === normalizedName) ||
            (s.mcLibelleAr && s.mcLibelleAr.trim() === normalizedName)
          );

          let realCoeff = mc.coefficient;
          if (realCoeff === 0 || realCoeff === undefined) {
            const examCoeff = findCoefficientForModule(mc.mcLibelleFr, yearGrades);
            if (examCoeff !== null) {
              realCoeff = examCoeff;
            }
          }

          let defaultMark = "0";

          if (marks.has(id)) {
            defaultMark = marks.get(id)!;
          } else {
            const matchedGrade = findGradeForModule(mc.mcLibelleFr, yearGrades);
            if (matchedGrade) {
              defaultMark = matchedGrade;
            } else if (mc.moyenneGenerale !== undefined && mc.moyenneGenerale !== null) {
              defaultMark = mc.moyenneGenerale.toString();
            }
          }

          modules.push({
            ...mc,
            id,
            coefficient: realCoeff,
            mark: defaultMark,
            customCoefficient: customCoefficients.get(id) || "",
            ueIndex,
            mcIndex,
          });
        });
      });
    }

    yearCcGrades.forEach((cc, index) => {
      if (!cc.apLibelleFr) return;

      const normalizedName = cc.apLibelleFr.trim().toLowerCase();
      if (processedModuleNames.has(normalizedName)) return;

      const subject = yearSubjects.find(s =>
        s.mcLibelleFr && s.mcLibelleFr.trim().toLowerCase() === normalizedName
      );

      if (subject) {
        const id = `cc-module-${activeYear}-${index}`;

        let coeff = findCoefficientForModule(cc.apLibelleFr, yearGrades);
        if (coeff === null) {
          coeff = 1;
        }

        let defaultMark = "0";

        if (marks.has(id)) {
          defaultMark = marks.get(id)!;
        } else if (cc.note !== undefined && cc.note !== null) {
          defaultMark = cc.note.toString();
        }

        modules.push({
          mcLibelleFr: cc.apLibelleFr || "Module Inconnu",
          coefficient: coeff,
          id,
          mark: defaultMark,
          customCoefficient: customCoefficients.get(id) || "",
          ueIndex: -1,
          mcIndex: -1
        });

        processedModuleNames.add(normalizedName);
      }
    });

    return modules;
  }, [examDataByYear, examGradesByYear, subjectsByYear, ccGradesByYear, activeYear, activePeriod, marks, customCoefficients]);

  const results = useMemo(() => {
    let sumWeighted = 0;
    let sumCoeff = 0;
    let validatedModules = 0;

    currentModules.forEach((module) => {
      const mark = parseFloat(module.mark);
      const effectiveCoeff =
        module.coefficient === 0
          ? parseFloat(module.customCoefficient) || 0
          : module.coefficient;

      if (!isNaN(mark) && mark >= 0 && mark <= 20 && effectiveCoeff > 0) {
        sumWeighted += mark * effectiveCoeff;
        sumCoeff += effectiveCoeff;

        if (mark >= 10) {
          validatedModules++;
        }
      }
    });

    return {
      moyenne: sumCoeff > 0 ? sumWeighted / sumCoeff : 0,
      totalModules: currentModules.length,
      validatedModules,
    };
  }, [currentModules]);

  const handleMarkChange = (id: string, value: string) => {
    const newMarks = new Map(marks);
    newMarks.set(id, value);
    setMarks(newMarks);
  };

  const handleCoeffChange = (id: string, value: string) => {
    const newCoeffs = new Map(customCoefficients);
    newCoeffs.set(id, value);
    setCustomCoefficients(newCoeffs);
  };

  const resetMarks = () => {
    setMarks(new Map());
    setCustomCoefficients(new Map());
  };

  const fillWithExistingMarks = () => {
    const newMarks = new Map(marks);
    currentModules.forEach((module) => {
      if (module.moyenneGenerale !== undefined) {
        newMarks.set(module.id, module.moyenneGenerale.toString());
      }
    });
    setMarks(newMarks);
  };

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
          <div className="flex items-center justify-center gap-3 mb-2">
            <Calculator className="w-8 h-8" />
            <h1 className="text-center text-3xl sm:text-4xl font-bold">
              حساب المعدل
            </h1>
          </div>
          <p className="text-center text-primary-foreground/80 text-base sm:text-lg">
            احسب معدلك وتحقق من الأرصدة المكتسبة
          </p>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-4 py-6">
        {/* Year Navigation */}
        <Card className="relative rounded-xl p-4 shadow-md -mt-8 mb-6 border-0">
          <div
            className="flex gap-3 overflow-x-auto scrollbar-hide py-1 scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {yearDataArray.map((yearData) => (
              <Button
                key={yearData.id}
                variant={
                  activeYear === yearData.anneeAcademiqueCode
                    ? "default"
                    : "outline"
                }
                onClick={() => {
                  setActiveYear(yearData.anneeAcademiqueCode);
                  setActivePeriod(0);
                }}
                className={`py-3 px-6 rounded-xl transition-all duration-300 font-medium min-w-max h-auto ${activeYear === yearData.anneeAcademiqueCode
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card text-primary border-2 border-accent hover:bg-accent"
                  }`}
              >
                {yearData.anneeAcademiqueCode}
              </Button>
            ))}
          </div>
        </Card>

        {/* Period Navigation */}
        {currentYearExams.length > 0 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {currentYearExams.map((period, index) => (
              <Button
                key={index}
                variant={activePeriod === index ? "default" : "outline"}
                size="sm"
                onClick={() => setActivePeriod(index)}
                className={`rounded-lg min-w-max ${activePeriod === index
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground"
                  }`}
              >
                {period.periodeLibelleFr}
              </Button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Modules List */}
          <div className="lg:col-span-2">
            <Card className="rounded-2xl shadow-md border-0">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 shrink-0">
                  <Award className="w-5 h-5 text-primary" />
                  المواد الدراسية
                </CardTitle>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fillWithExistingMarks}
                    className="text-xs flex-1 sm:flex-none"
                  >
                    <TrendingUp className="w-4 h-4 ml-1" />
                    <span className="whitespace-nowrap">
                      استخدام النتائج السابقة
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetMarks}
                    className="text-xs flex-1 sm:flex-none"
                  >
                    <RotateCcw className="w-4 h-4 ml-1" />
                    <span className="whitespace-nowrap">إعادة تعيين</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentModules.length > 0 ? (
                  currentModules.map((module) => (
                    <ModuleRow
                      key={module.id}
                      module={module}
                      onMarkChange={handleMarkChange}
                      onCoeffChange={handleCoeffChange}
                    />
                  ))
                ) : (
                  <div className="bg-muted rounded-xl p-8 text-center">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-primary/30" />
                    <p className="text-muted-foreground">
                      لا توجد مواد لهذه الفترة
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results Summary */}
          <div className="lg:col-span-1">
            <ResultsSummary
              moyenne={results.moyenne}
              totalModules={results.totalModules}
              validatedModules={results.validatedModules}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
