import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLiveQuery } from "dexie-react-hooks";
import { localTeamMatchRepository } from "@/repositories/local/team-match-repository";
import { useAuthContext } from "@/hooks/useAuthContext";
import type { TeamMatchCreate } from "@/types/match.schema";

export const teamMatchKeys = {
    all: ["teamMatches"] as const,
    lists: (matchGroupId: string) => [...teamMatchKeys.all, "list", matchGroupId] as const,
    detail: (id: string) => [...teamMatchKeys.all, "detail", id] as const,
};

export function useTeamMatches(matchGroupId: string | null) {
    const { orgId, activeTournamentId } = useAuthContext();

    const matches = useLiveQuery(async () => {
        if (!orgId || !activeTournamentId || !matchGroupId) return [];
        return await localTeamMatchRepository.listAll(orgId, activeTournamentId, matchGroupId);
    }, [orgId, activeTournamentId, matchGroupId]);

    return {
        data: matches,
        isLoading: matches === undefined,
        error: null as Error | null
    };
}

export function useCreateTeamMatch() {
    const queryClient = useQueryClient();
    const { orgId, activeTournamentId } = useAuthContext();

    return useMutation({
        mutationFn: ({ matchGroupId, match }: { matchGroupId: string; match: TeamMatchCreate }) => {
            if (!orgId || !activeTournamentId) throw new Error("Org/Tournament ID required");
            return localTeamMatchRepository.create(orgId, activeTournamentId, matchGroupId, match);
        },
        onSuccess: (_, { matchGroupId }) => {
            queryClient.invalidateQueries({ queryKey: teamMatchKeys.lists(matchGroupId) });
        },
    });
}

export function useUpdateTeamMatch() {
    const queryClient = useQueryClient();
    const { orgId, activeTournamentId } = useAuthContext();

    return useMutation({
        mutationFn: ({ matchId, patch }: { matchGroupId: string; matchId: string; patch: Partial<TeamMatchCreate> }) => {
            if (!orgId || !activeTournamentId) throw new Error("Org/Tournament ID required");
            return localTeamMatchRepository.updateByMatchId(matchId, patch);
        },
        onSuccess: (_, { matchGroupId }) => {
            queryClient.invalidateQueries({ queryKey: teamMatchKeys.lists(matchGroupId) });
        },
    });
}

export function useDeleteTeamMatch() {
    const queryClient = useQueryClient();
    const { orgId, activeTournamentId } = useAuthContext();

    return useMutation({
        mutationFn: ({ matchId }: { matchGroupId: string; matchId: string }) => {
            if (!orgId || !activeTournamentId) throw new Error("Org/Tournament ID required");
            return localTeamMatchRepository.deleteByMatchId(matchId);
        },
        onSuccess: (_, { matchGroupId }) => {
            queryClient.invalidateQueries({ queryKey: teamMatchKeys.lists(matchGroupId) });
        },
    });
}

export function useTeamMatch(matchId: string | null | undefined) {
    const { orgId, activeTournamentId } = useAuthContext();

    const match = useLiveQuery(async () => {
        if (!matchId || !orgId || !activeTournamentId) return undefined;
        return await localTeamMatchRepository.getById(matchId);
    }, [matchId, orgId, activeTournamentId]);

    return {
        data: match,
        isLoading: match === undefined,
        error: null as Error | null
    };
}
