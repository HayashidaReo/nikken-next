import { useCallback, useMemo } from "react";
import { useToast } from "@/components/providers/notification-provider";
import { useAuthContext } from "@/hooks/useAuthContext";
import { FirestoreMatchGroupRepository } from "@/repositories/firestore/match-group-repository";
import { FirestoreTeamMatchRepository } from "@/repositories/firestore/team-match-repository";
import { localMatchGroupRepository } from "@/repositories/local/match-group-repository";
import { localTeamMatchRepository } from "@/repositories/local/team-match-repository";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { executeSyncWithTimeout } from "@/lib/utils/sync-utils";

export function useMatchGroupPersistence() {
    const { showSuccess, showError } = useToast();
    const { orgId, activeTournamentId } = useAuthContext();
    const isOnline = useOnlineStatus();

    const firestoreGroupRepository = useMemo(() => new FirestoreMatchGroupRepository(), []);
    const firestoreTeamMatchRepository = useMemo(() => new FirestoreTeamMatchRepository(), []);

    // MatchGroupの同期
    const syncMatchGroupToCloud = useCallback(async (matchGroupId: string, options?: { showSuccessToast?: boolean }) => {
        if (!orgId || !activeTournamentId) return;

        if (!isOnline) {
            showError("オフラインのためクラウド同期はされていません");
            return;
        }

        const syncTask = async () => {
            const localGroup = await localMatchGroupRepository.getById(matchGroupId);
            if (!localGroup) return;

            if (localGroup._deleted) {
                // サブコレクション（teamMatches）を先に削除
                await firestoreTeamMatchRepository.deleteAllInGroup(orgId, activeTournamentId, matchGroupId);
                // 親ドキュメント（matchGroup）を削除
                await firestoreGroupRepository.delete(orgId, activeTournamentId, matchGroupId);
                // ローカルデータを物理削除（teamMatchesも連動して削除されるようにLocalMatchGroupRepository.hardDeleteを修正済み）
                await localMatchGroupRepository.hardDelete(matchGroupId);
            } else {
                await firestoreGroupRepository.update(orgId, activeTournamentId, matchGroupId, localGroup);
                await localMatchGroupRepository.update(matchGroupId, { isSynced: true });
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
                    console.error(`Failed to sync match group ${matchGroupId}:`, error);
                    showError("クラウドに同期失敗しました");
                },
            });
        } catch {
            // エラーは onError で処理済み
        }
    }, [orgId, activeTournamentId, isOnline, showError, firestoreTeamMatchRepository, firestoreGroupRepository, showSuccess]);

    // 複数MatchGroupの同期
    const syncMatchGroupsToCloud = useCallback(async (matchGroupIds: string[], options?: { showSuccessToast?: boolean }) => {
        if (!orgId || !activeTournamentId) return;

        if (!isOnline) {
            showError("オフラインのためクラウド同期はされていません");
            return;
        }

        const syncTask = async () => {
            let successCount = 0;
            let failCount = 0;

            await Promise.all(matchGroupIds.map(async (groupId) => {
                try {
                    const localGroup = await localMatchGroupRepository.getById(groupId);
                    if (!localGroup) return;

                    if (localGroup._deleted) {
                        // サブコレクション（teamMatches）を先に削除
                        await firestoreTeamMatchRepository.deleteAllInGroup(orgId, activeTournamentId, groupId);
                        // 親ドキュメント（matchGroup）を削除
                        await firestoreGroupRepository.delete(orgId, activeTournamentId, groupId);
                        // ローカルデータを物理削除
                        await localMatchGroupRepository.hardDelete(groupId);
                    } else {
                        await firestoreGroupRepository.update(orgId, activeTournamentId, groupId, localGroup);
                        await localMatchGroupRepository.update(groupId, { isSynced: true });
                    }
                    successCount++;
                } catch (e) {
                    console.error(`Failed to sync match group ${groupId}:`, e);
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
                    console.error("Failed to sync match groups:", error);
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
    }, [orgId, activeTournamentId, firestoreGroupRepository, firestoreTeamMatchRepository, showError, showSuccess, isOnline]);


    // TeamMatchの同期
    const syncTeamMatchToCloud = useCallback(async (matchGroupId: string, matchId: string, options?: { showSuccessToast?: boolean }) => {
        if (!orgId || !activeTournamentId) return;

        if (!isOnline) {
            showError("オフラインのためクラウド同期はされていません");
            return;
        }

        const syncTask = async () => {
            const localMatch = await localTeamMatchRepository.getById(matchId);
            if (!localMatch) return;

            if (localMatch._deleted) {
                await firestoreTeamMatchRepository.delete(orgId, activeTournamentId, matchGroupId, matchId);
                await localTeamMatchRepository.hardDeleteByMatchId(matchId);
            } else {
                await firestoreTeamMatchRepository.update(orgId, activeTournamentId, matchGroupId, matchId, localMatch);
                await localTeamMatchRepository.updateByMatchId(matchId, { isSynced: true });
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
                    console.error(`Failed to sync team match ${matchId}:`, error);
                    showError("クラウドに同期失敗しました");
                },
            });
        } catch {
            // エラーは onError で処理済み
        }
    }, [orgId, activeTournamentId, firestoreTeamMatchRepository, showError, showSuccess, isOnline]);

    // 複数TeamMatchの同期
    const syncTeamMatchesToCloud = useCallback(async (matchGroupId: string, matchIds: string[], options?: { showSuccessToast?: boolean }) => {
        if (!orgId || !activeTournamentId) return;

        if (!isOnline) {
            showError("オフラインのためクラウド同期はされていません");
            return;
        }

        const syncTask = async () => {
            let successCount = 0;
            let failCount = 0;

            await Promise.all(matchIds.map(async (matchId) => {
                try {
                    const localMatch = await localTeamMatchRepository.getById(matchId);
                    if (!localMatch) return;

                    if (localMatch._deleted) {
                        await firestoreTeamMatchRepository.delete(orgId, activeTournamentId, matchGroupId, matchId);
                        await localTeamMatchRepository.hardDeleteByMatchId(matchId);
                    } else {
                        await firestoreTeamMatchRepository.update(orgId, activeTournamentId, matchGroupId, matchId, localMatch);
                        await localTeamMatchRepository.updateByMatchId(matchId, { isSynced: true });
                    }
                    successCount++;
                } catch (e) {
                    console.error(`Failed to sync team match ${matchId}:`, e);
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
                    console.error("Failed to sync team matches:", error);
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
    }, [orgId, activeTournamentId, firestoreTeamMatchRepository, showError, showSuccess, isOnline]);

    return {
        syncMatchGroupToCloud,
        syncMatchGroupsToCloud,
        syncTeamMatchToCloud,
        syncTeamMatchesToCloud,
    };
}
