import { useState, useCallback } from "react";
import { useAuthStore } from "@/store/use-auth-store";
import { useActiveTournament } from "@/store/use-active-tournament-store";
import { useToast } from "@/components/providers/notification-provider";
import { syncService } from "@/services/sync-service";
import { useLiveQuery } from "dexie-react-hooks";
import { LocalMatch, LocalMatchGroup, LocalTeamMatch, LocalTeam, LocalTournament } from "@/lib/db";
import { useQueryClient } from "@tanstack/react-query";
import { tournamentKeys } from "@/queries/use-tournaments";
import { useOnlineStatus } from "@/hooks/use-online-status";

export interface UnsyncedData {
    matches: LocalMatch[];
    matchGroups: LocalMatchGroup[];
    teamMatches: LocalTeamMatch[];
    teams: LocalTeam[];
    tournaments: LocalTournament[];
}

export function useSyncActions() {
    const { user } = useAuthStore();
    const { activeTournamentId } = useActiveTournament();
    const { showSuccess, showError, showInfo } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const queryClient = useQueryClient();

    const unsyncedCount = useLiveQuery(async () => {
        if (!user?.uid || !activeTournamentId) return 0;
        return await syncService.getUnsyncedCount(user.uid, activeTournamentId);
    }, [user?.uid, activeTournamentId]);

    const handleFetchFromCloud = useCallback(async () => {
        if (!user?.uid || !activeTournamentId) {
            showError("大会が選択されていません");
            return;
        }

        try {
            setIsLoading(true);
            await syncService.downloadTournamentData(user.uid, activeTournamentId);
            showSuccess("クラウドからデータを取得しました");
        } catch (error) {
            console.error(error);
            showError(error instanceof Error ? error.message : "データの取得に失敗しました");
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [user?.uid, activeTournamentId, showError, showSuccess]);

    const handleSendToCloud = useCallback(async (): Promise<UnsyncedData | null> => {
        if (!user?.uid || !activeTournamentId) {
            showError("大会が選択されていません");
            return null;
        }

        try {
            setIsLoading(true);
            const data = await syncService.getUnsyncedData(user.uid, activeTournamentId);
            const totalCount = data.matches.length + data.matchGroups.length + data.teamMatches.length + data.teams.length + data.tournaments.length;

            if (totalCount === 0) {
                showInfo("送信するデータはありませんでした");
                return null;
            }

            return data;
        } catch (error) {
            console.error(error);
            showError("データの取得に失敗しました");
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [user?.uid, activeTournamentId, showError, showInfo]);

    const handleUploadResults = useCallback(async (): Promise<number> => {
        if (!user?.uid || !activeTournamentId) return 0;

        try {
            setIsLoading(true);
            const count = await syncService.uploadResults(user.uid, activeTournamentId);
            showSuccess(`${count}件のデータを送信しました`);
            return count;
        } catch (error) {
            console.error(error);
            showError(error instanceof Error ? error.message : "送信に失敗しました");
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [user?.uid, activeTournamentId, showError, showSuccess]);

    const isOnline = useOnlineStatus();

    const handleClearLocalData = useCallback(async () => {
        try {
            setIsLoading(true);
            await syncService.clearLocalData();
            // 大会一覧を再取得して、大会選択ができる状態に戻す（オンライン時のみ）
            if (isOnline) {
                await queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
            }
            showSuccess("端末内のデータを初期化しました");
        } catch (error) {
            console.error(error);
            showError("初期化に失敗しました");
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [showError, showSuccess, queryClient, isOnline]);

    return {
        unsyncedCount,
        isLoading,
        handleFetchFromCloud,
        handleSendToCloud,
        handleUploadResults,
        handleClearLocalData,
    };
}
