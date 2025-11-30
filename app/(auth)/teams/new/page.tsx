"use client";

import { useRouter } from "next/navigation";
import { TeamForm } from "@/components/organisms/team-form";
import { useCreateTeam } from "@/queries/use-teams";
import { useTeamPersistence } from "@/hooks/useTeamPersistence";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useToast } from "@/components/providers/notification-provider";
import { MainLayout } from "@/components/templates/main-layout";
import { InfoDisplay } from "@/components/molecules/info-display";

export default function TeamCreatePage() {
    const router = useRouter();
    const { showSuccess, showError } = useToast();
    const { needsTournamentSelection } = useAuthContext();

    const createTeamMutation = useCreateTeam();
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
        }[];
    }) => {
        try {
            // 1. IndexedDBに保存
            const newTeam = await createTeamMutation.mutateAsync({
                ...data,
                isApproved: true, // アプリ内からの登録は自動承認
            });

            showSuccess(`「${data.teamName}」を登録しました`);

            // 2. バックグラウンドでクラウド同期を試行
            // setTimeoutを使用してメインスレッドをブロックせずに実行
            setTimeout(() => {
                syncTeamToCloud(newTeam.teamId, { showSuccessToast: true }).catch((err) => {
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
                    : "チームの登録に失敗しました"
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

    return (
        <MainLayout activeTab="teams">
            <div className="py-8 px-4">
                <TeamForm onSave={handleSave} onCancel={handleCancel} />
            </div>
        </MainLayout>
    );
}
