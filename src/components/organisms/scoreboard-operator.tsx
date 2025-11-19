"use client";

import { useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils/utils";
import { useMonitorStore } from "@/store/use-monitor-store";
import { usePresentation } from "@/hooks/usePresentation";
import { MONITOR_DISPLAY_CHANNEL, MONITOR_DISPLAY_PATH } from "@/lib/constants/monitor";
import {
  MatchHeader,
  PlayerScoreCard,
  TimerControl,
} from "@/components/molecules";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

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
    selectedPlayer,
  } = useMonitorStore();

  const {
    isConnected: isPresentationConnected,
    sendMessage,
  } = usePresentation(`${window.location.origin}${MONITOR_DISPLAY_PATH}`);

  // プレゼンテーション接続状態をグローバルストアに同期
  useEffect(() => {
    useMonitorStore.getState().setPresentationConnected(isPresentationConnected);
  }, [isPresentationConnected]);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);


  // BroadcastChannel for data sharing
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    // BroadcastChannelの初期化
    broadcastChannelRef.current = new BroadcastChannel(MONITOR_DISPLAY_CHANNEL);

    return () => {
      broadcastChannelRef.current?.close();
    };
  }, []);

  // データ送信関数（Presentation API + BroadcastChannel）
  const sendDataToMonitor = useCallback(
    (data: unknown) => {
      // Presentation APIで送信
      sendMessage(data);

      // BroadcastChannelで送信
      try {
        broadcastChannelRef.current?.postMessage(data);
      } catch (err) {
        console.warn("BroadcastChannel送信エラー:", err);
      }
    },
    [sendMessage]
  );

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

  // データが変更されたときにモニター画面に送信（タイマー更新は制限）
  const lastSendTimeRef = useRef<number>(0);

  useEffect(() => {
    const now = Date.now();
    const isTimerOnlyUpdate =
      lastSendTimeRef.current > 0 && now - lastSendTimeRef.current < 2000;

    // タイマーのみの更新の場合は送信頻度を制限
    if (isTimerOnlyUpdate && now - lastSendTimeRef.current < 500) {
      return;
    }

    lastSendTimeRef.current = now;

    const monitorData = useMonitorStore.getState().getMonitorSnapshot();
    sendDataToMonitor(monitorData);
  }, [
    matchId,
    tournamentName,
    courtName,
    round,
    playerA,
    playerB,
    timeRemaining,
    isTimerRunning,
    isPublic,
    sendDataToMonitor,
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
              round={round}
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
