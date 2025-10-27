import * as React from "react";
import { PlayerSection } from "@/components/organisms/player-section";
import { CenterSection } from "@/components/organisms/center-section";

interface PlayerData {
    displayName: string;
    teamName: string;
    score: number;
    hansoku: number;
}

interface MonitorLayoutProps {
    playerA: PlayerData;
    playerB: PlayerData;
    tournamentName: string;
    courtName: string;
    round: string;
    timeRemaining: number;
    isTimerRunning: boolean;
    className?: string;
}

export function MonitorLayout({
    playerA,
    playerB,
    tournamentName,
    courtName,
    round,
    timeRemaining,
    isTimerRunning,
    className = ""
}: MonitorLayoutProps) {
    return (
        <div className={`h-screen flex flex-col ${className}`}>
            {/* 上側 - 選手A（赤チーム） */}
            <PlayerSection player={playerA} variant="red" />

            {/* 中央セクション - 大会情報とタイマー */}
            <CenterSection
                tournamentName={tournamentName}
                courtName={courtName}
                round={round}
                timeRemaining={timeRemaining}
                isTimerRunning={isTimerRunning}
            />

            {/* 下側 - 選手B（グレー/白チーム） */}
            <PlayerSection player={playerB} variant="white" />
        </div>
    );
}