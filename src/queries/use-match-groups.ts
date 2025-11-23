import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLiveQuery } from "dexie-react-hooks";
import { FirestoreMatchGroupRepository } from "@/repositories/firestore/match-group-repository";
import { localMatchGroupRepository } from "@/repositories/local/match-group-repository";
import { useAuthContext } from "@/hooks/useAuthContext";
import type { MatchGroupCreate } from "@/types/match.schema";

const matchGroupRepository = new FirestoreMatchGroupRepository();

export const matchGroupKeys = {
    all: ["matchGroups"] as const,
    lists: () => [...matchGroupKeys.all, "list"] as const,
    detail: (id: string) => [...matchGroupKeys.all, "detail", id] as const,
};

export function useMatchGroups() {
    const { orgId, activeTournamentId } = useAuthContext();

    const matchGroups = useLiveQuery(async () => {
        if (!orgId || !activeTournamentId) return [];
        return await localMatchGroupRepository.listAll(orgId, activeTournamentId);
    }, [orgId, activeTournamentId]);

    return {
        data: matchGroups,
        isLoading: matchGroups === undefined,
        error: null as Error | null
    };
}

export function useCreateMatchGroup() {
    const queryClient = useQueryClient();
    const { orgId, activeTournamentId } = useAuthContext();

    return useMutation({
        mutationFn: (newMatchGroup: MatchGroupCreate) => {
            if (!orgId || !activeTournamentId) throw new Error("Org/Tournament ID required");
            return matchGroupRepository.create(orgId, activeTournamentId, newMatchGroup);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: matchGroupKeys.lists() });
        },
    });
}

export function useUpdateMatchGroup() {
    const queryClient = useQueryClient();
    const { orgId, activeTournamentId } = useAuthContext();

    return useMutation({
        mutationFn: ({ matchGroupId, patch }: { matchGroupId: string; patch: Partial<MatchGroupCreate> }) => {
            if (!orgId || !activeTournamentId) throw new Error("Org/Tournament ID required");
            return matchGroupRepository.update(orgId, activeTournamentId, matchGroupId, patch);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: matchGroupKeys.lists() });
        },
    });
}

export function useDeleteMatchGroup() {
    const queryClient = useQueryClient();
    const { orgId, activeTournamentId } = useAuthContext();

    return useMutation({
        mutationFn: (matchGroupId: string) => {
            if (!orgId || !activeTournamentId) throw new Error("Org/Tournament ID required");
            return matchGroupRepository.delete(orgId, activeTournamentId, matchGroupId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: matchGroupKeys.lists() });
        },
    });
}
