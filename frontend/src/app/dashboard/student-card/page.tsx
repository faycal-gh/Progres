"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { StudentCard } from "@/components/StudentCard";

interface StudentCardData {
    id: number;
    anneeAcademiqueCode: string;
    llEtablissementArabe: string;
    llEtablissementLatin: string;
    niveauLibelleLongAr: string;
    numeroInscription: string;
    ofLlDomaineArabe: string;
    ofLlFiliereAr: string;
    ofLlSpecialiteArabe: string;
    individuNomArabe: string;
    individuPrenomArabe: string;
    individuNomLatin: string;
    individuPrenomLatin: string;
    individuDateNaissance: string;
    individuLieuNaissanceArabe?: string;
    individuLieuNaissance?: string;
    refCodeEtablissement?: string;
}

export default function StudentCardPage() {
    const { studentData, fetchStudentPhoto, isAuthenticated, isLoading: authLoading } = useAuth();
    const [photoBase64, setPhotoBase64] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Get current active card (usually the first one / most recent year)
    const activeCard = Array.isArray(studentData) && studentData.length > 0
        ? (studentData[0] as StudentCardData)
        : null;

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Fetch photo
                const photo = await fetchStudentPhoto();
                setPhotoBase64(photo);
            } catch (error) {
                console.error("Failed to load student data", error);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated && activeCard) {
            loadData();
        } else if (isAuthenticated && !activeCard) {
            setLoading(false);
        }
    }, [isAuthenticated, activeCard, fetchStudentPhoto]);

    if (authLoading || loading) {
        return (
            <div
                dir="rtl"
                className="flex flex-col items-center justify-center min-h-screen bg-[#eef7f4] font-[Tajawal,Open_Sans,sans-serif] relative overflow-hidden"
            >
                <div className="fixed -top-[10%] -right-[10%] w-1/2 h-1/2 rounded-full bg-[radial-gradient(circle,rgba(28,163,126,0.07)_0%,transparent_70%)] pointer-events-none" />
                <div className="fixed -bottom-[10%] -left-[10%] w-1/2 h-1/2 rounded-full bg-[radial-gradient(circle,rgba(28,163,126,0.05)_0%,transparent_70%)] pointer-events-none" />
                <Loader2 className="w-10 h-10 animate-spin text-[#1ca37e] relative z-10" />
                <p className="mt-3 text-[#456256] font-medium relative z-10">جاري تحميل بطاقة الطالب...</p>
            </div>
        );
    }

    if (!activeCard) {
        return (
            <div
                dir="rtl"
                className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-[#eef7f4] font-[Tajawal,Open_Sans,sans-serif] relative overflow-hidden"
            >
                <div className="fixed -top-[10%] -right-[10%] w-1/2 h-1/2 rounded-full bg-[radial-gradient(circle,rgba(28,163,126,0.07)_0%,transparent_70%)] pointer-events-none" />
                <div className="fixed -bottom-[10%] -left-[10%] w-1/2 h-1/2 rounded-full bg-[radial-gradient(circle,rgba(28,163,126,0.05)_0%,transparent_70%)] pointer-events-none" />
                <div className="relative z-10 bg-[#f3f5f4] rounded-2xl shadow-[6px_6px_14px_rgba(170,192,182,0.55),_-6px_-6px_14px_rgba(255,255,255,0.92)] p-8">
                    <p className="text-xl text-[#456256] mb-4">بيانات الطالب غير متوفرة</p>
                    <Link href="/dashboard">
                        <Button className="bg-[#1ca37e] hover:bg-[#22b98e] text-white rounded-2xl shadow-[0_4px_20px_rgba(28,163,126,0.32)] transition-all duration-200 hover:-translate-y-0.5">
                            عودة للرئيسية
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div
            dir="rtl"
            className="min-h-screen bg-[#eef7f4] font-[Tajawal,Open_Sans,sans-serif] flex flex-col relative overflow-hidden"
        >
            <div className="fixed -top-[10%] -right-[10%] w-1/2 h-1/2 rounded-full bg-[radial-gradient(circle,rgba(28,163,126,0.07)_0%,transparent_70%)] pointer-events-none" />
            <div className="fixed -bottom-[10%] -left-[10%] w-1/2 h-1/2 rounded-full bg-[radial-gradient(circle,rgba(28,163,126,0.05)_0%,transparent_70%)] pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 w-full flex flex-col items-center gap-2 p-4">
                <div className="w-full flex items-center justify-between">
                    <Link href="/dashboard">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full bg-[#e8f8f3] text-[#1ca37e] hover:bg-[#d7f2e9] transition-colors duration-200"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-bold text-[#0d1f16]">بطاقة الطالب الإلكترونية</h1>
                    <div className="w-10"></div>
                </div>
                <div className="w-10 h-[3px] bg-[#1ca37e] rounded-full" />
            </div>

            {/* Student Card - Centered */}
            <div className="relative z-10 flex-1 flex items-center justify-center p-4">
                <StudentCard
                    cardData={activeCard}
                    photoBase64={photoBase64}
                />
            </div>
        </div>
    );
}