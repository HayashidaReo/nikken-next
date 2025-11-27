"use client";

import { cn } from "@/lib/utils/utils";
import { useMonitorStore } from "@/store/use-monitor-store";
import {
  MatchHeader,
  PlayerScoreCard,
  TimerControl,
} from "@/components/molecules";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

interface ScoreboardOperatorProps {
  organizationId: string;
  tournamentId: string;
  defaultMatchTime?: number;
  className?: string;
  isManual?: boolean;
}

export function ScoreboardOperator({
  defaultMatchTime = 180,
  className,
  isManual = false,
}: ScoreboardOperatorProps) {
  const {
    courtName,
    roundName,
    tournamentName,
    playerA,
    playerB,
    timeRemaining,
    isTimerRunning,
    timerMode,
    setPlayerScore,
    setPlayerHansoku,
    setTimeRemaining,
    startTimer,
    stopTimer,
    setTimerMode,

    selectedPlayer,
    setPlayerName,
    setTeamName,
  } = useMonitorStore();

  // キーボードショートカットの有効化
  useKeyboardShortcuts();

  return (
    <div className={cn("w-full mx-auto space-y-4", className)}>
      {/* ヘッダー情報 */}
      {!isManual && (
        <div className="px-6 lg:px-12">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <MatchHeader
                tournamentName={tournamentName}
                courtName={courtName}
                roundName={roundName}
              />
            </div>
          </div>
        </div>
      )}

      {/* 選手カード領域（左右いっぱいに寄せる） */}
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-y-6">
          {/* 左: 選手A */}
          <div className="flex justify-start">
            <PlayerScoreCard
              player={playerA}
              playerKey="A"
              title="選手A"
              titleColor="text-blue-600"
              onScoreChange={setPlayerScore}
              onHansokuChange={setPlayerHansoku}
              isSelected={selectedPlayer === "playerA"}

              className="w-full"
              isManual={isManual}
              onNameChange={setPlayerName}
              onTeamNameChange={setTeamName}
            />
          </div>

          {/* 中央: VS */}
          <div className="flex items-center justify-center">
            <div className="px-4 items-center justify-center overflow-hidden">
              <span className="inline-block text-base lg:text-3xl font-bold text-gray-400">VS</span>
            </div>
          </div>

          {/* 右: 選手B */}
          <div className="flex justify-end">
            <PlayerScoreCard
              player={playerB}
              playerKey="B"
              title="選手B"
              titleColor="text-red-600"
              onScoreChange={setPlayerScore}
              onHansokuChange={setPlayerHansoku}
              isSelected={selectedPlayer === "playerB"}

              className="w-full"
              isManual={isManual}
              onNameChange={setPlayerName}
              onTeamNameChange={setTeamName}
            />
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-12">
        {/* タイマーコントロール */}
        <TimerControl
          timeRemaining={timeRemaining}
          isTimerRunning={isTimerRunning}
          timerMode={timerMode}
          onTimeChange={setTimeRemaining}
          onStartTimer={startTimer}
          onStopTimer={stopTimer}
          onTimerModeChange={setTimerMode}
          defaultMatchTime={defaultMatchTime}
        />
      </div>
    </div>
  );
}
