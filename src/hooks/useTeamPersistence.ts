import { useCallback, useMemo } from "react";
import { useToast } from "@/components/providers/notification-provider";
import { useAuthContext } from "@/hooks/useAuthContext";
import { FirestoreTeamRepository } from "@/repositories/firestore/team-repository";
import { localTeamRepository } from "@/repositories/local/team-repository";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { executeSyncWithTimeout } from "@/lib/utils/sync-utils";


export function useTeamPersistence() {
    const { showSuccess, showError } = useToast();
    const { orgId, activeTournamentId } = useAuthContext();
    const isOnline = useOnlineStatus();

    const firestoreRepository = useMemo(() => new FirestoreTeamRepository(), []);

    // 単一チームの同期処理
    const syncTeamToCloud = useCallback(async (teamId: string, options?: { showSuccessToast?: boolean }) => {
        if (!orgId || !activeTournamentId) return;

        // オフラインなら同期しない
        if (!isOnline) {
            showError("オフラインのためクラウド同期はされていません");
            return;
        }

        const syncTask = async () => {
            const localTeam = await localTeamRepository.getById(teamId);
            if (!localTeam) return;

            if (localTeam._deleted) {
                // 論理削除されている場合はFirestoreから削除
                await firestoreRepository.delete(orgId, activeTournamentId, teamId);
                // 同期完了としてマーク
                await localTeamRepository.markAsSynced(teamId);
            } else {
                // 作成または更新
                await firestoreRepository.create(orgId, activeTournamentId, localTeam);
                await localTeamRepository.markAsSynced(teamId);
            }
        };


        try {
            await executeSyncWithTimeout(syncTask, {
                onSuccess: () => {
                    if (options?.showSuccessToast) {
                        showSuccess("クラウドに同期しました");
                    }
                },
                onError: (error) => {
                    console.error(`Failed to sync team ${teamId}:`, error);
                    showError("クラウドに同期失敗しました。この端末でのみ変更が反映されています。");
                },
            });
        } catch {
            // エラーは onError で処理済み
        }

    }, [orgId, activeTournamentId, firestoreRepository, showError, showSuccess, isOnline]);

    // 全ての未同期チームの同期処理
    const syncAllTeams = useCallback(async () => {
        if (!orgId || !activeTournamentId) return;

        try {
            const unsyncedTeams = await localTeamRepository.getUnsynced(orgId, activeTournamentId);
            if (unsyncedTeams.length === 0) return;

            let successCount = 0;
            let failCount = 0;

            await Promise.all(unsyncedTeams.map(async (team) => {
                try {
                    await syncTeamToCloud(team.teamId);
                    successCount++;
                } catch {
                    failCount++;
                }
            }));

            if (successCount > 0) {
                showSuccess(`${successCount}件のデータをクラウドと同期しました`);
            }
            if (failCount > 0) {
                showError(`${failCount}件の同期に失敗しました`);
            }
        } catch (error) {
            console.error("Sync all teams failed:", error);
        }
    }, [orgId, activeTournamentId, syncTeamToCloud, showSuccess, showError]);

    return {
        syncTeamToCloud,
        syncAllTeams,
    };
}
