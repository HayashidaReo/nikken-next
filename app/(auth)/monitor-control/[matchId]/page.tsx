"use client";

import { useParams } from "next/navigation";
import { ConnectionStatus } from "@/components/organisms/connection-status";
import { useMonitorStore } from "@/store/use-monitor-store";
import { useSaveIndividualMatchResult, useSaveTeamMatchResult } from "@/queries/use-match-result";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { ScoreboardOperator } from "@/components/organisms/scoreboard-operator";
import { useToast } from "@/components/providers/notification-provider";
import { useAuthContext } from "@/hooks/useAuthContext";
import { LoadingIndicator } from "@/components/molecules/loading-indicator";
import { InfoDisplay } from "@/components/molecules/info-display";
import { FallbackMonitorDialog } from "@/components/molecules";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { useMatchDataWithPriority } from "@/hooks/useMatchDataWithPriority";
import { useMonitorController } from "@/hooks/useMonitorController";
import { useTeamMatches } from "@/queries/use-team-matches";
import { useTeams } from "@/queries/use-teams";
import { useTournament } from "@/queries/use-tournaments";
import { useState, useCallback } from "react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useTeamMatchController } from "@/hooks/useTeamMatchController";
import { determineWinner, Winner } from "@/domains/match/match-logic";
import { MonitorControlHeader } from "@/components/organisms/monitor-control-header";

export default function MonitorControlPage() {
  const params = useParams();
  const matchId = params.matchId as string;
  const saveIndividualMatchResultMutation = useSaveIndividualMatchResult();
  const saveTeamMatchResultMutation = useSaveTeamMatchResult();

  const presentationConnected = useMonitorStore((s) => s.presentationConnected);
  const fallbackOpen = useMonitorStore((s) => s.fallbackOpen);
  const monitorStatusMode = presentationConnected ? "presentation" : fallbackOpen ? "fallback" : "disconnected";
  const isPublic = useMonitorStore((s) => s.isPublic);
  const togglePublic = useMonitorStore((s) => s.togglePublic);

  const { orgId, activeTournamentId, activeTournamentType } = useAuthContext();
  const { showError } = useToast();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // データ取得ロジック（ストア優先）
  const { isLoading, hasError, matchFound } = useMatchDataWithPriority(matchId);

  // 団体戦用のデータ取得
  const matchGroupId = useMonitorStore((s) => s.matchGroupId);
  const setViewMode = useMonitorStore((s) => s.setViewMode);
  const setMatchResult = useMonitorStore((s) => s.setMatchResult);
  const viewMode = useMonitorStore((s) => s.viewMode);
  const { data: teamMatches } = useTeamMatches(matchGroupId || null);
  const { data: teams } = useTeams();
  const { data: tournament } = useTournament(orgId, activeTournamentId);

  // モニター制御ロジック
  const {
    isPresentationConnected,
    handleMonitorAction,
    showFallbackDialog,
    handleFallbackConfirm,
    handleFallbackCancel,
  } = useMonitorController();

  // 団体戦コントローラー
  const {
    isAllFinished,
    handleShowTeamResult,
    handleNextMatch,
    handleBackToDashboard,
    handleEnterKey: teamMatchEnterHandler,
  } = useTeamMatchController({
    matchId,
    activeTournamentType,
    teamMatches,
    teams,
    tournament,
  });

  const handleSave = useCallback(async () => {
    try {
      const store = useMonitorStore.getState();
      const matchId = store.matchId;
      if (!matchId) {
        throw new Error('Match ID is missing');
      }
      const snapshot = store.getMonitorSnapshot();
      const request = {
        matchId,
        organizationId: orgId || "",
        tournamentId: activeTournamentId || "",
        players: {
          playerA: { score: snapshot.playerA.score, hansoku: snapshot.playerA.hansoku },
          playerB: { score: snapshot.playerB.score, hansoku: snapshot.playerB.hansoku },
        },
      };

      // 大会種別に応じて保存先を切り替え
      if (activeTournamentType === "team") {
        await saveTeamMatchResultMutation.mutateAsync(request);
      } else if (activeTournamentType === "individual") {
        await saveIndividualMatchResultMutation.mutateAsync(request);
      } else {
        // 種別が不明な場合はフォールバック（両方試行）
        try {
          await saveIndividualMatchResultMutation.mutateAsync(request);
        } catch {
          await saveTeamMatchResultMutation.mutateAsync(request);
        }
      }
    } catch (err) {
      console.error(err);
      showError("試合結果の保存に失敗しました");
    }
  }, [orgId, activeTournamentId, activeTournamentType, saveTeamMatchResultMutation, saveIndividualMatchResultMutation, showError]);

  const handleConfirmMatchClick = useCallback(() => {
    setShowConfirmDialog(true);
  }, []);

  const handleConfirmMatchExecute = useCallback(async () => {
    setShowConfirmDialog(false);
    // 1. 保存
    await handleSave();

    // 2. 結果表示モードへ
    const snapshot = useMonitorStore.getState().getMonitorSnapshot();
    const winner: Winner = determineWinner(snapshot.playerA.score, snapshot.playerB.score, true);

    // 常に試合結果を表示する
    setMatchResult({
      playerA: snapshot.playerA,
      playerB: snapshot.playerB,
      winner,
    });
    setViewMode("match_result");
  }, [handleSave, setMatchResult, setViewMode]);

  const isSaving = saveIndividualMatchResultMutation.isPending || saveTeamMatchResultMutation.isPending;

  // キーボードショートカット
  const handleEnterKey = useCallback(() => {
    teamMatchEnterHandler(showConfirmDialog, handleConfirmMatchClick, handleConfirmMatchExecute);
  }, [teamMatchEnterHandler, showConfirmDialog, handleConfirmMatchClick, handleConfirmMatchExecute]);

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
          isPublic={isPublic}
          onTogglePublic={togglePublic}
          monitorStatusMode={monitorStatusMode}
          isPresentationConnected={isPresentationConnected}
          activeTournamentType={activeTournamentType}
          viewMode={viewMode}
          isAllFinished={isAllFinished}
          isSaving={isSaving}
          onBackToDashboard={handleBackToDashboard}
          onMonitorAction={handleMonitorAction}
          onSave={handleSave}
          onConfirmMatch={handleConfirmMatchClick}
          onNextMatch={handleNextMatch}
          onShowTeamResult={handleShowTeamResult}
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
      </div>
    </div>
  );
}
