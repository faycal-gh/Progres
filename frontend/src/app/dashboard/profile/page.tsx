"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
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
      <div className="min-h-screen bg-background p-3 pb-24">
        <div className="max-w-md mx-auto space-y-3">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-3">
        <div className="max-w-md mx-auto">
          <Alert variant="destructive">
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

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with Avatar */}
      <div className="bg-primary pt-5 pb-10 px-3">
        <div className="max-w-md mx-auto flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center mb-2 ring-2 ring-primary-foreground/30 overflow-hidden">
            {photoBase64 ? (
              <img src={`data:image/jpeg;base64,${photoBase64}`} alt="Profile" className="w-full h-full object-cover" />
            ) : info?.photo ? (
              <img src={info.photo} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-primary-foreground" />
            )}
          </div>
          <h1 className="text-base font-bold text-primary-foreground uppercase tracking-wide">
            {fullNameLatin}
          </h1>
          <p className="text-primary-foreground/80 text-sm">{fullNameArabic}</p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="max-w-md mx-auto px-3 -mt-5 space-y-2">
        {/* University */}
        <InfoRow
          icon={<School className="w-4 h-4 text-primary" />}
          label="الجامعة"
          value={latestEnrollment?.llEtablissementLatin || "غير متوفر"}
        />

        {/* Specialty */}
        <InfoRow
          icon={<GraduationCap className="w-4 h-4 text-primary" />}
          label="التخصص"
          value={latestEnrollment?.ofLlSpecialite || latestEnrollment?.ofLlFiliere || "غير متوفر"}
        />

        {/* Birth Date */}
        <InfoRow
          icon={<Calendar className="w-4 h-4 text-primary" />}
          label="تاريخ الميلاد"
          value={info?.dateNaissance
            ? new Date(info!.dateNaissance).toLocaleDateString('fr-FR')
            : latestEnrollment?.individuDateNaissance
              ? new Date(latestEnrollment.individuDateNaissance).toLocaleDateString('fr-FR')
              : "غير متوفر"}
        />

        {/* Birth Place */}
        <InfoRow
          icon={<MapPin className="w-4 h-4 text-primary" />}
          label="مكان الميلاد"
          value={info?.lieuNaissanceArabe || info?.lieuNaissance || latestEnrollment?.individuLieuNaissance || "غير متوفر"}
        />

      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-3 flex items-start gap-3">
        <div className="p-2 rounded-full bg-primary/10 shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0 text-right">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="font-medium text-sm text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
