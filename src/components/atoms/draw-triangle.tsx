import { cn } from "@/lib/utils/utils";

interface DrawTriangleProps {
    className?: string;
    size?: number;
}

export function DrawTriangle({ className, size = 120 }: DrawTriangleProps) {
    // 正三角形の高さ = (√3 / 2) * size
    // 正三角形の高さ = (√3 / 2) * size
    const height = (Math.sqrt(3) / 2) * size;
    const strokeWidth = size * 0.10;
    // ストロークの太さ分（+α）のパディングを確保して、角が切れないようにする
    const padding = strokeWidth;

    return (
        <svg
            width={size}
            height={height}
            viewBox={`${-padding} ${-padding} ${size + padding * 2} ${height + padding * 2}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("opacity-80", className)}
        >
            <path
                d={`M${size / 2} 0 L${size} ${height} L0 ${height} Z`}
                fill="none"
                stroke="#08bc4ad3"
                strokeWidth={strokeWidth}
                strokeLinejoin="round"
            />
        </svg>
    );
}
