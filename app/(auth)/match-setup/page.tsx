"use client";

import { MainLayout } from "@/components/templates/main-layout";
import { MatchSetupTable } from "@/components/organisms/match-setup-table";
import { useTeams } from "@/queries/use-teams";
import { useMatches, useCreateMatches, useUpdateMatch, useDeleteMatches } from "@/queries/use-matches";
import { useTournament } from "@/queries/use-tournaments";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useToast } from "@/components/providers/notification-provider";
import { LoadingIndicator } from "@/components/molecules/loading-indicator";
import { InfoDisplay } from "@/components/molecules/info-display";
import type { MatchCreate } from "@/types/match.schema";

export default function MatchSetupPage() {
  const { showSuccess, showError } = useToast();
  const { needsTournamentSelection, activeTournamentId, orgId, isLoading: authLoading } = useAuthContext();

  // データ取得
  const { data: teams = [], isLoading: teamsLoading, error: teamsError } = useTeams();
  const { data: matches = [], isLoading: matchesLoading, error: matchesError } = useMatches();
  const { data: tournament, isLoading: tournamentLoading, error: tournamentError } = useTournament(orgId, activeTournamentId);

  // Firebase操作のフック
  const createMatchesMutation = useCreateMatches();
  const updateMatchMutation = useUpdateMatch();
  const deleteMatchesMutation = useDeleteMatches();

  const handleSave = async (
    matchSetupData: {
      id: string;
      courtId: string;
      round: string;
      playerATeamId: string;
      playerAId: string;
      playerBTeamId: string;
      playerBId: string;
    }[]
  ) => {
    try {
      // 1. 既存試合のIDセットを作成（undefined を除外）
      const existingMatchIds = new Set(
        matches.map(m => m.matchId).filter((id): id is string => Boolean(id))
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
      const matchesToUpdate: Array<{ matchId: string; data: typeof matchSetupData[0] }> = [];
      const matchesToCreate: typeof matchSetupData = [];

      matchSetupData.forEach(setupData => {
        // id が存在し、かつ "match-" で始まらない場合は既存試合
        if (setupData.id && !setupData.id.startsWith("match-") && existingMatchIds.has(setupData.id)) {
          matchesToUpdate.push({ matchId: setupData.id, data: setupData });
        } else {
          matchesToCreate.push(setupData);
        }
      });

      // 4. 既存試合を更新（得点・反則を保持）
      for (const { matchId, data: setupData } of matchesToUpdate) {
        const existingMatch = matches.find(m => m.matchId === matchId);
        if (!existingMatch) continue;

        // 選手AとBの新しい情報を取得
        const playerA = findPlayerInfo(setupData.playerATeamId, setupData.playerAId, teams);
        const playerB = findPlayerInfo(setupData.playerBTeamId, setupData.playerBId, teams);

        if (!playerA) {
          throw new Error(`選手A (${setupData.playerAId}) の情報が見つかりません`);
        }
        if (!playerB) {
          throw new Error(`選手B (${setupData.playerBId}) の情報が見つかりません`);
        }

        // 既存の得点・反則を保持したまま選手情報を更新
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
                score: existingMatch.players.playerA.score, // 既存の得点を保持
                hansoku: existingMatch.players.playerA.hansoku, // 既存の反則を保持
              },
              playerB: {
                displayName: playerB.displayName,
                playerId: playerB.playerId,
                teamId: playerB.teamId,
                teamName: playerB.teamName,
                score: existingMatch.players.playerB.score, // 既存の得点を保持
                hansoku: existingMatch.players.playerB.hansoku, // 既存の反則を保持
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
    } catch (error) {
      console.error("試合設定の保存に失敗:", error);
      showError(
        error instanceof Error
          ? `保存に失敗しました: ${error.message}`
          : "試合設定の保存に失敗しました"
      );
    }
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
      </div>
    </MainLayout>
  );
}
