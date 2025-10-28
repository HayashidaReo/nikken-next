import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FirestoreTournamentRepository } from "@/repositories/firestore/tournament-repository";
import type { Tournament, TournamentCreate } from "@/types/tournament.schema";

/**
 * Tournament リポジトリのインスタンス（シングルトン）
 */
const tournamentRepository = new FirestoreTournamentRepository();

/**
 * Query Keys for Tournament entities
 */
export const tournamentKeys = {
    all: ['tournaments'] as const,
    lists: () => [...tournamentKeys.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...tournamentKeys.lists(), { filters }] as const,
    details: () => [...tournamentKeys.all, 'detail'] as const,
    detail: (id: string) => [...tournamentKeys.details(), id] as const,
};

/**
 * 全ての大会を取得するQuery
 */
export function useTournaments() {
    return useQuery({
        queryKey: tournamentKeys.lists(),
        queryFn: () => tournamentRepository.listAll(),
        staleTime: 5 * 60 * 1000, // 5分間はキャッシュを有効とする
    });
}

/**
 * 特定の大会を取得するQuery
 */
export function useTournament(tournamentId: string | null | undefined) {
    return useQuery({
        queryKey: tournamentKeys.detail(tournamentId || ''),
        queryFn: () => {
            if (!tournamentId) throw new Error('Tournament ID is required');
            return tournamentRepository.getById(tournamentId);
        },
        enabled: !!tournamentId, // tournamentIdがある場合のみクエリを実行
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * 大会作成のMutation
 */
export function useCreateTournament() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (newTournament: TournamentCreate) => tournamentRepository.create(newTournament),
        onSuccess: (createdTournament: Tournament) => {
            // 一覧キャッシュを無効化
            queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
            // 作成された大会の詳細をキャッシュに追加
            if (createdTournament.tournamentId) {
                queryClient.setQueryData(tournamentKeys.detail(createdTournament.tournamentId), createdTournament);
            }
        },
    });
}

/**
 * 大会更新のMutation
 */
export function useUpdateTournament() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ tournamentId, patch }: { tournamentId: string; patch: Partial<Tournament> }) =>
            tournamentRepository.update(tournamentId, patch),
        onSuccess: (updatedTournament: Tournament) => {
            // 一覧キャッシュを無効化
            queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
            // 更新された大会の詳細をキャッシュに追加
            if (updatedTournament.tournamentId) {
                queryClient.setQueryData(tournamentKeys.detail(updatedTournament.tournamentId), updatedTournament);
            }
        },
    });
}

/**
 * 大会削除のMutation
 */
export function useDeleteTournament() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (tournamentId: string) => tournamentRepository.delete(tournamentId),
        onSuccess: (_, deletedTournamentId) => {
            // 一覧キャッシュを無効化
            queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
            // 削除された大会の詳細キャッシュを削除
            queryClient.removeQueries({ queryKey: tournamentKeys.detail(deletedTournamentId) });
        },
    });
}