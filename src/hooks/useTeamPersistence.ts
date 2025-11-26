import { useCallback, useMemo } from "react";
import { useToast } from "@/components/providers/notification-provider";
import { useAuthContext } from "@/hooks/useAuthContext";
import { FirestoreTeamRepository } from "@/repositories/firestore/team-repository";
import { localTeamRepository } from "@/repositories/local/team-repository";
import type { LocalTeam } from "@/lib/db";
import type { Team } from "@/types/team.schema";

interface SaveResult {
    success: boolean;
    teamId: string;
}

export function useTeamPersistence() {
    const { showSuccess, showError } = useToast();
    const { orgId, activeTournamentId } = useAuthContext();

    const teamRepository = useMemo(() => new FirestoreTeamRepository(), []);

    // ローカル保存処理
    const saveToLocal = useCallback(async (
        team: Team
    ): Promise<SaveResult> => {
        if (!orgId || !activeTournamentId) {
            throw new Error("組織IDまたは大会IDが設定されていません");
        }

        try {
            const localTeam: LocalTeam = {
                ...team,
                organizationId: orgId,
                tournamentId: activeTournamentId,
                isSynced: false,
            };

            await localTeamRepository.put(localTeam);
            showSuccess("端末に保存しました");

            return { success: true, teamId: team.teamId };
        } catch (error) {
            showError(error instanceof Error ? error.message : "保存に失敗しました");
            throw error;
        }
    }, [orgId, activeTournamentId, showSuccess, showError]);

    // クラウド同期処理
    const syncToCloud = useCallback(async (
        team: Team,
        onSuccess?: () => void,
        onError?: (error: unknown) => void
    ) => {
        if (!orgId || !activeTournamentId) {
            showError("組織IDまたは大会IDが設定されていません");
            return;
        }

        try {
            // Firestoreに送信
            await teamRepository.create(orgId, activeTournamentId, team);

            // ローカルの同期フラグを更新
            const localTeam = await localTeamRepository.getById(team.teamId);
            if (localTeam) {
                await localTeamRepository.update(team.teamId, { isSynced: true });
            }

            showSuccess("クラウドに同期しました");
            if (onSuccess) onSuccess();
        } catch (error) {
            showError(
                error instanceof Error
                    ? error.message
                    : "クラウド同期に失敗しました"
            );
            if (onError) onError(error);
        }
    }, [orgId, activeTournamentId, teamRepository, showSuccess, showError]);

    return {
        saveToLocal,
        syncToCloud,
    };
}
