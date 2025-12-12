"use client";

import { useParams, useRouter } from "next/navigation";
import { TeamForm } from "@/components/organisms/team-form";
import { useTeam, useUpdateTeam, useDeleteTeam } from "@/queries/use-teams";
import { useMatchGroups } from "@/queries/use-match-groups";
import { useTeamPersistence } from "@/hooks/useTeamPersistence";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
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
  const { syncTeamToCloud } = useTeamPersistence();

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
      grade?: string;
    }[];
  }) => {
    try {
      // 1. IndexedDBに保存
      const updatedTeam = await updateTeamMutation.mutateAsync({
        teamId,
        patch: data,
      });

      showSuccess(`「${data.teamName}」の情報を更新しました`);

      // 2. バックグラウンドでクラウド同期を試行
      // setTimeoutを使用してメインスレッドをブロックせずに実行
      setTimeout(() => {
        syncTeamToCloud(updatedTeam.teamId, { showSuccessToast: true }).catch((err) => {
          console.error("Background sync failed:", err);
        });
      }, 0);

      // トースト表示のために少し待機してから遷移
      await new Promise(resolve => setTimeout(resolve, 500));
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
    router.back();
  };

  const { mutateAsync: deleteTeam } = useDeleteTeam();
  const { data: matchGroups = [] } = useMatchGroups();
  const deleteConfirmDialog = useConfirmDialog();

  const handleDelete = async () => {
    // 関連データのチェック
    const relatedMatchGroups = matchGroups.filter(
      (mg) => mg.teamAId === teamId || mg.teamBId === teamId
    );

    if (relatedMatchGroups.length > 0) {
      showError(
        "このチームは既に対戦カードに関連付けられているため削除できません。\n先に対戦カードを削除してください。"
      );
      return;
    }

    deleteConfirmDialog.openDialog({
      title: "チーム削除",
      message: `チーム「${team?.teamName}」を削除しますか？\nこの操作は取り消せません。`,
      variant: "destructive",
      action: async () => {
        try {
          await deleteTeam(teamId);
          await syncTeamToCloud(teamId);
          showSuccess("チームを削除しました");
          router.push("/teams");
        } catch (error) {
          showError(
            error instanceof Error
              ? error.message
              : "チームの削除に失敗しました"
          );
        }
      },
    });
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
        <TeamForm
          team={team}
          onSave={handleSave}
          onCancel={handleCancel}
          onDelete={handleDelete}
        />

        <ConfirmDialog
          isOpen={deleteConfirmDialog.isOpen}
          title={deleteConfirmDialog.title}
          message={deleteConfirmDialog.message}
          variant={deleteConfirmDialog.variant}
          confirmText="削除"
          cancelText="キャンセル"
          onConfirm={deleteConfirmDialog.action}
          onCancel={deleteConfirmDialog.closeDialog}
        />
      </div>
    </MainLayout>
  );
}
