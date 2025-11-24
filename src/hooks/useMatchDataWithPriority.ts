import { useEffect, useMemo } from "react";
import { useMonitorStore } from "@/store/use-monitor-store";
import { useMatch } from "@/queries/use-matches";
import { useTeamMatch } from "@/queries/use-team-matches";
import { useTournament } from "@/queries/use-tournaments";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useMatchGroups } from "@/queries/use-match-groups";
import { useTeams } from "@/queries/use-teams";
import { createPlayerDirectory, resolveMatchPlayer } from "@/lib/utils/player-directory";
import { findRoundName } from "@/lib/utils/round-utils";

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

    const { orgId, activeTournamentId, activeTournamentType, isLoading: authLoading } = useAuthContext();

    // ストア優先: ストアに現在の matchId のデータがあれば Firebase クエリは無効化する
    const hasStoreData = Boolean(storeMatchId && storeMatchId === matchId && storeTournamentName);

    // 大会種別に基づいて取得するデータを制御
    // typeが未設定の場合は両方取得を試みる（互換性のため）
    const shouldFetchIndividual = !hasStoreData && (activeTournamentType === "individual" || !activeTournamentType);
    const shouldFetchTeam = !hasStoreData && (activeTournamentType === "team" || !activeTournamentType);

    // 個人戦データを取得
    const { data: individualMatch, isLoading: individualLoading, error: individualError } = useMatch(shouldFetchIndividual ? matchId : null);

    // 団体戦データを取得
    const { data: teamMatch, isLoading: teamLoading, error: teamError } = useTeamMatch(shouldFetchTeam ? matchId : null);

    const { data: tournament, isLoading: tournamentLoading, error: tournamentError } = useTournament(
        hasStoreData ? null : orgId,
        hasStoreData ? null : activeTournamentId
    );

    const { data: matchGroups = [] } = useMatchGroups();
    const { data: teams = [] } = useTeams();
    const playerDirectory = useMemo(() => createPlayerDirectory(teams), [teams]);

    // どちらかのデータがあればOK
    const match = individualMatch || teamMatch;

    // ロード状態の判定:
    // データが見つかればロード完了とみなす
    // データが見つかっていない場合、取得対象のいずれかがロード中ならロード中とみなす
    const isMatchLoading = !match && ((shouldFetchIndividual && individualLoading) || (shouldFetchTeam && teamLoading));

    // ストア優先のため、ストアデータがある場合は fetch 側の loading/error を無視する
    const isLoading = authLoading || (!hasStoreData && (isMatchLoading || tournamentLoading));

    // エラー判定
    const hasError = !hasStoreData && !match && !isMatchLoading && (
        (shouldFetchIndividual && individualError) ||
        (shouldFetchTeam && teamError) ||
        tournamentError ||
        (!individualMatch && !teamMatch)
    );

    useEffect(() => {
        // ストアに既にデータがある場合は初期化不要
        if (hasStoreData) return;

        // Firebase から取得したデータで初期化（フォールバック）
        if (match && tournament) {
            let courtId = "";
            if ("courtId" in match) {
                courtId = match.courtId;
            } else if ("matchGroupId" in match) {
                const group = matchGroups.find(g => g.matchGroupId === match.matchGroupId);
                courtId = group?.courtId || "";
            }

            const court = tournament.courts.find(
                (c: { courtId: string; courtName: string }) => c.courtId === courtId
            );
            const courtName = court ? court.courtName : courtId;

            const resolvedPlayers = {
                playerA: resolveMatchPlayer(match.players.playerA, playerDirectory),
                playerB: resolveMatchPlayer(match.players.playerB, playerDirectory),
            };
            const roundName = findRoundName(match.roundId, tournament.rounds);

            initializeMatch(match, tournament.tournamentName, courtName, {
                resolvedPlayers,
                roundName,
            });
        }
    }, [hasStoreData, match, tournament, initializeMatch, matchGroups, playerDirectory]);

    return {
        isLoading,
        hasError: hasError ? (hasError instanceof Error ? hasError : true) : null,
        matchFound: hasStoreData || !!match,
    };
}
