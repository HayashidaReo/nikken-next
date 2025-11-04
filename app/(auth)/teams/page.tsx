"use client";

import { MainLayout } from "@/components/templates/main-layout";
import { TeamManagementCardList } from "@/components/organisms/team-management-card-list";
import { useTeams, useApproveTeam } from "@/queries/use-teams";
import { useAuthContext } from "@/hooks/useAuthContext";

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
      <MainLayout activeTab="teams">
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-600">チーム情報を読み込み中...</div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout activeTab="teams">
        <div className="flex justify-center items-center py-8">
          <div className="text-red-600">
            エラーが発生しました:{" "}
            {error instanceof Error ? error.message : "不明なエラー"}
          </div>
        </div>
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
