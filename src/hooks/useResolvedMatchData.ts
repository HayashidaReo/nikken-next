import { useMemo } from "react";
import { useMatch } from "@/queries/use-matches";
import { useTeamMatch } from "@/queries/use-team-matches";
import { useTournament } from "@/queries/use-tournaments";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useMatchGroups } from "@/queries/use-match-groups";
import { useTeams } from "@/queries/use-teams";
import { createPlayerDirectory, resolveMatchPlayer } from "@/lib/utils/player-directory";
import { findRoundName } from "@/lib/utils/round-utils";
import { getTeamMatchRoundLabelById } from "@/lib/constants";
import type { Match, TeamMatch } from "@/types/match.schema";
import type { Tournament } from "@/types/tournament.schema";

export interface ResolvedMatchData {
    match: Match | TeamMatch | null | undefined;
    tournament: Tournament | null | undefined;
    courtName: string;
    roundName: string;
    resolvedPlayers: {
        playerA: ReturnType<typeof resolveMatchPlayer>;
        playerB: ReturnType<typeof resolveMatchPlayer>;
    };
    isLoading: boolean;
    error: unknown;
}

export function useResolvedMatchData(matchId: string): ResolvedMatchData {
    const { orgId, activeTournamentId, activeTournamentType, isLoading: authLoading } = useAuthContext();

    // 大会種別に基づいて取得するデータを制御
    // typeが未設定の場合は両方取得を試みる（互換性のため）
    const shouldFetchIndividual = activeTournamentType === "individual" || !activeTournamentType;
    const shouldFetchTeam = activeTournamentType === "team" || !activeTournamentType;

    // 個人戦データを取得
    const { data: individualMatch, isLoading: individualLoading, error: individualError } = useMatch(shouldFetchIndividual ? matchId : null);

    // 団体戦データを取得
    const { data: teamMatch, isLoading: teamLoading, error: teamError } = useTeamMatch(shouldFetchTeam ? matchId : null);

    const { data: tournament, isLoading: tournamentLoading, error: tournamentError } = useTournament(orgId, activeTournamentId);

    const { data: matchGroups = [], isLoading: matchGroupsLoading } = useMatchGroups();
    const { data: teams = [], isLoading: teamsLoading } = useTeams();
    const playerDirectory = useMemo(() => createPlayerDirectory(teams), [teams]);

    // どちらかのデータがあればOK
    const match = individualMatch || teamMatch;

    // ロード状態の判定
    const isMatchLoading = !match && ((shouldFetchIndividual && individualLoading) || (shouldFetchTeam && teamLoading));
    const isLoading = authLoading || isMatchLoading || tournamentLoading || matchGroupsLoading || teamsLoading;

    // エラー判定
    const error = !match && !isLoading ? (
        (shouldFetchIndividual && individualError) ||
        (shouldFetchTeam && teamError) ||
        tournamentError ||
        (!individualMatch && !teamMatch ? new Error("Match not found") : null)
    ) : null;

    const resolvedData = useMemo(() => {
        if (!match || !tournament) {
            return {
                courtName: "",
                roundName: "",
                resolvedPlayers: {
                    playerA: { name: "", teamName: "" },
                    playerB: { name: "", teamName: "" },
                } as unknown as { playerA: ReturnType<typeof resolveMatchPlayer>; playerB: ReturnType<typeof resolveMatchPlayer> },
            };
        }

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

        // 大会種別に応じてラウンド名を解決
        let roundName: string;
        if (activeTournamentType === "team" || teamMatch) {
            // 団体戦の場合はconstantsから取得
            roundName = getTeamMatchRoundLabelById(match.roundId) || match.roundId;
        } else {
            // 個人戦の場合はtournament.roundsから取得
            roundName = findRoundName(match.roundId, tournament.rounds);
        }

        return {
            courtName,
            roundName,
            resolvedPlayers,
        };
    }, [match, tournament, matchGroups, playerDirectory, activeTournamentType, teamMatch]);

    return {
        match,
        tournament,
        ...resolvedData,
        isLoading,
        error,
    };
}
