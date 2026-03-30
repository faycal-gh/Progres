import Link from "next/link";
import { cn } from "@/lib/utils";

interface DashboardTileProps {
  icon: string;
  title: string;
  description: string;
  href?: string;
  onClick?: () => void;
  gradient?: string;
}

const defaultGradients = [
  "bg-primary",
  "bg-primary",
  "bg-primary",
  "bg-primary",
  "bg-primary",
  "bg-primary",
];

export function DashboardTile({
  icon,
  title,
  description,
  href,
  onClick,
}: DashboardTileProps & { colorIndex?: number }) {
  const content = (
    <div
      className={cn(
        "group relative cursor-pointer overflow-hidden",
        "rounded-[18px]",
        "flex flex-col min-h-37.5 p-5",
        "transition-all duration-200",
        "bg-[#eef7f4]",
        "shadow-[6px_6px_16px_rgba(28,163,126,0.12),-6px_-6px_16px_rgba(255,255,255,0.88)]",
      )}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "3px 3px 8px rgba(28,163,126,0.1), -3px -3px 8px rgba(255,255,255,0.8), inset 2px 2px 6px rgba(28,163,126,0.07), inset -2px -2px 6px rgba(255,255,255,0.7)";
        (e.currentTarget as HTMLDivElement).style.transform = "scale(0.99)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "6px 6px 16px rgba(28,163,126,0.12), -6px -6px 16px rgba(255,255,255,0.88)";
        (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
      }}
    >
      <div
        className="absolute top-0 left-[10%] right-[10%] h-px rounded-full pointer-events-none bg-white/70"
      />

      <div className="flex items-start justify-between gap-3" dir="rtl">
        <div className="flex flex-col gap-1.5 flex-1">
          <h3 className="font-bold text-[14.5px] leading-snug text-[#2a4a3a]">
            {title}
          </h3>
          <p className="text-[12px] leading-relaxed text-[#8ab8a0]">
            {description}
          </p>
        </div>

        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-200 bg-[#e8f5f0] shadow-[inset_3px_3px_7px_rgba(28,163,126,0.12),inset_-3px_-3px_7px_rgba(255,255,255,0.9)]"
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLDivElement;
            el.style.background = "#1ca37e";
            el.style.boxShadow =
              "inset 2px 2px 5px rgba(0,0,0,0.12), inset -2px -2px 5px rgba(255,255,255,0.1)";
            const ico = el.querySelector("i");
            if (ico) ico.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLDivElement;
            el.style.background = "#eef7f4";
            el.style.boxShadow =
              "inset 3px 3px 7px rgba(28,163,126,0.12), inset -3px -3px 7px rgba(255,255,255,0.9)";
            const ico = el.querySelector("i");
            if (ico) ico.style.color = "#1ca37e";
          }}
        >
          <i
            className={cn(icon, "text-[1.1rem] transition-colors duration-200 text-[#1ca37e]")}
          />
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {content}
    </div>
  );
}

export { defaultGradients };