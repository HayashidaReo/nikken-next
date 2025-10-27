"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useMonitorStore } from "@/store/use-monitor-store";
import {
  MatchHeader,
  PlayerScoreCard,
  TimerControl,
  MatchControlPanel
} from "@/components/molecules";

interface ScoreboardOperatorProps {
  className?: string;
}

export function ScoreboardOperator({ className }: ScoreboardOperatorProps) {
  const {
    courtName,
    round,
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
    togglePublic,
    saveMatchResult,
  } = useMonitorStore();

  const timerIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // タイマー処理
  React.useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        useMonitorStore.getState().setTimeRemaining(timeRemaining - 1);

        // 0秒になったら自動停止
        if (timeRemaining <= 1) {
          stopTimer();
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
  }, [isTimerRunning, timeRemaining, stopTimer]);

  // 表示用モニターを開く関数
  const openPresentationMonitor = async () => {
    try {
      // Presentation API未対応または実装予定のため、新しいウィンドウで開く
      window.open('/monitor-display', '_blank', 'fullscreen=yes,width=1920,height=1080');
    } catch (error) {
      console.error('Monitor display failed:', error);
    }
  };

  return (
    <div className={cn("w-full max-w-6xl mx-auto space-y-6", className)}>
      {/* ヘッダー情報 */}
      <MatchHeader
        tournamentName={tournamentName}
        courtName={courtName}
        round={round}
        onOpenMonitor={openPresentationMonitor}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 選手A */}
        <PlayerScoreCard
          player={playerA}
          playerKey="A"
          title="選手A"
          titleColor="text-blue-600"
          onScoreChange={setPlayerScore}
          onHansokuChange={setPlayerHansoku}
        />

        {/* 選手B */}
        <PlayerScoreCard
          player={playerB}
          playerKey="B"
          title="選手B"
          titleColor="text-red-600"
          onScoreChange={setPlayerScore}
          onHansokuChange={setPlayerHansoku}
        />
      </div>

      {/* タイマーコントロール */}
      <TimerControl
        timeRemaining={timeRemaining}
        isTimerRunning={isTimerRunning}
        onTimeChange={setTimeRemaining}
        onStartTimer={startTimer}
        onStopTimer={stopTimer}
      />

      {/* 表示制御と保存 */}
      <MatchControlPanel
        isPublic={isPublic}
        onTogglePublic={togglePublic}
        onSaveResult={saveMatchResult}
      />
    </div>
  );
}