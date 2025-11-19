import { useEffect } from "react";
import { useMonitorStore } from "@/store/use-monitor-store";
import { useMatch } from "@/queries/use-matches";
import { useTournament } from "@/queries/use-tournaments";
import { useAuthContext } from "@/hooks/useAuthContext";

interface UseMatchDataWithPriorityResult {
    isLoading: boolean;
    hasError: Error | null | boolean;
    matchFound: boolean;
}

export function useMatchDataWithPriority(matchId: string): UseMatchDataWithPriorityResult {
    const { initializeMatch } = useMonitorStore();
    // ストアに保存されているデータ（遷移元で initializeMatch が呼ばれた場合）
    const storeMatchId = useMonitorStore((s) => s.matchId);
    const storeTournamentName = useMonitorStore((s) => s.tournamentName);

    const { orgId, activeTournamentId, isLoading: authLoading } = useAuthContext();

    // ストア優先: ストアに現在の matchId のデータがあれば Firebase クエリは無効化する
    const hasStoreData = Boolean(storeMatchId && storeMatchId === matchId && storeTournamentName);

    // Firebase からデータを取得（ただしストアにあればクエリは無効化）
    const { data: match, isLoading: matchLoading, error: matchError } = useMatch(hasStoreData ? null : matchId);
    const { data: tournament, isLoading: tournamentLoading, error: tournamentError } = useTournament(
        hasStoreData ? null : orgId,
        hasStoreData ? null : activeTournamentId
    );

    // ストア優先のため、ストアデータがある場合は fetch 側の loading/error を無視する
    const isLoading = authLoading || (!hasStoreData && (matchLoading || tournamentLoading));
    const hasError = !hasStoreData && (matchError || tournamentError);

    useEffect(() => {
        // ストアに既にデータがある場合は初期化不要
        if (hasStoreData) return;

        // Firebase から取得したデータで初期化（フォールバック）
        if (match && tournament) {
            const court = tournament.courts.find(
                (c: { courtId: string; courtName: string }) => c.courtId === match.courtId
            );
            const courtName = court ? court.courtName : match.courtId;

            initializeMatch(match, tournament.tournamentName, courtName);
        }
    }, [hasStoreData, match, tournament, initializeMatch]);

    return {
        isLoading,
        hasError: hasError ? (hasError instanceof Error ? hasError : true) : null,
        matchFound: hasStoreData || !!match,
    };
}
