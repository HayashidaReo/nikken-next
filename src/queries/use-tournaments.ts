import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Tournament } from "@/types/tournament.schema";

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
 * 組織内の大会一覧を取得するQuery
 */
export function useTournamentsByOrganization(orgId: string | null) {
    return useQuery({
        queryKey: [...tournamentKeys.lists(), 'organization', orgId],
        queryFn: async () => {
            if (!orgId) throw new Error('Organization ID is required');

            const response = await fetch(`/api/tournaments/${orgId}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '大会一覧の取得に失敗しました');
            }

            const data = await response.json();
            return data.data || [];
        },
        enabled: !!orgId,
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * 組織内の大会作成のMutation
 */
export function useCreateTournament() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ orgId, tournamentData }: {
            orgId: string;
            tournamentData: {
                tournamentName: string;
                tournamentDate: string;
                location: string;
                defaultMatchTime: number;
                courts: { courtId: string; courtName: string }[];
            }
        }) => {
            const response = await fetch(`/api/tournaments/${orgId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(tournamentData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "大会の作成に失敗しました");
            }

            return response.json();
        },
        onSuccess: (_, { orgId }) => {
            // 大会一覧キャッシュを無効化してリフレッシュ
            queryClient.invalidateQueries({
                queryKey: [...tournamentKeys.lists(), 'organization', orgId]
            });
        },
    });
}

/**
 * 組織内の大会更新のMutation
 */
export function useUpdateTournamentByOrganization() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ orgId, tournamentId, patch }: {
            orgId: string;
            tournamentId: string;
            patch: Partial<Tournament>
        }) => {
            const response = await fetch(`/api/tournaments/${orgId}/${tournamentId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(patch),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "大会情報の更新に失敗しました");
            }

            return response.json();
        },
        onSuccess: (_, { orgId }) => {
            // 組織ベースの大会一覧キャッシュを無効化
            queryClient.invalidateQueries({
                queryKey: [...tournamentKeys.lists(), 'organization', orgId]
            });
        },
    });
}

/**
 * 大会削除のMutation
 */
export function useDeleteTournament() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ orgId, tournamentId }: { orgId: string; tournamentId: string }) => {
            const response = await fetch(`/api/tournaments/${orgId}/${tournamentId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "大会の削除に失敗しました");
            }

            return response.json();
        },
        onSuccess: (_, { tournamentId }) => {
            // 一覧キャッシュを無効化
            queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
            // 削除された大会の詳細キャッシュを削除
            queryClient.removeQueries({ queryKey: tournamentKeys.detail(tournamentId) });
        },
    });
}

/**
 * 組織作成のMutation
 */
export function useCreateOrganization() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const auth = await import("firebase/auth");
            const currentUser = auth.getAuth().currentUser;
            if (!currentUser) {
                throw new Error("認証状態が無効です");
            }

            const token = await currentUser.getIdToken();
            const response = await fetch("/api/organizations/create-for-user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "組織作成に失敗しました");
            }

            return response.json();
        },
        onSuccess: () => {
            // 組織作成後、大会一覧を無効化してリフレッシュ
            queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
        },
    });
}