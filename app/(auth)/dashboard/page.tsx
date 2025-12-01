"use client";

import { MainLayout } from "@/components/templates/main-layout";
import { LoadingIndicator } from "@/components/molecules/loading-indicator";
import { InfoDisplay } from "@/components/molecules/info-display";
import { DashboardContent } from "@/components/templates/dashboard-content";
import { useDashboard } from "@/hooks/useDashboard";

export default function DashboardPage() {
  const {
    needsTournamentSelection,
    isLoading,
    hasError,
    matchGroupId,
    tournament,
    matches,
    matchGroups,
    teamMatches,
    teams,
    courts,
    handleBack,
  } = useDashboard();

  return (
    <MainLayout activeTab="matches">
      <div className="space-y-6">
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
          <DashboardContent
            tournamentType={tournament.tournamentType}
            matchGroupId={matchGroupId}
            matches={matches}
            matchGroups={matchGroups}
            teamMatches={teamMatches}
            teams={teams}
            tournamentName={tournament.tournamentName}
            courts={courts}
            rounds={tournament.rounds}
            onBack={handleBack}
          />
        )}
      </div>
    </MainLayout>
  );
}
