import { cn } from "@/lib/utils";

interface SpinnerProps {
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    color?: "blue" | "white" | "gray" | "green" | "red";
    className?: string;
}

export function Spinner({
    size = "md",
    color = "blue",
    className
}: SpinnerProps) {
    const sizeClasses = {
        xs: "h-3 w-3 border",
        sm: "h-4 w-4 border",
        md: "h-6 w-6 border-2",
        lg: "h-8 w-8 border-2",
        xl: "h-12 w-12 border-2",
    };

    const colorClasses = {
        blue: "border-blue-600",
        white: "border-white",
        gray: "border-gray-600",
        green: "border-green-600",
        red: "border-red-600",
    };

    return (
        <div
            className={cn(
                "animate-spin rounded-full border-t-transparent",
                sizeClasses[size],
                colorClasses[color],
                className
            )}
            role="status"
            aria-label="読み込み中"
        />
    );
}