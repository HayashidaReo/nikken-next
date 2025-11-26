"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TeamForm } from "@/components/organisms/team-form";
import { useCreateTeam } from "@/queries/use-teams";
import { useTeamPersistence } from "@/hooks/useTeamPersistence";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useToast } from "@/components/providers/notification-provider";
import { MainLayout } from "@/components/templates/main-layout";
import { InfoDisplay } from "@/components/molecules/info-display";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import type { Team } from "@/types/team.schema";

export default function TeamCreatePage() {
    const router = useRouter();
    const { showSuccess, showError } = useToast();
    const { needsTournamentSelection } = useAuthContext();

    const createTeamMutation = useCreateTeam();
    const { syncToCloud } = useTeamPersistence();

    const [showSyncDialog, setShowSyncDialog] = useState(false);
    const [savedTeam, setSavedTeam] = useState<Team | null>(null);

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
            const newTeam = await createTeamMutation.mutateAsync(data);

            showSuccess(`「${data.teamName}」を登録しました`);

            // 保存したチーム情報を保持してダイアログを表示
            setSavedTeam(newTeam);
            setShowSyncDialog(true);
        } catch (error) {
            showError(
                error instanceof Error
                    ? error.message
                    : "チームの登録に失敗しました"
            );
        }
    };

    const handleSyncConfirm = async () => {
        if (savedTeam) {
            await syncToCloud(savedTeam);
        }
        setShowSyncDialog(false);
        router.push("/teams");
    };

    const handleSyncCancel = () => {
        setShowSyncDialog(false);
        router.push("/teams");
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

                <ConfirmDialog
                    isOpen={showSyncDialog}
                    onCancel={handleSyncCancel}
                    onConfirm={handleSyncConfirm}
                    title="クラウド同期"
                    message="今の変更をネットワークを経由して全ての端末にも反映させますか？"
                    confirmText="はい"
                    cancelText="いいえ"
                />
            </div>
        </MainLayout>
    );
}
