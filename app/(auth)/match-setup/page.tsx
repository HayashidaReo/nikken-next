"use client";

import { MainLayout } from "@/components/templates/main-layout";
import { MatchSetupTable } from "@/components/organisms/match-setup-table";
import { useTeams } from "@/queries/use-teams";
import { useMatches, useCreateMatches, useDeleteMatches } from "@/queries/use-matches";
import { useTournament } from "@/queries/use-tournaments";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useToast } from "@/components/providers/notification-provider";
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
      // 1. 既存の試合を全て削除
      if (matches.length > 0) {
        const existingMatchIds = matches.map(match => match.matchId!);
        await deleteMatchesMutation.mutateAsync(existingMatchIds);
      }

      // 2. 新しい試合データに変換
      const newMatches: MatchCreate[] = matchSetupData.map(setupData => {
        // 選手AとBの情報を取得
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

      // 3. 新しい試合を作成
      await createMatchesMutation.mutateAsync(newMatches);

      showSuccess(`${newMatches.length}件の試合を設定しました`);
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
  const isSaving = createMatchesMutation.isPending || deleteMatchesMutation.isPending;
  const hasError = teamsError || matchesError || tournamentError;

  // 大会が選択されていない場合
  if (needsTournamentSelection) {
    return (
      <MainLayout activeTab="match-setup">
        <div className="flex justify-center items-center py-8">
          <div className="text-amber-600">
            大会を選択してください。ヘッダーの大会ドロップダウンから選択できます。
          </div>
        </div>
      </MainLayout>
    );
  }

  if (isLoading) {
    return (
      <MainLayout activeTab="match-setup">
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-600">データを読み込み中...</div>
        </div>
      </MainLayout>
    );
  }

  if (hasError) {
    return (
      <MainLayout activeTab="match-setup">
        <div className="flex justify-center items-center py-8">
          <div className="text-red-600">
            エラーが発生しました: {hasError instanceof Error ? hasError.message : "データの取得に失敗しました"}
          </div>
        </div>
      </MainLayout>
    );
  }

  // 大会情報が取得できない場合
  if (!tournament) {
    return (
      <MainLayout activeTab="match-setup">
        <div className="flex justify-center items-center py-8">
          <div className="text-amber-600">
            大会情報が見つかりません。
          </div>
        </div>
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
