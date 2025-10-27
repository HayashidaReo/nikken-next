import * as React from "react";
import { TimerDisplay } from "@/components/molecules/timer-display";

interface CenterSectionProps {
    tournamentName: string;
    courtName: string;
    round: string;
    timeRemaining: number;
    isTimerRunning: boolean;
    className?: string;
}

export function CenterSection({
    tournamentName,
    courtName,
    round,
    timeRemaining,
    isTimerRunning,
    className = ""
}: CenterSectionProps) {
    return (
        <div className={`bg-gray-900 py-6 px-16 relative ${className}`}>
            <div className="flex items-center justify-between">
                {/* 左側：大会情報 */}
                <div className="flex items-center gap-8 text-white">
                    <span className="text-3xl font-bold">{tournamentName}</span>
                    <span className="text-2xl">{courtName}</span>
                    <span className="text-2xl">{round}</span>
                </div>
            </div>

            {/* タイマー表示 */}
            <TimerDisplay
                timeRemaining={timeRemaining}
                isTimerRunning={isTimerRunning}
            />
        </div>
    );
}