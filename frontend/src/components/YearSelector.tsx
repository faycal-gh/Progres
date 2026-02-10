"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface YearData {
    id: number;
    anneeAcademiqueCode: string;
    niveauLibelleLongLt?: string; // Optional as it might differ between pages
}

interface YearSelectorProps {
    years: YearData[];
    activeYearId: string | number; // Support both ID or Code based on usage
    onYearSelect: (year: YearData) => void;
    className?: string;
}

export function YearSelector({
    years,
    activeYearId,
    onYearSelect,
    className = "",
}: YearSelectorProps) {
    const yearsNavRef = useRef<HTMLDivElement>(null);

    const scrollYears = (direction: "left" | "right") => {
        if (yearsNavRef.current) {
            const scrollAmount = direction === "left" ? -150 : 150;
            yearsNavRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    };

    if (!years.length) return null;

    return (
        <Card className={`relative rounded-xl p-4 shadow-md border-0 ${className}`}>
            {/* Navigation arrows for mobile */}
            <div className="md:hidden absolute inset-y-0 left-0 right-0 flex justify-between items-center pointer-events-none px-1 z-10">
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-9 h-9 rounded-full bg-card shadow-md pointer-events-auto text-primary hover:bg-accent"
                    onClick={() => scrollYears("right")}
                >
                    <ChevronRight className="w-5 h-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-9 h-9 rounded-full bg-card shadow-md pointer-events-auto text-primary hover:bg-accent"
                    onClick={() => scrollYears("left")}
                >
                    <ChevronLeft className="w-5 h-5" />
                </Button>
            </div>

            <div
                ref={yearsNavRef}
                className="flex gap-3 overflow-x-auto scrollbar-hide py-1 scroll-smooth"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {years.map((year) => {
                    // Normalize comparison to string to handle mixed types safely
                    const isActive = String(activeYearId) === String(year.id) ||
                        String(activeYearId) === String(year.anneeAcademiqueCode);

                    return (
                        <Button
                            key={year.id}
                            variant={isActive ? "default" : "outline"}
                            onClick={() => onYearSelect(year)}
                            className={`
                py-3 px-6 rounded-xl transition-all duration-300 font-medium min-w-max h-auto
                ${isActive
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "bg-card text-primary border-2 border-accent hover:bg-accent"
                                }
              `}
                        >
                            {year.anneeAcademiqueCode}
                        </Button>
                    );
                })}
            </div>
        </Card>
    );
}
