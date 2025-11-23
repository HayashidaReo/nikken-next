import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Tournament } from "@/types/tournament.schema";
import { useLiveQuery } from "dexie-react-hooks";
import { localTournamentRepository } from "@/repositories/local/tournament-repository";

/**
 * Query Keys for Tournament entities
 */
export const tournamentKeys = {
    all: ["tournaments"] as const,
    lists: () => [...tournamentKeys.all, "list"] as const,
    list: (filters: Record<string, unknown>) =>
        [...tournamentKeys.lists(), { filters }] as const,
    details: () => [...tournamentKeys.all, "detail"] as const,
    detail: (id: string) => [...tournamentKeys.details(), id] as const,
};

/**
 * 組織内の大会一覧を取得するQuery (Local First)
 */
export function useTournamentsByOrganization(orgId: string | null) {
    // 1. Local Data (Immediate)
    const localTournaments = useLiveQuery(
        () => (orgId ? localTournamentRepository.listByOrganization(orgId) : []),
        [orgId]
    );

    // 2. Remote Sync (Background)
    useQuery({
        queryKey: [...tournamentKeys.lists(), "organization", orgId, "sync"],
        queryFn: async () => {
            if (!orgId) return null;

            // タイムアウト付きでフェッチ (5秒)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            try {
                const response = await fetch(`/api/tournaments/${orgId}`, { signal: controller.signal });
                clearTimeout(timeoutId);

                if (!response.ok) {
                    // オフラインやサーバーエラーの場合は無視してローカルデータを使用
                    return null;
                }

                const data = await response.json();
                const tournaments = data.data || [];

                // ローカルDBを更新
                // APIから返ってくるISO文字列をDateに変換して保存
                const localTournaments = tournaments.map((t: Tournament) => ({
                    ...t,
                    organizationId: orgId,
                    tournamentDate: t.tournamentDate ? new Date(t.tournamentDate) : null,
                    createdAt: t.createdAt ? new Date(t.createdAt) : undefined,
                    updatedAt: t.updatedAt ? new Date(t.updatedAt) : undefined,
                }));

                await localTournamentRepository.bulkPut(localTournaments);
                return tournaments;
            } catch (e) {
                // タイムアウトやネットワークエラーは無視
                console.warn("Failed to sync tournaments:", e);
                return null;
            }
        },
        enabled: !!orgId,
        staleTime: 1000 * 60 * 5, // 5分間は再フェッチしない
        retry: 1,
    });

    return {
        data: localTournaments ?? [],
        isLoading: localTournaments === undefined,
        error: null as Error | null,
    };
}

/**
 * 特定の大会情報を取得するQuery (Local DB)
 */
export function useTournament(
    orgId: string | null,
    tournamentId: string | null
) {
    const tournament = useLiveQuery(async () => {
        if (!orgId || !tournamentId) return undefined;
        return await localTournamentRepository.getById(orgId, tournamentId);
    }, [orgId, tournamentId]);

    return {
        data: tournament,
        isLoading: tournament === undefined,
        error: null as Error | null
    };
}

/**
 * 組織内の大会作成のMutation
 */
export function useCreateTournament() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            orgId,
            tournamentData,
        }: {
            orgId: string;
            tournamentData: {
                tournamentName: string;
                tournamentDate: Date;
                tournamentDetail: string;
                location: string;
                defaultMatchTime: number;
                courts: { courtId: string; courtName: string }[];
            };
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

            const result = await response.json();

            // APIから返ってくるISO文字列をDateに変換
            if (result.data) {
                result.data = {
                    ...result.data,
                    tournamentDate: result.data.tournamentDate ? new Date(result.data.tournamentDate) : null,
                    createdAt: result.data.createdAt ? new Date(result.data.createdAt) : undefined,
                    updatedAt: result.data.updatedAt ? new Date(result.data.updatedAt) : undefined,
                };
            }

            return result;
        },
        onSuccess: (_, { orgId }) => {
            // 大会一覧キャッシュを無効化してリフレッシュ
            queryClient.invalidateQueries({
                queryKey: [...tournamentKeys.lists(), "organization", orgId],
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
        mutationFn: async ({
            orgId,
            tournamentId,
            patch,
        }: {
            orgId: string;
            tournamentId: string;
            patch: Partial<Tournament>;
        }) => {
            const response = await fetch(
                `/api/tournaments/${orgId}/${tournamentId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(patch),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "大会情報の更新に失敗しました");
            }

            return response.json();
        },
        onSuccess: (_, { orgId, tournamentId }) => {
            // 組織ベースの大会一覧キャッシュを無効化
            queryClient.invalidateQueries({
                queryKey: [...tournamentKeys.lists(), "organization", orgId],
            });
            // 更新された大会の詳細キャッシュも無効化（試合一覧画面などで使用）
            queryClient.invalidateQueries({
                queryKey: tournamentKeys.detail(`${orgId}/${tournamentId}`),
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
        mutationFn: async ({
            orgId,
            tournamentId,
        }: {
            orgId: string;
            tournamentId: string;
        }) => {
            const response = await fetch(
                `/api/tournaments/${orgId}/${tournamentId}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "大会の削除に失敗しました");
            }

            return response.json();
        },
        onSuccess: (_, { orgId, tournamentId }) => {
            // 一覧キャッシュを無効化
            queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
            // 削除された大会の詳細キャッシュを削除
            queryClient.removeQueries({
                queryKey: tournamentKeys.detail(`${orgId}/${tournamentId}`),
            });
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
                    Authorization: `Bearer ${token}`,
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
