import { cn } from "@/lib/utils/utils";

interface DrawTriangleProps {
    className?: string;
    size?: number;
}

export function DrawTriangle({ className, size = 100 }: DrawTriangleProps) {
    // 正三角形の高さ = (√3 / 2) * size
    const height = (Math.sqrt(3) / 2) * size;

    return (
        <svg
            width={size}
            height={height}
            viewBox={`0 0 ${size} ${height}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("opacity-80", className)}
        >
            <path
                d={`M${size / 2} 0 L${size} ${height} L0 ${height} Z`}
                fill="none"
                stroke="#08bc4ad3" // green-500
                strokeWidth={size * 0.15}
            />
        </svg>
    );
}
