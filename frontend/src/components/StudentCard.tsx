"use client";

import Image from "next/image";
import QRCode from "react-qr-code";
import { Card } from "@/components/ui/card";

interface StudentCardComponentProps {
    cardData: {
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
    };
    photoBase64: string | null;
}

// Algerian emblem URL
const EMBLEM_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Seal_of_Algeria.svg/330px-Seal_of_Algeria.svg.png";

export function StudentCard({ cardData, photoBase64 }: StudentCardComponentProps) {
    // Generate QR code URL for verification
    const qrCodeUrl = `https://progres.mesrs.dz/api/infos/checkInscription/${cardData.id}`;

    return (
        <div className="flex items-center justify-center">
            <Card className="relative w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl bg-white text-black border-0 transform -rotate-90 origin-center">

                <div className="absolute inset-0 z-0">
                    <Image
                        src="/card_student_empty_dz.webp"
                        alt="Card Background"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>


                <div className="relative z-10 w-full flex flex-col p-3 sm:p-4">


                    <div className="flex items-center justify-center mb-2">

                        <div className="flex-1 text-center px-1" dir="rtl">
                            <p className="text-[10px] font-bold text-gray-800 leading-tight">
                                الجمهورية الجزائرية الديمقراطية الشعبية
                            </p>
                            <p className="text-[9px] font-bold text-gray-700 leading-tight">
                                وزارة التعليم العالي والبحث العلمي
                            </p>
                            <p className="text-[9px] font-semibold text-gray-600 leading-tight mt-0.5">
                                {cardData.llEtablissementArabe}
                            </p>
                            <h1 className="text-lg font-black text-gray-900 mt-1" style={{ fontFamily: 'serif' }}>
                                بطاقة الطالب
                            </h1>
                        </div>
                    </div>


                    <div className="flex items-start gap-2" dir="rtl">

                        <div className="flex-shrink-0">
                            <div className="w-20 h-24 bg-gray-200 rounded-md overflow-hidden border border-white shadow-md relative">
                                {photoBase64 ? (
                                    <Image
                                        src={`data:image/jpeg;base64,${photoBase64}`}
                                        alt="Student Photo"
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>


                        <div className="flex-1 space-y-1">

                            <div className="flex items-baseline gap-1">
                                <span className="text-[9px] text-emerald-800 font-bold whitespace-nowrap">اللقب</span>
                                <div className="flex-1 flex justify-between items-baseline border-b border-gray-300/40 pb-0.5">
                                    <span className="text-[11px] font-black text-gray-900">{cardData.individuNomArabe}</span>
                                    <span className="text-[9px] font-bold text-gray-600 uppercase" dir="ltr">{cardData.individuNomLatin}</span>
                                </div>
                            </div>


                            <div className="flex items-baseline gap-1">
                                <span className="text-[9px] text-emerald-800 font-bold whitespace-nowrap">الاسم</span>
                                <div className="flex-1 flex justify-between items-baseline border-b border-gray-300/40 pb-0.5">
                                    <span className="text-[11px] font-black text-gray-900">{cardData.individuPrenomArabe}</span>
                                    <span className="text-[9px] font-bold text-gray-600 uppercase" dir="ltr">{cardData.individuPrenomLatin}</span>
                                </div>
                            </div>


                            <div className="flex items-baseline gap-1">
                                <span className="text-[8px] text-emerald-800 font-bold whitespace-nowrap leading-tight">تاريخ و مكان الميلاد</span>
                                <div className="flex-1 flex justify-between items-baseline border-b border-gray-300/40 pb-0.5">
                                    <span className="text-[9px] font-bold text-gray-800 truncate max-w-[80px]">
                                        {cardData.individuLieuNaissanceArabe || cardData.individuLieuNaissance || ''}
                                    </span>
                                    <span className="text-[9px] font-black text-gray-900 font-mono" dir="ltr">
                                        {new Date(cardData.individuDateNaissance).toLocaleDateString("fr-FR")}
                                    </span>
                                </div>
                            </div>


                            <div className="flex items-baseline gap-1">
                                <span className="text-[9px] text-emerald-800 font-bold whitespace-nowrap">الميدان</span>
                                <span className="text-[9px] font-bold text-gray-800 truncate">{cardData.ofLlDomaineArabe}</span>
                            </div>


                            {(cardData.ofLlFiliereAr || cardData.ofLlSpecialiteArabe) && (
                                <div className="flex items-baseline gap-1">
                                    <span className="text-[9px] text-emerald-800 font-bold whitespace-nowrap">الفرع</span>
                                    <span className="text-[8px] font-bold text-gray-800 leading-tight truncate">
                                        {cardData.ofLlSpecialiteArabe || cardData.ofLlFiliereAr}
                                    </span>
                                </div>
                            )}
                        </div>


                        <div className="flex flex-col items-center gap-1 flex-shrink-0">
                            <div className="w-16 h-16 bg-white p-0.5 rounded shadow-sm">
                                <QRCode
                                    value={qrCodeUrl}
                                    size={256}
                                    style={{ height: "100%", maxWidth: "100%", width: "100%" }}
                                    viewBox="0 0 256 256"
                                    fgColor="#000000"
                                />
                            </div>

                            <div className="w-8 h-8 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#f59e0b" className="w-6 h-6">
                                    <path d="M12 2C8 2 4 2.5 4 6v9.5c0 .95.38 1.8 1 2.44V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-2.06c.62-.64 1-1.49 1-2.44V6c0-3.5-4-4-8-4zm5.5 13c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM18 9H6V5h12v4z" />
                                </svg>
                            </div>
                        </div>
                    </div>


                    <div className="flex justify-between items-center mt-2 pt-1 border-t border-gray-200/50">
                        <div className="text-[10px] font-black text-gray-800 font-mono tracking-wide">
                            UN{cardData.numeroInscription}
                        </div>
                        <div className="text-[10px] font-bold text-gray-800" dir="rtl">
                            السنة الجامعية: <span className="font-black">{cardData.anneeAcademiqueCode}</span>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
