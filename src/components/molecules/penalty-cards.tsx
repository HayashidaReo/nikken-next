import * as React from "react";
import { cn } from "@/lib/utils";
import { PenaltyBackground } from "@/components/atoms";

interface PenaltyCardsProps {
    hansokuCount: number;
    className?: string;
}

export function PenaltyCards({ hansokuCount, className = "" }: PenaltyCardsProps) {
    return (
        <PenaltyBackground className={`w-44 h-24 px-6 py-4 ${className}`}>
            <div className="flex justify-center items-center gap-2 h-full">
                {Array.from({ length: Math.min(hansokuCount, 2) }, (_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "w-12 h-12 rounded-md border-2 border-white shadow-lg",
                            i === 0 ? "bg-red-600" : "bg-yellow-400"
                        )}
                    />
                ))}
            </div>
        </PenaltyBackground>
    );
}