import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardTileProps {
  icon: string;
  title: string;
  description: string;
  href?: string;
  onClick?: () => void;
  gradient?: string;
}

// Single solid color for all tiles
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
  gradient,
}: DashboardTileProps & { colorIndex?: number }) {
  const content = (
    <Card
      className={cn(
        "group relative overflow-hidden cursor-pointer transition-all duration-300",
        "hover:scale-[1.02] hover:shadow-xl",
        "text-white border-0",
        gradient,
      )}
    >
      <CardContent className="p-5 flex flex-col items-center text-center min-h-[140px] justify-center">
        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          <i className={cn(icon, "text-xl")}></i>
        </div>
        <h3 className="font-bold text-sm mb-1">{title}</h3>
        <p className="text-xs opacity-80 line-clamp-2">{description}</p>
      </CardContent>
    </Card>
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
