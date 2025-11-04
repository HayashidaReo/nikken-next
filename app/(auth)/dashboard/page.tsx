"use client";

import { MainLayout } from "@/components/templates/main-layout";
import { AuthGuardWrapper } from "@/components/templates/auth-guard-wrapper";
import { AuthenticatedHeader } from "@/components/organisms/authenticated-header";
import { MatchListTable } from "@/components/organisms/match-list-table";
import { useMatchesRealtime } from "@/queries/use-matches";
import { useTournament } from "@/queries/use-tournaments";
import { useAuthContext } from "@/hooks/useAuthContext";
import { LoadingIndicator } from "@/components/molecules/loading-indicator";
import { InfoDisplay } from "@/components/molecules/info-display";

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
            <InfoDisplay
              variant="warning"
              title="大会が選択されていません"
              message="ヘッダーの大会ドロップダウンから操作したい大会を選択してください。"
            />
          )}

          {/* ローディング状態 */}
          {!needsTournamentSelection && isLoading && (
            <LoadingIndicator message="試合データを読み込み中..." size="lg" />
          )}

          {/* エラー状態 */}
          {!needsTournamentSelection && !isLoading && hasError && (
            <InfoDisplay
              variant="destructive"
              title="データの取得に失敗しました"
              message={hasError instanceof Error ? hasError.message : "データの取得に失敗しました"}
            />
          )}

          {/* 大会情報が取得できない場合 */}
          {!needsTournamentSelection && !isLoading && !hasError && !tournament && (
            <InfoDisplay
              variant="warning"
              title="大会情報が見つかりません"
              message="大会情報が見つかりません。管理者に問い合わせるか、大会を作成してください。"
            />
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
