import { cn } from "@/lib/utils/utils";

interface WinnerStampProps {
    className?: string;
    size?: number;
}

export function WinnerStamp({ className, size = 200 }: WinnerStampProps) {
    const radius = size * 0.4;
    const strokeWidth = size * 0.06;
    const center = size / 2;

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("opacity-80", className)}
        >
            <circle
                cx={center}
                cy={center}
                r={radius}
                stroke="#DC2626"
                strokeWidth={strokeWidth}
            />
        </svg>
    );
}
