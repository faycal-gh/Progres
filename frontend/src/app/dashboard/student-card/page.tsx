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
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                <p className="mt-3 text-gray-600 font-medium">جاري تحميل بطاقة الطالب...</p>
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col">
            {/* Header */}
            <div className="w-full flex items-center justify-between p-4">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-200">
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </Button>
                </Link>
                <h1 className="text-xl font-bold text-gray-800">بطاقة الطالب الإلكترونية</h1>
                <div className="w-10"></div>
            </div>

            {/* Student Card - Centered */}
            <div className="flex-1 flex items-center justify-center p-4">
                <StudentCard
                    cardData={activeCard}
                    photoBase64={photoBase64}
                />
            </div>
        </div>
    );
}