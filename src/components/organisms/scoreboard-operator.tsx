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

interface ScoreboardOperatorProps {
  className?: string;
}

export function ScoreboardOperator({ className }: ScoreboardOperatorProps) {
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
  } = useMonitorStore();

  const { showSuccess, showError, showInfo } = useToast();
  const {
    isSupported: isPresentationSupported,
    isAvailable: isPresentationAvailable,
    isConnected: isPresentationConnected,
    startPresentation,
    stopPresentation,
    sendMessage,
  } = usePresentation(`${window.location.origin}/monitor-display`);

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

  // 表示用モニターを開く/停止する関数
  const handleMonitorAction = async () => {
    if (isPresentationConnected) {
      // 接続中の場合は確認ダイアログを表示
      setShowDisconnectDialog(true);
    } else {
      // 未接続の場合は開始
      try {
        if (isPresentationSupported && isPresentationAvailable) {
          // Presentation APIを使用
          await startPresentation();
          showSuccess("モニター表示を開始しました");
        } else {
          // 確認ダイアログを表示
          setShowFallbackDialog(true);
        }
      } catch (error) {
        console.error("Monitor display failed:", error);
        showError("モニター表示の開始に失敗しました。もう一度お試しください。");
      }
    }
  };

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
    <div className={cn("w-full max-w-6xl mx-auto space-y-6", className)}>
      {/* ヘッダー情報 */}
      <MatchHeader
        tournamentName={tournamentName}
        courtName={courtName}
        round={round}
        onOpenMonitor={handleMonitorAction}
        isPresentationConnected={isPresentationConnected}
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
  );
}
