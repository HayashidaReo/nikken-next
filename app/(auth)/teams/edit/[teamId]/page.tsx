"use client";

import { useParams, useRouter } from "next/navigation";
import { TeamEditForm } from "@/components/organisms/team-edit-form";
import { useTeam, useUpdateTeam } from "@/queries/use-teams";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useToast } from "@/components/providers/notification-provider";
import { MainLayout } from "@/components/templates/main-layout";
import { LoadingIndicator } from "@/components/molecules/loading-indicator";
import { InfoDisplay } from "@/components/molecules/info-display";

export default function TeamEditPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.teamId as string;
  const { showSuccess, showError } = useToast();
  const { needsTournamentSelection } = useAuthContext();

  const { data: team, isLoading, error } = useTeam(teamId);
  const updateTeamMutation = useUpdateTeam();

  const handleSave = async (data: {
    teamName: string;
    representativeName: string;
    representativePhone: string;
    representativeEmail: string;
    isApproved: boolean;
    remarks: string;
    players: {
      playerId: string;
      lastName: string;
      firstName: string;
      displayName: string;
    }[];
  }) => {
    try {
      await updateTeamMutation.mutateAsync({
        teamId,
        patch: data,
      });

      showSuccess(`「${data.teamName}」の情報を更新しました`);
      router.push("/teams");
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : "チーム情報の更新に失敗しました"
      );
    }
  };

  const handleCancel = () => {
    router.push("/teams");
  };

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

  // ローディング状態
  if (isLoading) {
    return (
      <MainLayout activeTab="teams">
        <LoadingIndicator message="チーム情報を読み込み中..." size="lg" />
      </MainLayout>
    );
  }

  // エラー状態
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

  // チームが見つからない場合
  if (!team) {
    return (
      <MainLayout activeTab="teams">
        <InfoDisplay
          variant="destructive"
          title="チームが見つかりません"
          message="指定されたチームが見つかりませんでした。URL を確認してください。"
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout activeTab="teams">
      <div className="py-8 px-4">
        <TeamEditForm team={team} onSave={handleSave} onCancel={handleCancel} />
      </div>
    </MainLayout>
  );
}
