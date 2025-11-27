import { useCallback, useMemo } from "react";
import { useToast } from "@/components/providers/notification-provider";
import { useAuthContext } from "@/hooks/useAuthContext";
import { FirestoreMatchGroupRepository } from "@/repositories/firestore/match-group-repository";
import { FirestoreTeamMatchRepository } from "@/repositories/firestore/team-match-repository";
import { localMatchGroupRepository } from "@/repositories/local/match-group-repository";
import { localTeamMatchRepository } from "@/repositories/local/team-match-repository";
import { useOnlineStatus } from "@/hooks/use-online-status";

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
                await firestoreGroupRepository.delete(orgId, activeTournamentId, matchGroupId);
                await localMatchGroupRepository.hardDelete(matchGroupId);
            } else {
                await firestoreGroupRepository.update(orgId, activeTournamentId, matchGroupId, localGroup);
                await localMatchGroupRepository.update(matchGroupId, { isSynced: true });
            }
        };

        try {
            await Promise.race([
                syncTask(),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 10000))
            ]);

            if (options?.showSuccessToast) {
                showSuccess("クラウドに同期しました");
            }
        } catch (error) {
            console.error(`Failed to sync match group ${matchGroupId}:`, error);
            showError("クラウドに同期失敗しました");
        }
    }, [orgId, activeTournamentId, firestoreGroupRepository, showError, showSuccess, isOnline]);

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
                        await firestoreGroupRepository.delete(orgId, activeTournamentId, groupId);
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
            const result = await Promise.race([
                syncTask(),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 10000))
            ]) as { successCount: number, failCount: number };

            if (options?.showSuccessToast && result.successCount > 0) {
                showSuccess("クラウドに同期しました");
            }
            if (result.failCount > 0) {
                showError(`${result.failCount}件の同期に失敗しました`);
            }
        } catch (error) {
            console.error("Failed to sync match groups:", error);
            showError("クラウドへの同期に失敗しました");
        }
    }, [orgId, activeTournamentId, firestoreGroupRepository, showError, showSuccess, isOnline]);


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
            await Promise.race([
                syncTask(),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 10000))
            ]);

            if (options?.showSuccessToast) {
                showSuccess("クラウドに同期しました");
            }
        } catch (error) {
            console.error(`Failed to sync team match ${matchId}:`, error);
            showError("クラウドに同期失敗しました");
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
            const result = await Promise.race([
                syncTask(),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 10000))
            ]) as { successCount: number, failCount: number };

            if (options?.showSuccessToast && result.successCount > 0) {
                showSuccess("クラウドに同期しました");
            }
            if (result.failCount > 0) {
                showError(`${result.failCount}件の同期に失敗しました`);
            }
        } catch (error) {
            console.error("Failed to sync team matches:", error);
            showError("クラウドへの同期に失敗しました");
        }
    }, [orgId, activeTournamentId, firestoreTeamMatchRepository, showError, showSuccess, isOnline]);

    return {
        syncMatchGroupToCloud,
        syncMatchGroupsToCloud,
        syncTeamMatchToCloud,
        syncTeamMatchesToCloud,
    };
}
