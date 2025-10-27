import * as React from "react";
import { ScoreDisplay } from "@/components/molecules/score-display";
import { PenaltyCards } from "@/components/molecules/penalty-cards";

interface PlayerData {
    displayName: string;
    teamName: string;
    score: number;
    hansoku: number;
}

interface PlayerSectionProps {
    player: PlayerData;
    variant: "red" | "white";
    className?: string;
}

export function PlayerSection({ player, variant, className = "" }: PlayerSectionProps) {
    const backgroundClass = variant === "red"
        ? "bg-gradient-to-br from-red-600 to-red-800"
        : "bg-gradient-to-br from-gray-300 to-gray-400";

    const textColorClass = variant === "red" ? "text-white" : "text-black";

    return (
        <div className={`flex-1 ${backgroundClass} flex items-center justify-between px-16 py-8 ${textColorClass} ${className}`}>
            {/* 左側：チーム名と選手名 */}
            <div className="flex-1">
                <div className="text-2xl font-medium mb-2 opacity-90">
                    {player.teamName || "チーム名未設定"}
                </div>
                <div className="text-8xl font-black leading-none">
                    {player.displayName || `選手${variant === "red" ? "A" : "B"}`}
                </div>
            </div>

            {/* 右側：スコアと反則カード */}
            <div className="flex items-center gap-8">
                <ScoreDisplay score={player.score} />
                <PenaltyCards hansokuCount={player.hansoku} />
            </div>
        </div>
    );
}