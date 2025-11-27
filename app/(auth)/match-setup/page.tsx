"use client";

import { useMemo, useCallback } from "react";
import { MainLayout } from "@/components/templates/main-layout";
import { MatchSetupTable } from "@/components/organisms/match-setup-table";
import { MatchGroupSetupManager } from "@/components/organisms/match-group-setup-manager";
import { useTeams } from "@/queries/use-teams";
import {
  useMatches,
  useCreateMatches,
  useUpdateMatch,
  useDeleteMatches
} from "@/queries/use-matches";
import { useMatchPersistence } from "@/hooks/useMatchPersistence";
import { useTournament } from "@/queries/use-tournaments";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useToast } from "@/components/providers/notification-provider";
import { LoadingIndicator } from "@/components/molecules/loading-indicator";
import { InfoDisplay } from "@/components/molecules/info-display";
import type { MatchCreate } from "@/types/match.schema";
import {
  findPlayerInfo,
  type MatchSetupData,
} from "@/lib/utils/match-conflict-detection";
import { MasterDataProvider } from "@/components/providers/master-data-provider";

export default function MatchSetupPage() {
  const { showSuccess, showError } = useToast();
  const { needsTournamentSelection, activeTournamentId, activeTournamentType, orgId, isLoading: authLoading } = useAuthContext();

  // データ取得
  const { data: teams = [], isLoading: teamsLoading, error: teamsError } = useTeams();
  const { data: matches = [], isLoading: matchesLoading, error: matchesError } = useMatches(activeTournamentType === 'individual');
  const { data: tournament, isLoading: tournamentLoading, error: tournamentError } = useTournament(orgId, activeTournamentId);

  const tournamentRounds = useMemo(() => tournament?.rounds ?? [], [tournament]);

  const resolveRoundIdFromSetup = useCallback((row: MatchSetupData) => {
    if (row.roundId) return row.roundId;
    const derived = tournamentRounds.find(r => r.roundName === row.roundName)?.roundId;
    return derived || row.roundName || "";
  }, [tournamentRounds]);

  const createMatchesMutation = useCreateMatches();
  const updateMatchMutation = useUpdateMatch();
  const deleteMatchesMutation = useDeleteMatches();
  const { syncMatchesToCloud } = useMatchPersistence();

  const handleSave = async (matchSetupData: MatchSetupData[]) => {
    try {
      const existingMatchIds = new Set(
        matches.map(m => m.matchId).filter((id): id is string => Boolean(id))
      );
      const setupMatchIds = new Set(
        matchSetupData.map(d => d.id).filter(id => id && !id.startsWith("match-"))
      );

      // 削除対象の試合
      const matchesToDelete = Array.from(existingMatchIds).filter(id => !setupMatchIds.has(id));

      if (matchesToDelete.length > 0) {
        await deleteMatchesMutation.mutateAsync(matchesToDelete);
      }

      // 更新対象と新規作成対象に分類
      const matchesToUpdate: Array<{ matchId: string; data: MatchSetupData }> = [];
      const matchesToCreate: MatchSetupData[] = [];

      matchSetupData.forEach(setupData => {
        if (setupData.id && !setupData.id.startsWith("match-") && existingMatchIds.has(setupData.id)) {
          // 変更があるかチェック
          const original = matches.find(m => m.matchId === setupData.id);
          if (original) {
            const playerA = findPlayerInfo(setupData.playerATeamId, setupData.playerAId, teams);
            const playerB = findPlayerInfo(setupData.playerBTeamId, setupData.playerBId, teams);
            const resolvedRoundId = resolveRoundIdFromSetup(setupData) || original.roundId || "";

            const hasChanges =
              original.courtId !== setupData.courtId ||
              original.roundId !== resolvedRoundId ||
              original.sortOrder !== setupData.sortOrder ||
              original.players.playerA.playerId !== (playerA?.playerId || setupData.playerAId) ||
              original.players.playerB.playerId !== (playerB?.playerId || setupData.playerBId);

            if (hasChanges) {
              matchesToUpdate.push({ matchId: setupData.id, data: setupData });
            }
          }
        } else {
          matchesToCreate.push(setupData);
        }
      });

      // 既存試合を更新
      for (const { matchId, data: setupData } of matchesToUpdate) {
        const originalMatch = matches.find(m => m.matchId === matchId);
        if (!originalMatch) continue;

        const playerA = findPlayerInfo(setupData.playerATeamId, setupData.playerAId, teams);
        const playerB = findPlayerInfo(setupData.playerBTeamId, setupData.playerBId, teams);

        if (!playerA) {
          throw new Error(`選手A (${setupData.playerAId}) の情報が見つかりません`);
        }
        if (!playerB) {
          throw new Error(`選手B (${setupData.playerBId}) の情報が見つかりません`);
        }

        const resolvedRoundId = resolveRoundIdFromSetup(setupData) || originalMatch.roundId || "";
        if (!resolvedRoundId) {
          throw new Error("ラウンドが選択されていません");
        }

        // score/hansoku は既存の値を保持
        const patch = {
          courtId: setupData.courtId,
          roundId: resolvedRoundId,
          sortOrder: setupData.sortOrder,
          players: {
            playerA: {
              playerId: playerA.playerId,
              teamId: playerA.teamId,
              score: originalMatch.players.playerA.score,
              hansoku: originalMatch.players.playerA.hansoku,
            },
            playerB: {
              playerId: playerB.playerId,
              teamId: playerB.teamId,
              score: originalMatch.players.playerB.score,
              hansoku: originalMatch.players.playerB.hansoku,
            },
          },
        };

        await updateMatchMutation.mutateAsync({ matchId, patch });
      }

      // 新規試合を作成
      let createdMatchIds: string[] = [];
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

          const resolvedRoundId = resolveRoundIdFromSetup(setupData);
          if (!resolvedRoundId) {
            throw new Error("ラウンドが選択されていません");
          }

          return {
            courtId: setupData.courtId,
            roundId: resolvedRoundId,
            sortOrder: setupData.sortOrder,
            players: {
              playerA: {
                playerId: playerA.playerId,
                teamId: playerA.teamId,
                score: 0,
                hansoku: 0,
              },
              playerB: {
                playerId: playerB.playerId,
                teamId: playerB.teamId,
                score: 0,
                hansoku: 0,
              },
            },
            // 新規作成時は試合未完了
            isCompleted: false,
          };
        });

        const createdMatches = await createMatchesMutation.mutateAsync(newMatches);
        createdMatchIds = createdMatches.map(m => m.matchId).filter((id): id is string => !!id);
      }

      const totalCount = matchesToUpdate.length + matchesToCreate.length + matchesToDelete.length;
      if (totalCount > 0) {
        showSuccess(`${totalCount}件の変更を保存しました`);

        // バックグラウンドでクラウド同期
        const allAffectedMatchIds = [
          ...matchesToUpdate.map(m => m.matchId),
          ...createdMatchIds,
          ...matchesToDelete
        ];

        setTimeout(() => {
          syncMatchesToCloud(allAffectedMatchIds, { showSuccessToast: true }).catch(err => {
            console.error("Background sync failed:", err);
          });
        }, 0);

      } else {
        showSuccess("変更はありませんでした");
      }
    } catch (error) {
      console.error("試合設定の保存に失敗:", error);
      showError(
        error instanceof Error
          ? `保存に失敗しました: ${error.message}`
          : "試合設定の保存に失敗しました"
      );
    }
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

  // 団体戦の場合
  if (tournament.tournamentType === "team") {
    return (
      <MainLayout activeTab="match-setup">
        <MasterDataProvider teams={teams} courts={tournament.courts} rounds={tournament.rounds}>
          <MatchGroupSetupManager />
        </MasterDataProvider>
      </MainLayout>
    );
  }

  return (
    <MainLayout activeTab="match-setup">
      <MasterDataProvider teams={teams} courts={tournament.courts} rounds={tournament.rounds}>
        <div className="space-y-6">
          <MatchSetupTable
            matches={matches}
            onSave={handleSave}
            isSaving={isSaving}
          />
        </div>
      </MasterDataProvider>
    </MainLayout>
  );
}
