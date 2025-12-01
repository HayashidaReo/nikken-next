import { cn } from "@/lib/utils/utils";

export const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800", className)}>
        {children}
    </span>
);
