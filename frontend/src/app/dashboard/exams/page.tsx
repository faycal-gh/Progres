"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

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
    estAbsent: boolean;
    dateExamen?: string;
    heureExamen?: string;
    dureeExamen?: number;
}

interface StudentCardData {
    id: number;
    anneeAcademiqueCode: string;
    llEtablissementArabe: string;
    numeroInscription: string;
}

export default function ExamGradesPage() {
    const { studentData, fetchExamGrades, isAuthenticated, isLoading: authLoading } = useAuth();
    const [grades, setGrades] = useState<ExamGrade[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const activeCard = Array.isArray(studentData) && studentData.length > 0
        ? (studentData[0] as StudentCardData)
        : null;

    useEffect(() => {
        const loadGrades = async () => {
            if (!activeCard) return;

            setLoading(true);
            setError(null);
            try {
                const data = await fetchExamGrades(String(activeCard.id));
                if (Array.isArray(data)) {
                    setGrades(data as ExamGrade[]);
                } else {
                    setGrades([]);
                }
            } catch (err: any) {
                console.error("Failed to load grades", err);
                setError(err.message || "Failed to load grades");
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated && activeCard) {
            loadGrades();
        } else if (isAuthenticated && !activeCard) {
            setLoading(false);
            setError("لم يتم العثور على بطاقة طالب نشطة");
        }
    }, [isAuthenticated, activeCard, fetchExamGrades]);

    if (authLoading || (loading && !grades.length && !error)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                <p className="mt-3 text-gray-600 font-medium">جاري تحميل نقاط الامتحانات...</p>
            </div>
        );
    }

    if (!activeCard) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <p className="text-xl text-gray-600 mb-4">بيانات الطالب غير متوفرة</p>
                    <Link href="/dashboard">
                        <Button className="bg-emerald-600 hover:bg-emerald-700">عودة للرئيسية</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col" dir="rtl">
            {/* Header */}
            <div className="w-full flex items-center justify-between p-4 sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-100">
                <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-emerald-600" />
                    نقاط الامتحانات
                </h1>
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-200" dir="ltr">
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </Button>
                </Link>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 max-w-3xl mx-auto w-full">

                {/* Academic Year Info */}
                <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">السنة الجامعية</p>
                        <p className="text-lg font-bold text-gray-900 font-mono">{activeCard.anneeAcademiqueCode}</p>
                    </div>
                    <div className="text-left">
                        <p className="text-sm text-gray-500 font-medium">رقم التسجيل</p>
                        <p className="text-sm font-bold text-gray-900 font-mono">{activeCard.numeroInscription}</p>
                    </div>
                </div>

                {error ? (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center border border-red-100">
                        {error}
                        <Button
                            variant="outline"
                            className="mt-2 text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => window.location.reload()}
                        >
                            إعادة المحاولة
                        </Button>
                    </div>
                ) : grades.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-gray-100">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">لا توجد نقاط متاحة</h3>
                        <p className="text-gray-500">لم يتم رصد نقاط الامتحانات بعد لهذه الفترة.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {grades.map((grade, index) => (
                            <Card key={grade.id || index} className="p-4 overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
                                <div className="flex justify-between items-start gap-4">
                                    {/* Subject Info */}
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 text-lg mb-1 leading-tight">
                                            {grade.libelleMatiereArabe || grade.mcLibelleAr || grade.rattachementMcMcLibelleAr || grade.libelleMatiere || grade.mcLibelleFr || grade.rattachementMcMcLibelleFr || "Module Check Failed"}
                                        </h3>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                                            {grade.codeMatiere}
                                        </p>
                                    </div>

                                    {/* Grade */}
                                    <div className="flex flex-col items-end">
                                        {grade.estAbsent ? (
                                            <Badge variant="destructive" className="text-xs px-2 py-1">غائب</Badge>
                                        ) : grade.noteExamen !== undefined && grade.noteExamen !== null ? (
                                            <div className={`text-2xl font-black ${grade.noteExamen >= 10 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                {grade.noteExamen.toFixed(2)}
                                                <span className="text-xs text-gray-400 font-medium mr-1">/20</span>
                                            </div>
                                        ) : (
                                            <Badge variant="outline" className="text-gray-400 border-gray-200">--/20</Badge>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
