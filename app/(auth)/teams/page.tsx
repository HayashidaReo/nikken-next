"use client";

import { MainLayout } from "@/components/templates/main-layout";
import { TeamManagementCardList } from "@/components/organisms/team-management-card-list";
import { useTeams, useApproveTeam } from "@/queries/use-teams";
import { useAuthContext } from "@/hooks/useAuthContext";
import { LoadingIndicator } from "@/components/molecules/loading-indicator";
import { InfoDisplay } from "@/components/molecules/info-display";

export default function TeamsPage() {
  const { needsTournamentSelection, isLoading: authLoading } = useAuthContext();
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
          <div className="text-sm text-gray-600">
            総申請数: {teams.length}件 | 承認済み:{" "}
            {teams.filter(t => t.isApproved).length}件 | 未承認:{" "}
            {teams.filter(t => !t.isApproved).length}件
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
