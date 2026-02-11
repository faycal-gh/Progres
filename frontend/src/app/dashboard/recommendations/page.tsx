"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

interface CurrentStatus {
  university: string | null;
  universityAr: string | null;
  field: string | null;
  fieldAr: string | null;
  major: string | null;
  majorAr: string | null;
  speciality: string | null;
  specialityAr: string | null;
  level: string | null;
  levelAr: string | null;
  currentAverage: number | null;
  academicYear: string | null;
}

interface Recommendation {
  code: string;
  name: string;
  type: string;
  matchScore: number;
  reasoning: string;
  keySubjects: string[];
  careerOutcomes: string[];
  furtherOptions: string[];
}

interface RecommendationResponse {
  currentStatus: CurrentStatus;
  recommendations: Recommendation[];
  summary: string;
  model: string;
  universitySupported: boolean;
  fallbackUniversity: string | null;
  fieldSupported: boolean;
  unsupportedReason: string | null;
}

export default function RecommendationsPage() {
  const { token, isLoading: authLoading } = useAuth();
  const [recommendations, setRecommendations] =
    useState<RecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [careerPreference, setCareerPreference] = useState("");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/recommendations/suggest`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          careerPreference: careerPreference || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "فشل في الحصول على التوصيات");
      }

      const data = await response.json();
      setRecommendations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };



  const getScoreColor = (score: number) => {
    if (score >= 85) return "from-emerald-500 to-teal-600";
    if (score >= 70) return "from-blue-500 to-indigo-600";
    if (score >= 50) return "from-amber-500 to-orange-600";
    return "from-gray-500 to-slate-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 85) return "default";
    if (score >= 70) return "secondary";
    return "outline";
  };

  const getMedalIcon = (index: number) => {
    switch (index) {
      case 0:
        return <i className="fas fa-medal text-yellow-500 text-2xl" title="Top Recommendation"></i>;
      case 1:
        return <i className="fas fa-medal text-gray-400 text-2xl" title="Second Choice"></i>;
      case 2:
        return <i className="fas fa-medal text-amber-700 text-2xl" title="Third Choice"></i>;
      default:
        return null;
    }
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Skeleton className="h-32 w-full rounded-xl mb-6" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">

      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          <i className="fas fa-robot mr-2 text-primary"></i>
          توصيات التخصص الذكية
        </h1>
        <p className="text-muted-foreground">
          اكتشف أفضل التخصصات المناسبة لمستواك الأكاديمي
        </p>
      </div>


      <Card className="border-0 shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="career">ما هو توجهك المهني؟ (اختياري)</Label>
              <Input
                id="career"
                placeholder="مثال: تطوير البرمجيات، البحث العلمي، الصناعة..."
                value={careerPreference}
                onChange={(e) => setCareerPreference(e.target.value)}
                className="text-right"
                dir="rtl"
              />
            </div>
            <Button
              onClick={fetchRecommendations}
              disabled={isLoading}
              className="w-full md:w-auto"
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin ml-2"></i>
                  جاري التحليل...
                </>
              ) : (
                <>
                  <i className="fas fa-magic ml-2"></i>
                  احصل على التوصيات
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>


      {recommendations && !recommendations.universitySupported && (
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-700">
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <i className="fas fa-university text-5xl text-amber-500 dark:text-amber-400"></i>
              <h2 className="text-xl font-bold text-amber-800 dark:text-amber-300">
                هيكل جامعتك غير مدعوم حالياً
              </h2>
              <p className="text-amber-700 dark:text-amber-400 max-w-md mx-auto">
                عذراً، لم يتم إضافة الهيكل الأكاديمي لجامعتك بعد إلى نظام التوصيات.
                لا يمكننا تقديم توصيات دقيقة بدون معرفة التخصصات المتاحة في جامعتك.
              </p>
              <div className="pt-4">
                <a
                  href="https://github.com/faycal-gh/Progres/blob/main/docs/CONTRIBUTING_SPECIALTIES.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 hover:underline"
                >
                  <i className="fab fa-github"></i>
                  ساهم بإضافة جامعتك على GitHub
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      )}


      {recommendations && recommendations.universitySupported && !recommendations.fieldSupported && (
        <Card className="border-orange-300 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-700">
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <i className="fas fa-graduation-cap text-5xl text-orange-500 dark:text-orange-400"></i>
              <h2 className="text-xl font-bold text-orange-800 dark:text-orange-300">
                تخصصك غير مدعوم حالياً
              </h2>
              <p className="text-orange-700 dark:text-orange-400 max-w-md mx-auto">
                {recommendations.unsupportedReason || "تشكيلة تخصصكم غير متوفرة بعد في نظام التوصيات."}
              </p>
              <p className="text-sm text-orange-600 dark:text-orange-500 max-w-md mx-auto">
                جامعتك مدعومة لكن تخصصك الحالي لم يتم إضافته بعد.
                يمكنك المساهمة بإضافة تخصصك للمشروع.
              </p>
              <div className="pt-4">
                <a
                  href="https://github.com/faycal-gh/Progres/blob/main/docs/CONTRIBUTING_SPECIALTIES.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400 hover:underline"
                >
                  <i className="fab fa-github"></i>
                  ساهم بإضافة تخصصك على GitHub
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      )}


      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      )}


      {!isLoading && recommendations?.universitySupported && recommendations?.fieldSupported && (
        <>


          {recommendations?.currentStatus && (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/10 to-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <i className="fas fa-user-graduate text-primary"></i>
                  وضعك الأكاديمي الحالي
                </CardTitle>
              </CardHeader>
              <CardContent>

                {(recommendations.currentStatus.university || recommendations.currentStatus.universityAr) && (
                  <div className="mb-4 pb-4 border-b">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-university text-primary"></i>
                      <span className="text-muted-foreground">الجامعة:</span>
                      <span className="font-semibold">
                        {recommendations.currentStatus.universityAr ||
                          recommendations.currentStatus.university}
                      </span>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">الميدان</p>
                    <p className="font-medium">
                      {recommendations.currentStatus.fieldAr ||
                        recommendations.currentStatus.field ||
                        "غير محدد"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">الفرع</p>
                    <p className="font-medium">
                      {recommendations.currentStatus.majorAr ||
                        recommendations.currentStatus.major ||
                        "غير محدد"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">التخصص</p>
                    <p className="font-medium">
                      {recommendations.currentStatus.specialityAr ||
                        recommendations.currentStatus.speciality ||
                        "غير محدد"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">السنة الدراسية</p>
                    <p className="font-medium">
                      {recommendations.currentStatus.academicYear || "غير محدد"}
                    </p>
                  </div>
                </div>
                {recommendations.currentStatus.currentAverage && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">المعدل الحالي:</span>
                      <Badge variant="default" className="text-lg px-3 py-1">
                        {recommendations.currentStatus.currentAverage.toFixed(2)}/20
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}


          {error && (
            <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                  <i className="fas fa-exclamation-circle text-xl"></i>
                  <p>{error}</p>
                </div>
              </CardContent>
            </Card>
          )}


          {!isLoading && recommendations?.recommendations && (
            <div className="space-y-4">

              {recommendations.summary && (
                <Card className="border-0 shadow-md bg-gradient-to-br from-violet-500/10 to-purple-500/5">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-violet-500/20">
                        <i className="fas fa-brain text-violet-600 dark:text-violet-400"></i>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-violet-600 dark:text-violet-400 mb-1">
                          تحليل الذكاء الاصطناعي
                        </p>
                        <p className="text-foreground/80">{recommendations.summary}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          النموذج: {recommendations.model}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}


              {recommendations.recommendations.map((rec, index) => (
                <Card
                  key={rec.code}
                  className={`border-0 shadow-lg overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-xl ${expandedCard === rec.code ? "ring-2 ring-primary" : ""
                    }`}
                  onClick={() =>
                    setExpandedCard(expandedCard === rec.code ? null : rec.code)
                  }
                >

                  <CardContent className="pt-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span>{getMedalIcon(index)}</span>
                          <h3 className="text-lg font-bold">
                            {rec.name}
                          </h3>
                          <Badge variant={getScoreBadgeVariant(rec.matchScore)}>
                            {rec.type === "major"
                              ? "فرع"
                              : rec.type === "speciality"
                                ? "تخصص"
                                : "ماستر"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{rec.name}</p>


                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${getScoreColor(
                                rec.matchScore
                              )} transition-all duration-500`}
                              style={{ width: `${rec.matchScore}%` }}
                            />
                          </div>
                          <span className="font-bold text-lg min-w-[50px]">
                            {rec.matchScore}%
                          </span>
                        </div>


                        <p className="text-sm text-foreground/80 mb-4">
                          {rec.reasoning}
                        </p>


                        {expandedCard === rec.code && (
                          <div className="space-y-4 pt-4 border-t animate-in fade-in slide-in-from-top-2 duration-300">

                            {rec.keySubjects?.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                  <i className="fas fa-book text-primary"></i>
                                  المواد الأساسية
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {rec.keySubjects.map((subject, i) => (
                                    <Badge key={i} variant="secondary">
                                      {subject}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}


                            {rec.careerOutcomes?.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                  <i className="fas fa-briefcase text-primary"></i>
                                  الفرص المهنية
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {rec.careerOutcomes.map((career, i) => (
                                    <Badge key={i} variant="outline">
                                      {career}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}


                            {rec.furtherOptions?.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                  <i className="fas fa-arrow-up text-primary"></i>
                                  خيارات التقدم
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {rec.furtherOptions.map((option, i) => (
                                    <Badge key={i} variant="secondary" className="bg-primary/10">
                                      {option}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>


                    <div className="text-center mt-2">
                      <i
                        className={`fas fa-chevron-down text-muted-foreground transition-transform duration-300 ${expandedCard === rec.code ? "rotate-180" : ""
                          }`}
                      ></i>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}


          {!isLoading && !error && !recommendations && (
            <Card className="border-0 shadow-md">
              <CardContent className="py-12 text-center">
                <i className="fas fa-lightbulb text-5xl text-muted-foreground mb-4"></i>
                <h3 className="text-lg font-medium mb-2">
                  احصل على توصيات ذكية
                </h3>
                <p className="text-muted-foreground mb-4">
                  اضغط على الزر أعلاه للحصول على توصيات مخصصة بناءً على سجلك الأكاديمي
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
