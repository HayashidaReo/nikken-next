import { useEffect } from "react";
import { useMonitorStore } from "@/store/use-monitor-store";
import { useResolvedMatchData } from "@/hooks/useResolvedMatchData";

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

    // ストア優先: ストアに現在の matchId のデータがあれば Firebase クエリは無効化する
    const hasStoreData = Boolean(storeMatchId && storeMatchId === matchId && storeTournamentName);

    // データ取得と解決ロジックを分離したフックを使用
    const {
        match,
        tournament,
        courtName,
        roundName,
        resolvedPlayers,
        isLoading,
        error
    } = useResolvedMatchData(matchId);

    // ストア優先のため、ストアデータがある場合は fetch 側の loading/error を無視する
    const effectiveIsLoading = !hasStoreData && isLoading;
    const effectiveHasError = !hasStoreData && error;

    useEffect(() => {
        // ストアに既にデータがある場合は初期化不要
        if (hasStoreData) return;

        // データがまだロード中の場合は初期化しない
        if (isLoading) return;

        // Firebase から取得したデータで初期化（フォールバック）
        if (match && tournament) {
            initializeMatch(match, tournament.tournamentName, courtName, {
                resolvedPlayers,
                roundName,
            });
        }
    }, [hasStoreData, match, tournament, initializeMatch, courtName, roundName, resolvedPlayers, isLoading]);

    return {
        isLoading: effectiveIsLoading,
        hasError: effectiveHasError ? (effectiveHasError instanceof Error ? effectiveHasError : true) : null,
        matchFound: hasStoreData || !!match,
    };
}
