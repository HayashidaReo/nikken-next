import { useRouter } from "next/navigation";
import { useToast } from "@/components/providers/notification-provider";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { useDeleteTeam } from "@/queries/use-teams";
import { useMatchGroups } from "@/queries/use-match-groups";
import { useTeamPersistence } from "@/hooks/useTeamPersistence";
import { TeamDependencyService } from "@/domains/team/services/team-dependency-service";

/**
 * チーム削除のユースケースを扱うカスタムフック
 * バリデーション、確認ダイアログ、削除実行、クラウド同期、画面遷移を一括して管理
 */
export function useTeamDeletion() {
    const router = useRouter();
    const { showSuccess, showError } = useToast();

    // 依存データの取得
    // コンポーネントレベルでキャッシュが効いていることを前提
    const { data: matchGroups = [] } = useMatchGroups();

    // 削除操作
    const { mutateAsync: deleteTeam } = useDeleteTeam();
    const { syncTeamToCloud } = useTeamPersistence();

    // ダイアログ管理
    const confirmDialog = useConfirmDialog();

    /**
     * 削除リクエストを実行
     * 制約チェックを行い、問題なければ確認ダイアログを表示
     */
    const requestDelete = (teamId: string, teamName: string) => {
        try {
            // 1. ドメインルールによる検証
            TeamDependencyService.validateDeletion(teamId, matchGroups);

            // 2. 確認ダイアログの表示
            confirmDialog.openDialog({
                title: "チーム削除",
                message: `チーム「${teamName}」を削除しますか？\nこの操作は取り消せません。`,
                variant: "destructive",
                action: async () => {
                    try {
                        // 3. 削除実行
                        await deleteTeam(teamId);

                        // 4. クラウド同期 (削除情報の伝播)
                        // エラーになっても画面遷移は妨げない（非同期またはcatch）
                        // ここではawaitして確実に実行させる
                        try {
                            await syncTeamToCloud(teamId);
                        } catch (syncError) {
                            console.error("Sync failed after delete:", syncError);
                            // 同期失敗は警告程度でも良いかもしれないが、ここでは続行
                        }

                        showSuccess("チームを削除しました");
                        router.back();
                    } catch (error) {
                        console.error("Delete failed:", error);
                        showError(
                            error instanceof Error
                                ? error.message
                                : "チームの削除に失敗しました"
                        );
                    }
                },
            });
        } catch (error) {
            // バリデーションエラー等の表示
            showError(
                error instanceof Error ? error.message : "削除できません"
            );
        }
    };

    return {
        requestDelete,
        deleteConfirmDialog: confirmDialog, // ダイアログコンポーネントに渡す用
    };
}
