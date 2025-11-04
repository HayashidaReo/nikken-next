"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/templates/main-layout";
import { MatchSetupTable } from "@/components/organisms/match-setup-table";
import { useTeams } from "@/queries/use-teams";
import {
  useMatches,
  useMatchesRealtime,
  useCreateMatches,
  useUpdateMatch,
  useDeleteMatches
} from "@/queries/use-matches";
import { useTournament } from "@/queries/use-tournaments";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useToast } from "@/components/providers/notification-provider";
import { LoadingIndicator } from "@/components/molecules/loading-indicator";
import { InfoDisplay } from "@/components/molecules/info-display";
import { ConcurrentEditDialog } from "@/components/molecules/concurrent-edit-dialog";
import type { MatchCreate, Match } from "@/types/match.schema";

export default function MatchSetupPage() {
  const { showSuccess, showError } = useToast();
  const { needsTournamentSelection, activeTournamentId, orgId, isLoading: authLoading } = useAuthContext();

  // データ取得
  const { data: teams = [], isLoading: teamsLoading, error: teamsError } = useTeams();
  const { data: matches = [], isLoading: matchesLoading, error: matchesError } = useMatches();
  const { data: tournament, isLoading: tournamentLoading, error: tournamentError } = useTournament(orgId, activeTournamentId);

  // リアルタイム購読（serverState） - 他端末の変更を常に監視
  const { data: realtimeMatches = [] } = useMatchesRealtime();

  // ページを開いた時点の初期状態を保持（競合検出の基準点）
  const [initialMatches, setInitialMatches] = useState<Match[]>([]);

  // matches が最初に取得されたタイミングで初期状態を保存
  useEffect(() => {
    if (matches.length > 0 && initialMatches.length === 0) {
      setInitialMatches(matches);
    }
  }, [matches, initialMatches.length]);

  // Firebase操作のフック
  const createMatchesMutation = useCreateMatches();
  const updateMatchMutation = useUpdateMatch(); // Transaction版（競合回避）
  const deleteMatchesMutation = useDeleteMatches();

  // 競合ダイアログの状態
  type MatchSetupData = {
    id: string;
    courtId: string;
    round: string;
    playerATeamId: string;
    playerAId: string;
    playerBTeamId: string;
    playerBId: string;
  };

  const [conflictDialog, setConflictDialog] = useState<{
    open: boolean;
    conflicts: Array<{
      matchId: string;
      directConflicts: {
        courtId?: { draft: string; server: string };
        round?: { draft: string; server: string };
        playerA?: { draft: string; server: string };
        playerB?: { draft: string; server: string };
      };
      serverOnlyChanges: {
        courtId?: { initial: string; server: string };
        round?: { initial: string; server: string };
        playerA?: { initial: string; server: string };
        playerB?: { initial: string; server: string };
      };
    }>;
    pendingSaveData: MatchSetupData[] | null;
  }>({
    open: false,
    conflicts: [],
    pendingSaveData: null,
  });

  const handleSave = async (
    matchSetupData: MatchSetupData[]
  ) => {
    // Step 1: 差分検出（自分の編集 vs 他端末の編集）
    const conflicts = detectConflicts(matchSetupData, initialMatches, realtimeMatches, teams);

    if (conflicts.length > 0) {
      // 競合がある場合はダイアログ表示
      setConflictDialog({
        open: true,
        conflicts,
        pendingSaveData: matchSetupData,
      });
      return;
    }

    // Step 2: 競合がない場合は直接保存
    await executeSave(matchSetupData);
  };

  // 競合を検出する関数
  // - initialState: ページを開いた時点の状態
  // - draftData: ユーザーが編集した内容
  // - serverData: リアルタイム購読で取得した最新の状態
  // 
  // 検出する競合の種類:
  // 1. directConflicts: 両方が同じフィールドを異なる値に変更
  // 2. serverOnlyChanges: 他端末のみが変更（ユーザーは変更していない）
  const detectConflicts = (
    draftData: MatchSetupData[],
    initialState: Match[],
    serverData: Match[],
    teamsData: typeof teams
  ) => {
    const conflicts: typeof conflictDialog.conflicts = [];

    draftData.forEach(draft => {
      // 新規作成（id が "match-" で始まる or 空）の場合はスキップ
      if (!draft.id || draft.id.startsWith("match-")) return;

      const initialMatch = initialState.find(m => m.matchId === draft.id);
      const serverMatch = serverData.find(m => m.matchId === draft.id);

      // 初期状態かサーバーデータがない場合はスキップ
      if (!initialMatch || !serverMatch) return;

      const directConflicts: typeof conflicts[0]['directConflicts'] = {};
      const serverOnlyChanges: typeof conflicts[0]['serverOnlyChanges'] = {};
      let hasAnyConflict = false;

      // === courtId のチェック ===
      const userChangedCourtId = draft.courtId !== initialMatch.courtId;
      const serverChangedCourtId = serverMatch.courtId !== initialMatch.courtId;

      if (userChangedCourtId && serverChangedCourtId && draft.courtId !== serverMatch.courtId) {
        // 直接競合: 両方が異なる値に変更
        directConflicts.courtId = { draft: draft.courtId, server: serverMatch.courtId };
        hasAnyConflict = true;
      } else if (!userChangedCourtId && serverChangedCourtId) {
        // 間接競合: 他端末のみが変更
        serverOnlyChanges.courtId = { initial: initialMatch.courtId, server: serverMatch.courtId };
        hasAnyConflict = true;
      }

      // === round のチェック ===
      const userChangedRound = draft.round !== initialMatch.round;
      const serverChangedRound = serverMatch.round !== initialMatch.round;

      if (userChangedRound && serverChangedRound && draft.round !== serverMatch.round) {
        directConflicts.round = { draft: draft.round, server: serverMatch.round };
        hasAnyConflict = true;
      } else if (!userChangedRound && serverChangedRound) {
        serverOnlyChanges.round = { initial: initialMatch.round, server: serverMatch.round };
        hasAnyConflict = true;
      }

      // === 選手A のチェック ===
      const userChangedPlayerA = draft.playerAId !== initialMatch.players.playerA.playerId;
      const serverChangedPlayerA = serverMatch.players.playerA.playerId !== initialMatch.players.playerA.playerId;

      if (userChangedPlayerA && serverChangedPlayerA && draft.playerAId !== serverMatch.players.playerA.playerId) {
        const draftPlayerAName = findPlayerInfo(draft.playerATeamId, draft.playerAId, teamsData)?.displayName || "";
        const serverPlayerAName = serverMatch.players.playerA.displayName;
        directConflicts.playerA = { draft: draftPlayerAName, server: serverPlayerAName };
        hasAnyConflict = true;
      } else if (!userChangedPlayerA && serverChangedPlayerA) {
        const initialPlayerAName = initialMatch.players.playerA.displayName;
        const serverPlayerAName = serverMatch.players.playerA.displayName;
        serverOnlyChanges.playerA = { initial: initialPlayerAName, server: serverPlayerAName };
        hasAnyConflict = true;
      }

      // === 選手B のチェック ===
      const userChangedPlayerB = draft.playerBId !== initialMatch.players.playerB.playerId;
      const serverChangedPlayerB = serverMatch.players.playerB.playerId !== initialMatch.players.playerB.playerId;

      if (userChangedPlayerB && serverChangedPlayerB && draft.playerBId !== serverMatch.players.playerB.playerId) {
        const draftPlayerBName = findPlayerInfo(draft.playerBTeamId, draft.playerBId, teamsData)?.displayName || "";
        const serverPlayerBName = serverMatch.players.playerB.displayName;
        directConflicts.playerB = { draft: draftPlayerBName, server: serverPlayerBName };
        hasAnyConflict = true;
      } else if (!userChangedPlayerB && serverChangedPlayerB) {
        const initialPlayerBName = initialMatch.players.playerB.displayName;
        const serverPlayerBName = serverMatch.players.playerB.displayName;
        serverOnlyChanges.playerB = { initial: initialPlayerBName, server: serverPlayerBName };
        hasAnyConflict = true;
      }

      // score/hansoku は競合として扱わない（自動マージ）

      if (hasAnyConflict) {
        conflicts.push({
          matchId: draft.id,
          directConflicts,
          serverOnlyChanges,
        });
      }
    });

    return conflicts;
  };

  // 実際の保存処理
  const executeSave = async (matchSetupData: MatchSetupData[]) => {
    try {
      // 1. 既存試合のIDセットを作成（undefined を除外）
      const existingMatchIds = new Set(
        realtimeMatches.map(m => m.matchId).filter((id): id is string => Boolean(id))
      );
      const setupMatchIds = new Set(
        matchSetupData.map(d => d.id).filter(id => id && !id.startsWith("match-"))
      );

      // 2. 削除対象の試合を特定（既存にあるがセットアップデータにない試合）
      const matchesToDelete = Array.from(existingMatchIds).filter(id => !setupMatchIds.has(id));
      if (matchesToDelete.length > 0) {
        await deleteMatchesMutation.mutateAsync(matchesToDelete);
      }

      // 3. 更新対象と新規作成対象に分ける
      const matchesToUpdate: Array<{ matchId: string; data: MatchSetupData }> = [];
      const matchesToCreate: MatchSetupData[] = [];

      matchSetupData.forEach(setupData => {
        // id が存在し、かつ "match-" で始まらない場合は既存試合
        if (setupData.id && !setupData.id.startsWith("match-") && existingMatchIds.has(setupData.id)) {
          matchesToUpdate.push({ matchId: setupData.id, data: setupData });
        } else {
          matchesToCreate.push(setupData);
        }
      });

      // 4. 既存試合を更新（Transaction 使用 + score/hansoku を realtimeMatches から取得）
      for (const { matchId, data: setupData } of matchesToUpdate) {
        // リアルタイム購読データから最新の score/hansoku を取得
        const latestMatch = realtimeMatches.find(m => m.matchId === matchId);
        if (!latestMatch) continue;

        // 選手AとBの新しい情報を取得
        const playerA = findPlayerInfo(setupData.playerATeamId, setupData.playerAId, teams);
        const playerB = findPlayerInfo(setupData.playerBTeamId, setupData.playerBId, teams);

        if (!playerA) {
          throw new Error(`選手A (${setupData.playerAId}) の情報が見つかりません`);
        }
        if (!playerB) {
          throw new Error(`選手B (${setupData.playerBId}) の情報が見つかりません`);
        }

        // Transaction ベースの更新で、最新の score/hansoku を保持
        await updateMatchMutation.mutateAsync({
          matchId,
          patch: {
            courtId: setupData.courtId,
            round: setupData.round,
            players: {
              playerA: {
                displayName: playerA.displayName,
                playerId: playerA.playerId,
                teamId: playerA.teamId,
                teamName: playerA.teamName,
                score: latestMatch.players.playerA.score, // リアルタイムの最新値
                hansoku: latestMatch.players.playerA.hansoku, // リアルタイムの最新値
              },
              playerB: {
                displayName: playerB.displayName,
                playerId: playerB.playerId,
                teamId: playerB.teamId,
                teamName: playerB.teamName,
                score: latestMatch.players.playerB.score, // リアルタイムの最新値
                hansoku: latestMatch.players.playerB.hansoku, // リアルタイムの最新値
              },
            },
          },
        });
      }

      // 5. 新規試合を作成
      if (matchesToCreate.length > 0) {
        const newMatches: MatchCreate[] = matchesToCreate.map(setupData => {
          const playerA = findPlayerInfo(setupData.playerATeamId, setupData.playerAId, teams);
          const playerB = findPlayerInfo(setupData.playerBTeamId, setupData.playerBId, teams);

          if (!playerA) {
            throw new Error(`選手A (${setupData.playerAId}) の情報が見つかりません`);
          }
          if (!playerB) {
            throw new Error(`選手B (${setupData.playerBId}) の情報が見つかりません`);
          }

          return {
            courtId: setupData.courtId,
            round: setupData.round,
            players: {
              playerA: {
                displayName: playerA.displayName,
                playerId: playerA.playerId,
                teamId: playerA.teamId,
                teamName: playerA.teamName,
                score: 0,
                hansoku: 0,
              },
              playerB: {
                displayName: playerB.displayName,
                playerId: playerB.playerId,
                teamId: playerB.teamId,
                teamName: playerB.teamName,
                score: 0,
                hansoku: 0,
              },
            },
          };
        });

        await createMatchesMutation.mutateAsync(newMatches);
      }

      const totalCount = matchesToUpdate.length + matchesToCreate.length;
      showSuccess(`${totalCount}件の試合を設定しました`);

      // ダイアログを閉じる
      setConflictDialog({ open: false, conflicts: [], pendingSaveData: null });
    } catch (error) {
      console.error("試合設定の保存に失敗:", error);
      showError(
        error instanceof Error
          ? `保存に失敗しました: ${error.message}`
          : "試合設定の保存に失敗しました"
      );
    }
  };

  // 競合ダイアログでの「保存する」アクション
  const handleConflictConfirm = async () => {
    if (!conflictDialog.pendingSaveData) return;
    await executeSave(conflictDialog.pendingSaveData);
  };

  // 競合ダイアログでの「キャンセル」アクション
  const handleConflictCancel = () => {
    setConflictDialog({ open: false, conflicts: [], pendingSaveData: null });
  };

  // ヘルパー関数: 選手情報を検索
  const findPlayerInfo = (teamId: string, playerId: string, teamsData: typeof teams) => {
    const team = teamsData.find(t => t.teamId === teamId);
    if (!team) return null;

    const player = team.players.find(p => p.playerId === playerId);
    if (!player) return null;

    return {
      displayName: player.displayName,
      playerId: player.playerId,
      teamId: team.teamId,
      teamName: team.teamName,
    };
  };

  const isLoading = authLoading || teamsLoading || matchesLoading || tournamentLoading;
  const isSaving = createMatchesMutation.isPending || updateMatchMutation.isPending || deleteMatchesMutation.isPending;
  const hasError = teamsError || matchesError || tournamentError;

  // 大会が選択されていない場合
  if (needsTournamentSelection) {
    return (
      <MainLayout activeTab="match-setup">
        <InfoDisplay
          variant="warning"
          title="大会が選択されていません"
          message="ヘッダーの大会ドロップダウンから操作したい大会を選択してください。"
        />
      </MainLayout>
    );
  }

  if (isLoading) {
    return (
      <MainLayout activeTab="match-setup">
        <LoadingIndicator message="データを読み込み中..." size="lg" />
      </MainLayout>
    );
  }

  if (hasError) {
    return (
      <MainLayout activeTab="match-setup">
        <InfoDisplay
          variant="destructive"
          title="データの取得に失敗しました"
          message={hasError instanceof Error ? hasError.message : "データの取得に失敗しました"}
        />
      </MainLayout>
    );
  }

  // 大会情報が取得できない場合
  if (!tournament) {
    return (
      <MainLayout activeTab="match-setup">
        <InfoDisplay
          variant="warning"
          title="大会情報が見つかりません"
          message="大会情報が見つかりません。管理者に問い合わせるか、大会を作成してください。"
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout activeTab="match-setup">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            試合の組み合わせ設定
          </h1>
        </div>

        <MatchSetupTable
          teams={teams}
          courts={tournament.courts}
          matches={matches}
          onSave={handleSave}
          isSaving={isSaving}
        />

        {/* 競合確認ダイアログ */}
        <ConcurrentEditDialog
          open={conflictDialog.open}
          conflicts={conflictDialog.conflicts}
          onConfirm={handleConflictConfirm}
          onCancel={handleConflictCancel}
        />
      </div>
    </MainLayout>
  );
}
