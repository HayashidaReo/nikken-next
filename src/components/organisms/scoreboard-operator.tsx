"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils/utils";
import { useMonitorStore } from "@/store/use-monitor-store";
import { usePresentation } from "@/hooks/usePresentation";
import { useToast } from "@/components/providers/notification-provider";
import {
  MatchHeader,
  PlayerScoreCard,
  TimerControl,
  MatchControlPanel,
  FallbackMonitorDialog,
  ConfirmDialog,
} from "@/components/molecules";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

interface ScoreboardOperatorProps {
  organizationId: string;
  tournamentId: string;
  className?: string;
}

export function ScoreboardOperator({
  organizationId,
  tournamentId,
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
    togglePublic,
    saveMatchResult,
    selectedPlayer,
  } = useMonitorStore();

  const { showInfo } = useToast();
  const {
    isConnected: isPresentationConnected,
    stopPresentation,
    sendMessage,
  } = usePresentation(`${window.location.origin}/monitor-display`);

  // プレゼンテーション接続状態をグローバルストアに同期
  useEffect(() => {
    useMonitorStore.getState().setPresentationConnected(isPresentationConnected);
  }, [isPresentationConnected]);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // フォールバックダイアログの状態
  const [showFallbackDialog, setShowFallbackDialog] = useState(false);

  // 接続解除確認ダイアログの状態
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);

  // BroadcastChannel for data sharing
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    // BroadcastChannelの初期化
    broadcastChannelRef.current = new BroadcastChannel(
      "monitor-display-channel"
    );

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

    const monitorData = {
      matchId,
      tournamentName,
      courtName,
      round,
      playerA,
      playerB,
      timeRemaining,
      isTimerRunning,
      isPublic,
    };
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

  // フォールバック確認後の処理
  const handleFallbackConfirm = () => {
    setShowFallbackDialog(false);
    const monitorUrl = `${window.location.origin}/monitor-display`;
    window.open(monitorUrl, "_blank", "width=1920,height=1080");
    showInfo(
      "新しいタブでモニター表示を開始しました。データは自動的に同期されます。"
    );
  };

  const handleFallbackCancel = () => {
    setShowFallbackDialog(false);
  };

  // 接続解除確認のハンドラー
  const handleDisconnectConfirm = () => {
    setShowDisconnectDialog(false);
    stopPresentation();
    showInfo("プレゼンテーション接続を停止しました");
  };

  const handleDisconnectCancel = () => {
    setShowDisconnectDialog(false);
  };

  return (
    <div className={cn("w-full mx-auto space-y-4", className)}>
      {/* ヘッダー情報 */}
      <div className="px-6 lg:px-12">
        <MatchHeader
          tournamentName={tournamentName}
          courtName={courtName}
          round={round}
        />
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

        {/* 表示制御と保存 */}
        <MatchControlPanel
          isPublic={isPublic}
          onTogglePublic={togglePublic}
          onSaveResult={saveMatchResult}
          organizationId={organizationId}
          tournamentId={tournamentId}
        />

        {/* フォールバック確認ダイアログ */}
        <FallbackMonitorDialog
          isOpen={showFallbackDialog}
          onConfirm={handleFallbackConfirm}
          onCancel={handleFallbackCancel}
        />

        {/* 接続解除確認ダイアログ */}
        <ConfirmDialog
          isOpen={showDisconnectDialog}
          title="プレゼンテーション接続解除"
          message="プレゼンテーション接続を解除しますか？モニター画面での表示が停止されます。"
          confirmText="解除"
          cancelText="キャンセル"
          variant="destructive"
          onConfirm={handleDisconnectConfirm}
          onCancel={handleDisconnectCancel}
        />
      </div>
    </div>
  );
}
