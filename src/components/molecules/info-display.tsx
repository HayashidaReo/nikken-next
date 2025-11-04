import { AlertTriangle, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type InfoVariant = "default" | "warning" | "destructive";

interface InfoDisplayProps {
    variant?: InfoVariant;
    icon?: React.ReactNode;
    title: string;
    message?: string;
    className?: string;
}

const variantMap: { [key in InfoVariant]: { icon: React.ReactNode; color: string; bg: string } } = {
    default: {
        icon: <Info className="h-8 w-8" />,
        color: "text-blue-600",
        bg: "bg-blue-100",
    },
    warning: {
        icon: <AlertTriangle className="h-8 w-8" />,
        color: "text-amber-600",
        bg: "bg-amber-100",
    },
    destructive: {
        icon: <XCircle className="h-8 w-8" />,
        color: "text-red-600",
        bg: "bg-red-100",
    },
};

export function InfoDisplay({ variant = "default", icon, title, message, className }: InfoDisplayProps) {
    const { icon: defaultIcon, color, bg } = variantMap[variant];
    const displayIcon = icon || defaultIcon;

    return (
        <div className={cn("flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center", className)}>
            <div className={cn("flex h-16 w-16 items-center justify-center rounded-full bg-opacity-10", bg)}>
                <div className={color}>{displayIcon}</div>
            </div>
            <div className="space-y-1">
                <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
                {message && <p className="text-sm text-muted-foreground">{message}</p>}
            </div>
        </div>
    );
}
