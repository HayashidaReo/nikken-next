import { useCallback, useMemo } from "react";
import { useToast } from "@/components/providers/notification-provider";
import { useAuthContext } from "@/hooks/useAuthContext";
import { FirestoreTournamentRepository } from "@/repositories/firestore/tournament-repository";
import { localTournamentRepository } from "@/repositories/local/tournament-repository";

import { useOnlineStatus } from "@/hooks/use-online-status";

export function useTournamentPersistence() {
    const { showSuccess, showError } = useToast();
    const { orgId } = useAuthContext();
    const isOnline = useOnlineStatus();

    const firestoreRepository = useMemo(() => new FirestoreTournamentRepository(), []);

    // 単一大会の同期処理
    const syncTournamentToCloud = useCallback(async (tournamentId: string, options?: { showSuccessToast?: boolean }) => {
        if (!orgId) return;

        // オフラインなら同期しない
        if (!isOnline) {
            showError("オフラインのためクラウド同期はされていません");
            return;
        }

        const syncTask = async () => {
            const localTournament = await localTournamentRepository.getById(orgId, tournamentId);
            if (!localTournament) return;

            if (localTournament._deleted) {
                // 論理削除されている場合はFirestoreから削除
                await firestoreRepository.delete(orgId, tournamentId);
                // 同期完了としてマーク
                await localTournamentRepository.markAsSynced(tournamentId);
            } else {
                // 作成または更新
                await firestoreRepository.create(orgId, localTournament);
                await localTournamentRepository.markAsSynced(tournamentId);
            }
        };

        try {
            // 10秒のタイムアウト
            await Promise.race([
                syncTask(),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 10000))
            ]);

            if (options?.showSuccessToast) {
                showSuccess("クラウドに同期しました");
            }
        } catch (error) {
            console.error(`Failed to sync tournament ${tournamentId}:`, error);
            showError("クラウドに同期失敗しました。この端末でのみ変更が反映されています。");
        }
    }, [orgId, firestoreRepository, showError, showSuccess, isOnline]);

    // 全ての未同期大会の同期処理
    const syncAllTournaments = useCallback(async () => {
        if (!orgId) return;

        try {
            const unsyncedTournaments = await localTournamentRepository.getUnsynced(orgId);
            if (unsyncedTournaments.length === 0) return;

            let successCount = 0;
            let failCount = 0;

            await Promise.all(unsyncedTournaments.map(async (tournament) => {
                try {
                    await syncTournamentToCloud(tournament.tournamentId);
                    successCount++;
                } catch {
                    failCount++;
                }
            }));

            if (successCount > 0) {
                showSuccess(`${successCount}件の大会データをクラウドと同期しました`);
            }
            if (failCount > 0) {
                showError(`${failCount}件の大会同期に失敗しました`);
            }
        } catch (error) {
            console.error("Sync all tournaments failed:", error);
        }
    }, [orgId, syncTournamentToCloud, showSuccess, showError]);

    return {
        syncTournamentToCloud,
        syncAllTournaments,
    };
}
