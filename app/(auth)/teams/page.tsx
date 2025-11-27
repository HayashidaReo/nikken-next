"use client";

import Link from "next/link";
import { MainLayout } from "@/components/templates/main-layout";
import { TeamManagementCardList } from "@/components/organisms/team-management-card-list";
import { ShareMenu } from "@/components/molecules/share-menu";
import { Button } from "@/components/atoms/button";
import { Plus } from "lucide-react";
import { TeamStatsSummary } from "@/components/molecules/team-stats-summary";
import { useTeams, useApproveTeam } from "@/queries/use-teams";
import { useAuthContext } from "@/hooks/useAuthContext";
import { LoadingIndicator } from "@/components/molecules/loading-indicator";
import { InfoDisplay } from "@/components/molecules/info-display";
import { useTeamPersistence } from "@/hooks/useTeamPersistence";
import { useToast } from "@/components/providers/notification-provider";

export default function TeamsPage() {
  const { needsTournamentSelection, isLoading: authLoading, orgId, activeTournamentId } = useAuthContext();
  const { data: teams = [], isLoading: teamsLoading, error } = useTeams();
  const { syncTeamToCloud } = useTeamPersistence();
  const approveTeamMutation = useApproveTeam();
  const { showError } = useToast();

  const handleApprovalChange = async (teamId: string, isApproved: boolean) => {
    const team = teams.find(t => t.teamId === teamId);
    if (!team) return;

    try {
      // 1. IndexedDBに保存
      approveTeamMutation.mutate(teamId, isApproved);

      // 2. バックグラウンドでクラウド同期を試行
      // setTimeoutを使用してメインスレッドをブロックせずに実行
      setTimeout(() => {
        syncTeamToCloud(teamId, { showSuccessToast: true }).catch((err) => {
          console.error("Background sync failed:", err);
        });
      }, 0);
    } catch (error) {
      console.error("Failed to update team approval:", error);
      showError("チームの承認状態の更新に失敗しました");
    }
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
              <div className="flex items-center gap-2">
                <Link href="/teams/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    追加
                  </Button>
                </Link>
                <ShareMenu
                  itemName="チーム・選手管理ページ"
                  sharePath={`/teams-form/${orgId}/${activeTournamentId}`}
                />
              </div>
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
