"use client";

import { MainLayout } from "@/components/templates/main-layout";
import { AuthGuardWrapper } from "@/components/templates/auth-guard-wrapper";
import { AuthenticatedHeader } from "@/components/organisms/authenticated-header";
import { MatchListTable } from "@/components/organisms/match-list-table";
import { useMatchesRealtime } from "@/queries/use-matches";
import { useTournament } from "@/queries/use-tournaments";
import { useAuthContext } from "@/hooks/useAuthContext";

export default function DashboardPage() {
  const { needsTournamentSelection, activeTournamentId, orgId, isLoading: authLoading } = useAuthContext();

  // Firebase からデータを取得（リアルタイム更新対応）
  const { data: matches = [], isLoading: matchesLoading, error: matchesError } = useMatchesRealtime();
  const { data: tournament, isLoading: tournamentLoading, error: tournamentError } = useTournament(orgId, activeTournamentId);

  const isLoading = authLoading || matchesLoading || tournamentLoading;
  const hasError = matchesError || tournamentError;

  return (
    <AuthGuardWrapper>
      <MainLayout activeTab="matches">
        <div className="space-y-6">
          <AuthenticatedHeader title="試合一覧" />

          {/* 大会が選択されていない場合 */}
          {needsTournamentSelection && (
            <div className="flex justify-center items-center py-8">
              <div className="text-amber-600">
                大会を選択してください。ヘッダーの大会ドロップダウンから選択できます。
              </div>
            </div>
          )}

          {/* ローディング状態 */}
          {!needsTournamentSelection && isLoading && (
            <div className="flex justify-center items-center py-8">
              <div className="text-gray-600">試合データを読み込み中...</div>
            </div>
          )}

          {/* エラー状態 */}
          {!needsTournamentSelection && !isLoading && hasError && (
            <div className="flex justify-center items-center py-8">
              <div className="text-red-600">
                エラーが発生しました: {hasError instanceof Error ? hasError.message : "データの取得に失敗しました"}
              </div>
            </div>
          )}

          {/* 大会情報が取得できない場合 */}
          {!needsTournamentSelection && !isLoading && !hasError && !tournament && (
            <div className="flex justify-center items-center py-8">
              <div className="text-amber-600">
                大会情報が見つかりません。
              </div>
            </div>
          )}

          {/* 正常時の表示 */}
          {!needsTournamentSelection && !isLoading && !hasError && tournament && (
            <MatchListTable
              matches={matches}
              tournamentName={tournament.tournamentName}
              courts={tournament.courts}
            />
          )}
        </div>
      </MainLayout>
    </AuthGuardWrapper>
  );
}
