import { useCallback, useMemo } from "react";
import { useToast } from "@/components/providers/notification-provider";
import { useAuthContext } from "@/hooks/useAuthContext";
import { FirestoreMatchRepository } from "@/repositories/firestore/match-repository";
import { localMatchRepository } from "@/repositories/local/match-repository";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { executeSyncWithTimeout } from "@/lib/utils/sync-utils";

export function useMatchPersistence() {
    const { showSuccess, showError } = useToast();
    const { orgId, activeTournamentId } = useAuthContext();
    const isOnline = useOnlineStatus();

    const firestoreRepository = useMemo(() => new FirestoreMatchRepository(), []);

    // 単一試合の同期処理
    const syncMatchToCloud = useCallback(async (matchId: string, options?: { showSuccessToast?: boolean }) => {
        if (!orgId || !activeTournamentId) return;

        // オフラインなら同期しない
        if (!isOnline) {
            showError("オフラインのためクラウド同期はされていません");
            return;
        }

        const syncTask = async () => {
            const localMatch = await localMatchRepository.getById(matchId);
            if (!localMatch) return;

            if (localMatch._deleted) {
                // 論理削除されている場合はFirestoreから削除
                await firestoreRepository.delete(orgId, activeTournamentId, matchId);
                // 物理削除してクリーンアップ
                await localMatchRepository.hardDelete(matchId);
            } else {
                // 作成または更新
                await firestoreRepository.save(orgId, activeTournamentId, localMatch);
                // 同期完了としてマーク
                await localMatchRepository.markAsSynced(matchId);
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
                    console.error(`Failed to sync match ${matchId}:`, error);
                    showError("クラウドに同期失敗しました。この端末でのみ変更が反映されています。");
                },
            });
        } catch {
            // エラーは onError で処理済み
        }
    }, [orgId, activeTournamentId, firestoreRepository, showError, showSuccess, isOnline]);

    // 複数試合の同期処理
    const syncMatchesToCloud = useCallback(async (matchIds: string[], options?: { showSuccessToast?: boolean }) => {
        if (!orgId || !activeTournamentId) return;

        // オフラインなら同期しない
        if (!isOnline) {
            showError("オフラインのためクラウド同期はされていません");
            return;
        }

        const syncTask = async () => {
            let successCount = 0;
            let failCount = 0;

            await Promise.all(matchIds.map(async (matchId) => {
                try {
                    const localMatch = await localMatchRepository.getById(matchId);
                    if (!localMatch) return;

                    if (localMatch._deleted) {
                        await firestoreRepository.delete(orgId, activeTournamentId, matchId);
                        await localMatchRepository.hardDelete(matchId);
                    } else {
                        await firestoreRepository.save(orgId, activeTournamentId, localMatch);
                        await localMatchRepository.markAsSynced(matchId);
                    }
                    successCount++;
                } catch (e) {
                    console.error(`Failed to sync match ${matchId}:`, e);
                    failCount++;
                }
            }));

            return { successCount, failCount };
        };

        try {
            const result = await executeSyncWithTimeout(syncTask, {
                onSuccess: () => {
                    // 成功時の処理は下のresult判定で実施
                },
                onError: (error) => {
                    console.error("Failed to sync matches:", error);
                    showError("クラウドへの同期に失敗しました");
                },
            }) as { successCount: number, failCount: number };

            if (options?.showSuccessToast && result.successCount > 0) {
                showSuccess("クラウドに同期しました");
            }
            if (result.failCount > 0) {
                showError(`${result.failCount}件の同期に失敗しました`);
            }
        } catch {
            // エラーは onError で処理済み
        }
    }, [orgId, activeTournamentId, firestoreRepository, showError, showSuccess, isOnline]);

    // 全ての未同期試合の同期処理
    const syncAllMatches = useCallback(async () => {
        if (!orgId || !activeTournamentId) return;

        try {
            const unsyncedMatches = await localMatchRepository.getUnsynced(orgId, activeTournamentId);
            if (unsyncedMatches.length === 0) return;

            const matchIds = unsyncedMatches.map(m => m.matchId).filter((id): id is string => !!id);
            await syncMatchesToCloud(matchIds, { showSuccessToast: true });
        } catch (error) {
            console.error("Sync all matches failed:", error);
        }
    }, [orgId, activeTournamentId, syncMatchesToCloud]);

    return {
        syncMatchToCloud,
        syncMatchesToCloud,
        syncAllMatches,
    };
}
