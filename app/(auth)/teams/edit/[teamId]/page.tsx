"use client";

import { useParams, useRouter } from "next/navigation";
import { TeamEditForm } from "@/components/organisms/team-edit-form";
import { useTeam, useUpdateTeam } from "@/queries/use-teams";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useToast } from "@/components/providers/notification-provider";
import { MainLayout } from "@/components/templates/main-layout";

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
        <div className="flex justify-center items-center py-8">
          <div className="text-amber-600">
            大会を選択してください。ヘッダーの大会ドロップダウンから選択できます。
          </div>
        </div>
      </MainLayout>
    );
  }

  // ローディング状態
  if (isLoading) {
    return (
      <MainLayout activeTab="teams">
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-600">チーム情報を読み込み中...</div>
        </div>
      </MainLayout>
    );
  }

  // エラー状態
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

  // チームが見つからない場合
  if (!team) {
    return (
      <MainLayout activeTab="teams">
        <div className="flex justify-center items-center py-8">
          <div className="text-red-600">チームが見つかりません</div>
        </div>
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
