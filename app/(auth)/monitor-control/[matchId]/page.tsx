"use client";

import { useParams } from "next/navigation";
import { useCallback } from "react";
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
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useTeamMatchController } from "@/hooks/useTeamMatchController";
import { MonitorControlHeader } from "@/components/organisms/monitor-control-header";
import { RepMatchSetupDialog } from "@/components/molecules/rep-match-setup-dialog";
import { useMatchAction } from "@/hooks/useMatchAction";
import { useMonitorPageData } from "@/hooks/useMonitorPageData";
import { useMonitorPageUi } from "@/hooks/useMonitorPageUi";

export default function MonitorControlPage() {
  const params = useParams();
  const matchId = params.matchId as string;

  const { orgId, activeTournamentId, activeTournamentType } = useAuthContext();

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
  } = useMatchAction({
    orgId,
    activeTournamentId,
    activeTournamentType,
    needsRepMatch,
    handleNextMatch,
    handleCreateRepMatch,
  });

  // キーボードショートカット
  const handleEnterKey = useCallback(() => {
    teamMatchEnterHandler(showConfirmDialog, handleConfirmMatchClick, handleConfirmMatchExecute, handleNextMatchClick);
  }, [teamMatchEnterHandler, showConfirmDialog, handleConfirmMatchClick, handleConfirmMatchExecute, handleNextMatchClick]);

  useKeyboardShortcuts({ onEnter: handleEnterKey });

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
          }}
          actions={{
            onTogglePublic: togglePublic,
            onBackToDashboard: handleBackToDashboard,
            onMonitorAction: handleMonitorClick,
            onSave: handleSave,
            onConfirmMatch: handleConfirmMatchClick,
            onNextMatch: handleNextMatchClick,
            onShowTeamResult: handleShowTeamResult,
          }}
        />

        <ScoreboardOperator
          organizationId={orgId || ""}
          tournamentId={activeTournamentId || ""}
          defaultMatchTime={tournament?.defaultMatchTime}
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
