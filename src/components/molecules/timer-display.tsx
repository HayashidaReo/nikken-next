import * as React from "react";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/time-utils";
import { SkewedBackground } from "@/components/atoms";

interface TimerDisplayProps {
    timeRemaining: number;
    isTimerRunning: boolean;
    className?: string;
}

export function TimerDisplay({
    timeRemaining,
    isTimerRunning,
    className = ""
}: TimerDisplayProps) {
    return (
        <div className={`absolute right-0 top-1/2 transform -translate-y-1/2 z-10 ${className}`}>
            <SkewedBackground className="px-24 py-0">
                <div className="text-right">
                    <div
                        className={cn(
                            "text-[10rem] font-mono font-black",
                            isTimerRunning ? "text-green-400" : "text-white"
                        )}
                    >
                        {formatTime(timeRemaining)}
                    </div>
                </div>
            </SkewedBackground>
        </div>
    );
}