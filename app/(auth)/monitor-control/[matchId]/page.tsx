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
import { useState, useCallback, useMemo } from "react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useTeamMatchController } from "@/hooks/useTeamMatchController";
import { determineWinner, Winner } from "@/domains/match/match-logic";
import { MonitorControlHeader } from "@/components/organisms/monitor-control-header";
import { RepMatchSetupDialog } from "@/components/molecules/rep-match-setup-dialog";

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
  const [showRepMatchDialog, setShowRepMatchDialog] = useState(false);

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

  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  const handleMonitorClick = useCallback(() => {
    if (isPresentationConnected) {
      setShowDisconnectConfirm(true);
    } else {
      handleMonitorAction();
    }
  }, [isPresentationConnected, handleMonitorAction]);

  const handleDisconnectConfirm = useCallback(() => {
    setShowDisconnectConfirm(false);
    handleMonitorAction();
  }, [handleMonitorAction]);

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

  // 代表戦ダイアログのハンドラー
  const handleNextMatchClick = useCallback(() => {
    if (needsRepMatch) {
      // 代表戦が必要な場合はダイアログを表示
      setShowRepMatchDialog(true);
    } else {
      // 通常の次の試合へ
      handleNextMatch();
    }
  }, [needsRepMatch, handleNextMatch]);

  const handleRepMatchConfirm = useCallback((playerAId: string, playerBId: string) => {
    setShowRepMatchDialog(false);
    handleCreateRepMatch(playerAId, playerBId);
  }, [handleCreateRepMatch]);

  const handleRepMatchCancel = useCallback(() => {
    setShowRepMatchDialog(false);
  }, []);

  // teamMatchesから正しいチーム順序を取得
  const orderedTeams = useMemo(() => {
    if (!teamMatches || teamMatches.length === 0 || !teams) return null;

    // 表示用のチーム順序（teamA/teamB）を決定するために先頭要素を利用する。
    const firstMatch = teamMatches[0];
    const teamAId = firstMatch.players.playerA.teamId;
    const teamBId = firstMatch.players.playerB.teamId;

    const teamA = teams.find(t => t.teamId === teamAId);
    const teamB = teams.find(t => t.teamId === teamBId);

    if (!teamA || !teamB) return null;

    return { teamA, teamB };
  }, [teamMatches, teams]);

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
          isPublic={isPublic}
          onTogglePublic={togglePublic}
          monitorStatusMode={monitorStatusMode}
          isPresentationConnected={isPresentationConnected}
          activeTournamentType={activeTournamentType}
          viewMode={viewMode}
          isAllFinished={isAllFinished}
          isSaving={isSaving}
          onBackToDashboard={handleBackToDashboard}
          onMonitorAction={handleMonitorClick}
          onSave={handleSave}
          onConfirmMatch={handleConfirmMatchClick}
          onNextMatch={handleNextMatchClick}
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
