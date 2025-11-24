"use client";

import { MainLayout } from "@/components/templates/main-layout";
import { TeamManagementCardList } from "@/components/organisms/team-management-card-list";
import { ShareMenu } from "@/components/molecules/share-menu";
import { TeamStatsSummary } from "@/components/molecules/team-stats-summary";
import { useTeams, useApproveTeam } from "@/queries/use-teams";
import { useAuthContext } from "@/hooks/useAuthContext";
import { LoadingIndicator } from "@/components/molecules/loading-indicator";
import { InfoDisplay } from "@/components/molecules/info-display";

export default function TeamsPage() {
  const { needsTournamentSelection, isLoading: authLoading, orgId, activeTournamentId } = useAuthContext();
  const { data: teams = [], isLoading: teamsLoading, error } = useTeams();
  const approveTeamMutation = useApproveTeam();

  const handleApprovalChange = (teamId: string, isApproved: boolean) => {
    approveTeamMutation.mutate(teamId, isApproved);
  };

  const isLoading = authLoading || teamsLoading;

  // 大会が選択されていない場合
  if (needsTournamentSelection) {
    return (
      <MainLayout activeTab="teams">
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
      <MainLayout activeTab="teams">
        <LoadingIndicator message="チーム情報を読み込み中..." size="lg" />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout activeTab="teams">
        <InfoDisplay
          variant="destructive"
          title="データの取得に失敗しました"
          message={error instanceof Error ? error.message : "不明なエラー"}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout activeTab="teams">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">チーム・選手管理</h1>
          <div className="flex items-center gap-4">
            <TeamStatsSummary teams={teams} />
            {orgId && activeTournamentId && (
              <ShareMenu
                itemName="チーム・選手管理ページ"
                sharePath={`/teams-form/${orgId}/${activeTournamentId}`}
              />
            )}
          </div>
        </div>

        <TeamManagementCardList
          teams={teams}
          onApprovalChange={handleApprovalChange}
        />
      </div>
    </MainLayout>
  );
}
