import { cn } from "@/lib/utils/utils";

interface VerticalTextProps {
    text: string;
    variant?: "player" | "team" | "round";
    className?: string;
}

export function VerticalText({ text, variant = "player", className }: VerticalTextProps) {
    const variantStyles = {
        player: "text-5xl font-bold text-white tracking-widest",
        team: "text-6xl font-bold text-white tracking-widest",
        round: "text-2xl font-medium text-gray-300 tracking-widest",
    };

    return (
        <div
            style={{
                writingMode: "vertical-rl",
                textOrientation: "upright"
            }}
            className={cn(variantStyles[variant], className)}
        >
            {text}
        </div>
    );
}
