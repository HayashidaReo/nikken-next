"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils/utils";
import { useMonitorStore } from "@/store/use-monitor-store";
import {
  MatchHeader,
  PlayerScoreCard,
  TimerControl,
} from "@/components/molecules";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useMonitorSender } from "@/hooks/useMonitorSender";

interface ScoreboardOperatorProps {
  organizationId: string;
  tournamentId: string;
  className?: string;
}

export function ScoreboardOperator({
  className
}: ScoreboardOperatorProps) {
  const {
    matchId,
    courtName,
    roundName,
    tournamentName,
    playerA,
    playerB,
    timeRemaining,
    isTimerRunning,
    isPublic,
    setPlayerScore,
    setPlayerHansoku,
    setTimeRemaining,
    startTimer,
    stopTimer,
    selectedPlayer,
  } = useMonitorStore();

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { sendMessage } = useMonitorSender();

  // キーボードショートカットの有効化
  useKeyboardShortcuts();

  // タイマー処理
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        const currentTime = useMonitorStore.getState().timeRemaining;
        if (currentTime > 0) {
          useMonitorStore.getState().setTimeRemaining(currentTime - 1);
        } else {
          useMonitorStore.getState().stopTimer();
        }
      }, 1000);
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTimerRunning]);


  useEffect(() => {
    // データを送信
    const monitorData = useMonitorStore.getState().getMonitorSnapshot();
    sendMessage("data", monitorData);
  }, [
    matchId,
    tournamentName,
    courtName,
    roundName,
    playerA,
    playerB,
    timeRemaining,
    isTimerRunning,
    isPublic,
    sendMessage,
  ]);

  return (
    <div className={cn("w-full mx-auto space-y-4", className)}>
      {/* ヘッダー情報 */}
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
            />
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-12">
        {/* タイマーコントロール */}
        <TimerControl
          timeRemaining={timeRemaining}
          isTimerRunning={isTimerRunning}
          onTimeChange={setTimeRemaining}
          onStartTimer={startTimer}
          onStopTimer={stopTimer}
        />
      </div>
    </div>
  );
}
