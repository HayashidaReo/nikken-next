import * as React from "react";
import { cn } from "@/lib/utils";
import { PenaltyBackground } from "@/components/atoms";

interface PenaltyCardsProps {
    hansokuCount: number;
    className?: string;
}

export function PenaltyCards({ hansokuCount, className = "" }: PenaltyCardsProps) {
    return (
        <PenaltyBackground className={`w-66 h-40 flex items-center justify-center ${className}`}>
            <div className="flex justify-center items-center gap-4 h-full translate-x-3">
                {Array.from({ length: Math.min(hansokuCount, 2) }, (_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "w-16 h-24 rounded-md border-2 border-white shadow-lg",
                            i === 0 ? "bg-red-600" : "bg-yellow-400"
                        )}
                    />
                ))}
            </div>
        </PenaltyBackground>
    );
}