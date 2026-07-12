"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, User, GraduationCap, School, Calendar, MapPin } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StudentInfo {
  id: number;
  identifiant: string;
  nomLatin: string;
  prenomLatin: string;
  nomArabe: string;
  prenomArabe: string;
  dateNaissance: string;
  lieuNaissance: string;
  lieuNaissanceArabe: string;
  email: string;
  photo?: string;
}

interface EnrollmentData {
  llEtablissementLatin?: string;
  ofLlSpecialite?: string;
  ofLlFiliere?: string;
  individuLieuNaissance?: string;
  individuDateNaissance?: string;
  individuNomLatin?: string;
  individuPrenomLatin?: string;
  individuNomArabe?: string;
  individuPrenomArabe?: string;
}

export default function ProfilePage() {
  const { fetchStudentInfo, fetchStudentPhoto, studentData, isAuthenticated, isLoading: authLoading } = useAuth();
  const [info, setInfo] = useState<StudentInfo | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Get latest enrollment for university/specialty info
  const latestEnrollment: EnrollmentData | null = Array.isArray(studentData) && studentData.length > 0
    ? studentData[0]
    : null;

  useEffect(() => {
    const loadInfo = async () => {
      // Wait for auth to complete and ensure user is authenticated
      if (authLoading) return;

      if (!isAuthenticated) {
        setError("يرجى تسجيل الدخول أولاً");
        setIsLoading(false);
        return;
      }

      try {
        const [data, photo] = await Promise.all([
          fetchStudentInfo(),
          fetchStudentPhoto()
        ]);
        setInfo(data as StudentInfo);
        setPhotoBase64(photo);
      } catch (err) {
        // Use enrollment data as fallback if available
        if (latestEnrollment) {
          setInfo(null); // Will use latestEnrollment data instead
          // Still try to get photo if possible, or just fail silently for photo
          try {
            const photo = await fetchStudentPhoto();
            setPhotoBase64(photo);
          } catch (e) {
            console.error("Failed to fetch photo fallback", e);
          }
        } else {
          setError("خطأ في تحميل المعلومات الشخصية");
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadInfo();
  }, [fetchStudentInfo, fetchStudentPhoto, authLoading, isAuthenticated, latestEnrollment]);

  if (authLoading || isLoading) {
    return (
      <div
        dir="rtl"
        className="min-h-screen flex items-center justify-center px-6 py-10 bg-[#eef7f4] font-[Tajawal,Open_Sans,sans-serif] relative overflow-hidden"
      >
        <div className="fixed -top-[10%] -right-[10%] w-1/2 h-1/2 rounded-full bg-[radial-gradient(circle,rgba(28,163,126,0.07)_0%,transparent_70%)] pointer-events-none" />
        <div className="fixed -bottom-[10%] -left-[10%] w-1/2 h-1/2 rounded-full bg-[radial-gradient(circle,rgba(28,163,126,0.05)_0%,transparent_70%)] pointer-events-none" />
        <div className="relative z-10 w-full max-w-[440px] space-y-5">
          <Skeleton className="h-32 w-full rounded-2xl bg-[#e2ece7]" />
          <Skeleton className="h-16 w-full rounded-2xl bg-[#e2ece7]" />
          <Skeleton className="h-16 w-full rounded-2xl bg-[#e2ece7]" />
          <Skeleton className="h-16 w-full rounded-2xl bg-[#e2ece7]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        dir="rtl"
        className="min-h-screen flex items-center justify-center px-6 py-10 bg-[#eef7f4] font-[Tajawal,Open_Sans,sans-serif] relative overflow-hidden"
      >
        <div className="fixed -top-[10%] -right-[10%] w-1/2 h-1/2 rounded-full bg-[radial-gradient(circle,rgba(28,163,126,0.07)_0%,transparent_70%)] pointer-events-none" />
        <div className="fixed -bottom-[10%] -left-[10%] w-1/2 h-1/2 rounded-full bg-[radial-gradient(circle,rgba(28,163,126,0.05)_0%,transparent_70%)] pointer-events-none" />
        <div className="relative z-10 w-full max-w-[440px]">
          <Alert variant="destructive" className="rounded-2xl border-none bg-[#fbe9e7] text-[#8a3b32]">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!info && !latestEnrollment) return null;

  const fullNameLatin = `${info?.prenomLatin || latestEnrollment?.individuPrenomLatin || ''} ${info?.nomLatin || latestEnrollment?.individuNomLatin || ''}`.trim();
  const fullNameArabic = `${info?.prenomArabe || latestEnrollment?.individuPrenomArabe || ''} ${info?.nomArabe || latestEnrollment?.individuNomArabe || ''}`.trim();

  const birthDate = info?.dateNaissance
    ? new Date(info.dateNaissance).toLocaleDateString('fr-FR')
    : latestEnrollment?.individuDateNaissance
      ? new Date(latestEnrollment.individuDateNaissance).toLocaleDateString('fr-FR')
      : "غير متوفر";

  const birthPlace = info?.lieuNaissanceArabe || info?.lieuNaissance || latestEnrollment?.individuLieuNaissance || "غير متوفر";

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center px-6 py-10 bg-[#eef7f4] font-[Tajawal,Open_Sans,sans-serif] relative overflow-hidden"
    >
      <div className="fixed -top-[10%] -right-[10%] w-1/2 h-1/2 rounded-full bg-[radial-gradient(circle,rgba(28,163,126,0.07)_0%,transparent_70%)] pointer-events-none" />
      <div className="fixed -bottom-[10%] -left-[10%] w-1/2 h-1/2 rounded-full bg-[radial-gradient(circle,rgba(28,163,126,0.05)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[440px] animate-[lfIn_0.75s_cubic-bezier(0.22,1,0.36,1)_both]">

        {/* Titre */}
        <div className="text-right mb-2">
          <h1 className="text-[2rem] font-bold text-[#0d1f16] leading-tight">
            الملف الشخصي
          </h1>
        </div>

        <div className="w-10 h-[3px] bg-[#1ca37e] rounded-full ml-auto mb-6" />

        {/* Avatar, style neumorphique comme les champs du login */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-[#f3f5f4] shadow-[6px_6px_14px_rgba(170,192,182,0.55),_-6px_-6px_14px_rgba(255,255,255,0.92)] ring-4 ring-[#1ca37e]/25 flex items-center justify-center overflow-hidden mb-3">
            {photoBase64 ? (
              <img src={`data:image/jpeg;base64,${photoBase64}`} alt="Profile" className="w-full h-full object-cover" />
            ) : info?.photo ? (
              <img src={info.photo} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-9 h-9 text-[#8fa99a]" />
            )}
          </div>
          <p className="text-[1.05rem] font-bold text-[#0d1f16] uppercase tracking-wide text-center">
            {fullNameLatin}
          </p>
          <p className="text-[0.85rem] text-[#6b8f7e]">{fullNameArabic}</p>
        </div>

        {/* Champs d'info, style identique aux inputs du login */}
        <div className="space-y-5">
          <ProfileField
            label="الجامعة"
            value={latestEnrollment?.llEtablissementLatin || "غير متوفر"}
            icon={<School size={17} />}
          />
          <ProfileField
            label="التخصص"
            value={latestEnrollment?.ofLlSpecialite || latestEnrollment?.ofLlFiliere || "غير متوفر"}
            icon={<GraduationCap size={17} />}
          />
          <ProfileField
            label="تاريخ الميلاد"
            value={birthDate}
            icon={<Calendar size={17} />}
          />
          <ProfileField
            label="مكان الميلاد"
            value={birthPlace}
            icon={<MapPin size={17} />}
          />
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, value, icon }: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[0.82rem] font-semibold text-[#456256]">
        {label}
      </label>
      <div className="relative rounded-2xl bg-[#f3f5f4] shadow-[6px_6px_14px_rgba(170,192,182,0.55),_-6px_-6px_14px_rgba(255,255,255,0.92)]">
        <div
          className="h-14 w-full pl-12 pr-5 flex items-center text-right text-[#0d1f16] rounded-2xl"
          style={{ fontSize: "1rem" }}
        >
          {value}
        </div>
        <span className="absolute left-[13px] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#e8f8f3] text-[#1ca37e] pointer-events-none flex items-center justify-center">
          {icon}
        </span>
      </div>
    </div>
  );
}