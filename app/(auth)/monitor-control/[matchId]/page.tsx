"use client";

import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { ConnectionStatus } from "@/components/organisms/connection-status";
import { ScoreboardOperator } from "@/components/organisms/scoreboard-operator";
import { useAuthContext } from "@/hooks/useAuthContext";
import { LoadingIndicator } from "@/components/molecules/loading-indicator";
import { InfoDisplay } from "@/components/molecules/info-display";
import { FallbackMonitorDialog } from "@/components/molecules";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { useMonitorController } from "@/hooks/useMonitorController";
import { useMonitorStore } from "@/store/use-monitor-store";
import { useTeamMatchController } from "@/hooks/useTeamMatchController";
import { useMonitorKeyboardShortcuts } from "@/hooks/useMonitorKeyboardShortcuts";
import { MonitorControlHeader } from "@/components/organisms/monitor-control-header";
import { RepMatchSetupDialog } from "@/components/molecules/rep-match-setup-dialog";
import { useMatchAction } from "@/hooks/useMatchAction";
import { useMonitorPageData } from "@/hooks/useMonitorPageData";
import { useMonitorPageUi } from "@/hooks/useMonitorPageUi";

export default function MonitorControlPage() {
  const params = useParams();
  const matchId = params.matchId as string;

  const { orgId, activeTournamentId, activeTournamentType } = useAuthContext();

  const playerA = useMonitorStore((s) => s.playerA);
  const playerB = useMonitorStore((s) => s.playerB);
  const setViewMode = useMonitorStore((s) => s.setViewMode);

  // データ取得ロジック（統合）
  const {
    isLoading,
    hasError,
    matchFound,
    teamMatches,
    teams,
    tournament,
  } = useMonitorPageData({ matchId, orgId, activeTournamentId });

  // モニター制御ロジック
  const {
    isPresentationConnected,
    handleMonitorAction,
    showFallbackDialog,
    handleFallbackConfirm,
    handleFallbackCancel,
  } = useMonitorController();

  // UI状態ロジック（統合）
  const {
    showDisconnectConfirm,
    setShowDisconnectConfirm,
    handleMonitorClick,
    handleDisconnectConfirm,
    orderedTeams,
    monitorStatusMode,
    isPublic,
    togglePublic,
    viewMode,
  } = useMonitorPageUi({
    handleMonitorAction,
    isPresentationConnected,
    teamMatches,
    teams,
  });

  // 団体戦コントローラー
  const {
    isAllFinished,
    needsRepMatch,
    handleShowTeamResult,
    handleNextMatch,
    handleBackToDashboard,
    handleEnterKey: teamMatchEnterHandler,
    handleCreateRepMatch,
  } = useTeamMatchController({
    matchId,
    activeTournamentType,
    teamMatches,
    teams,
    tournament,
    orgId,
    tournamentId: activeTournamentId,
  });

  // 試合アクションフック
  const {
    handleSave,
    handleConfirmMatchClick,
    handleConfirmMatchExecute,
    handleNextMatchClick,
    handleRepMatchConfirm,
    handleRepMatchCancel,
    showConfirmDialog,
    setShowConfirmDialog,
    showRepMatchDialog,
    isSaving,
    handleSpecialWin,
  } = useMatchAction({
    orgId,
    activeTournamentId,
    activeTournamentType,
    needsRepMatch,
    handleNextMatch,
    handleCreateRepMatch,
    teamMatches,
    teams,
  });

  // 特別な決着の確認ダイアログ状態
  const [specialWinConfirm, setSpecialWinConfirm] = useState<{
    isOpen: boolean;
    playerKey: "A" | "B";
    action: "fusen" | "hantei" | "hansoku";
  }>({
    isOpen: false,
    playerKey: "A",
    action: "fusen",
  });

  const handleSpecialWinClick = useCallback((playerKey: "A" | "B", action: "fusen" | "hantei" | "hansoku") => {
    setSpecialWinConfirm({ isOpen: true, playerKey, action });
  }, []);

  const handleSpecialWinExecute = useCallback(async () => {
    const { playerKey, action } = specialWinConfirm;
    setSpecialWinConfirm((prev) => ({ ...prev, isOpen: false }));

    let winner: "playerA" | "playerB";
    if (action === "fusen") {
      // 不戦敗: 相手の勝ち
      winner = playerKey === "A" ? "playerB" : "playerA";
    } else if (action === "hantei") {
      // 判定勝ち: 本人の勝ち
      winner = playerKey === "A" ? "playerA" : "playerB";
    } else {
      // 反則負け: 相手の勝ち
      winner = playerKey === "A" ? "playerB" : "playerA";
    }

    await handleSpecialWin(winner, action);
  }, [specialWinConfirm, handleSpecialWin]);

  const handleStartMatch = useCallback(() => {
    setViewMode("scoreboard");
  }, [setViewMode]);

  // 現在の試合が完了しているかどうかを判定
  const isCurrentMatchCompleted = teamMatches?.find(m => m.matchId === matchId)?.isCompleted ?? false;

  // キーボードショートカット
  useMonitorKeyboardShortcuts({
    specialWinConfirm,
    handleSpecialWinExecute,
    activeTournamentType,
    showConfirmDialog,
    handleConfirmMatchExecute,
    viewMode,
    handleConfirmMatchClick,
    handleBackToDashboard,
    teamMatchEnterHandler,
    handleNextMatchClick,
    handleStartMatch,
  });

  // ローディング状態
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleBackToDashboard}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                戻る
              </Button>

              <div className="ml-2">
                <ConnectionStatus mode={monitorStatusMode} error={null} />
              </div>
            </div>
          </div>
          <div className="flex justify-center items-center py-16">
            <div className="w-full">
              <LoadingIndicator message="試合データを読み込み中..." size="lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // エラー状態
  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleBackToDashboard}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                戻る
              </Button>

              <div className="ml-2">
                <ConnectionStatus mode={monitorStatusMode} error={null} />
              </div>
            </div>
          </div>
          <div className="flex justify-center items-center py-16 w-full">
            <InfoDisplay
              variant="destructive"
              title="データの取得に失敗しました"
              message={hasError instanceof Error ? hasError.message : "データの取得に失敗しました"}
            />
          </div>
        </div>
      </div>
    );
  }

  // 試合が見つからない場合
  if (!matchFound) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleBackToDashboard}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                戻る
              </Button>

              <div className="ml-2">
                <ConnectionStatus mode={monitorStatusMode} error={null} />
              </div>
            </div>
          </div>
          <div className="flex justify-center items-center py-16 w-full">
            <InfoDisplay
              variant="warning"
              title="指定された試合が見つかりません"
              message="指定された試合が見つかりませんでした。URL を確認するか、一覧に戻ってください。"
            />
          </div>
        </div>
      </div>
    );
  }

  const getSpecialWinTitle = () => {
    const { action, playerKey } = specialWinConfirm;
    const playerName = playerKey === "A" ? playerA.displayName : playerB.displayName;
    switch (action) {
      case "fusen": return `${playerName}の不戦敗`;
      case "hantei": return `${playerName}の判定勝ち`;
      case "hansoku": return `${playerName}の反則負け`;
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <MonitorControlHeader
          monitorState={{
            isPublic,
            monitorStatusMode,
            isPresentationConnected,
          }}
          matchState={{
            activeTournamentType,
            viewMode,
            isAllFinished,
            isSaving,
            isCurrentMatchCompleted,
          }}
          actions={{
            onTogglePublic: togglePublic,
            onBackToDashboard: handleBackToDashboard,
            onMonitorAction: handleMonitorClick,
            onSave: handleSave,
            onConfirmMatch: handleConfirmMatchClick,
            onNextMatch: handleNextMatchClick,
            onShowTeamResult: handleShowTeamResult,
            onStartMatch: handleStartMatch,
          }}
        />

        <ScoreboardOperator
          organizationId={orgId || ""}
          tournamentId={activeTournamentId || ""}
          defaultMatchTime={tournament?.defaultMatchTime}
          onSpecialWinAction={handleSpecialWinClick}
        />
        <FallbackMonitorDialog
          isOpen={showFallbackDialog}
          onConfirm={handleFallbackConfirm}
          onCancel={handleFallbackCancel}
        />
        <ConfirmDialog
          isOpen={showConfirmDialog}
          title="試合結果の確定"
          message="現在のスコアで試合を確定し、結果を保存しますか？"
          onConfirm={handleConfirmMatchExecute}
          onCancel={() => setShowConfirmDialog(false)}
          confirmText="確定する"
          cancelText="キャンセル"
          confirmShortcut="Enter"
        />
        <ConfirmDialog
          isOpen={showDisconnectConfirm}
          title="モニター接続の解除"
          message="表示用モニターとの接続を解除しますか？"
          onConfirm={handleDisconnectConfirm}
          onCancel={() => setShowDisconnectConfirm(false)}
          confirmText="解除する"
          cancelText="キャンセル"
          variant="destructive"
        />
        <ConfirmDialog
          isOpen={specialWinConfirm.isOpen}
          title={getSpecialWinTitle()}
          message="この結果で確定し、試合を終了しますか？"
          onConfirm={handleSpecialWinExecute}
          onCancel={() => setSpecialWinConfirm((prev) => ({ ...prev, isOpen: false }))}
          confirmText="確定する"
          cancelText="キャンセル"
          confirmShortcut="Enter"
        />
        {/* 代表戦設定ダイアログ */}
        {orderedTeams && (
          <RepMatchSetupDialog
            isOpen={showRepMatchDialog}
            teamA={orderedTeams.teamA}
            teamB={orderedTeams.teamB}
            onConfirm={handleRepMatchConfirm}
            onCancel={handleRepMatchCancel}
          />
        )}
      </div>
    </div>
  );
}
