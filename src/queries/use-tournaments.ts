import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Tournament } from "@/types/tournament.schema";
import { useLiveQuery } from "dexie-react-hooks";
import { localTournamentRepository } from "@/repositories/local/tournament-repository";
import { FirestoreTournamentRepository } from "@/repositories/firestore/tournament-repository";

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
 *
 * アーキテクチャ: Local First
 * 1. まずローカルDB (Dexie) からデータを即座に取得して表示します (useLiveQuery)。
 * 2. バックグラウンドでAPIから最新データを取得し (useQuery)、ローカルDBを更新します。
 * 3. ローカルDBが更新されると、useLiveQuery が自動的に再描画をトリガーします。
 *
 * これにより、オフライン時でもデータが表示され、オンライン復帰時に自動的に同期されます。
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

            // Firestoreから直接取得
            const tournamentRepository = new FirestoreTournamentRepository();
            try {
                const tournaments = await tournamentRepository.listAll(orgId);

                // 未同期のローカル変更を取得
                const unsyncedLocalTournaments = await localTournamentRepository.getUnsynced(orgId);
                const unsyncedIds = new Set(unsyncedLocalTournaments.map(t => t.tournamentId));

                // ローカルDBを更新
                // 未同期の項目は上書きしないようにフィルタリング
                const localTournaments = tournaments
                    .filter((t: Tournament) => !unsyncedIds.has(t.tournamentId!))
                    .map((t: Tournament) => ({
                        ...t,
                        organizationId: orgId,
                        tournamentDate: t.tournamentDate ? new Date(t.tournamentDate) : new Date(),
                        createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
                        updatedAt: t.updatedAt ? new Date(t.updatedAt) : new Date(),
                        isSynced: true,
                    }));

                if (localTournaments.length > 0) {
                    await localTournamentRepository.bulkPut(localTournaments);
                }
                return tournaments;
            } catch (error) {
                console.error("Failed to sync tournaments:", error);
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
            tournamentId,
            tournamentData,
        }: {
            orgId: string;
            tournamentId: string;
            tournamentData: {
                tournamentName: string;
                tournamentDate: Date;
                tournamentDetail: string;
                location: string;
                defaultMatchTime: number;
                courts: { courtId: string; courtName: string }[];
                rounds: { roundId: string; roundName: string }[];
                tournamentType: "individual" | "team";
            };
        }) => {
            const now = new Date();
            const newTournament = {
                ...tournamentData,
                tournamentId,
                createdAt: now,
                updatedAt: now,
                // LocalTournamentに必要なプロパティを追加
                organizationId: orgId,
                isSynced: false,
            };

            await localTournamentRepository.create(orgId, newTournament);
            return newTournament;
        },
        onSuccess: (_, { orgId }) => {
            // 大会一覧キャッシュを無効化してリフレッシュ
            queryClient.invalidateQueries({
                queryKey: [...tournamentKeys.lists(), "organization", orgId],
            });
        },
        networkMode: "always",
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
            // 既存のデータを取得してマージする必要があるかもしれないが、
            // localTournamentRepository.update は Partial を受け取るのでそのまま渡す
            await localTournamentRepository.update(orgId, tournamentId, patch);

            // 更新後のデータを取得して返す
            const updated = await localTournamentRepository.getById(orgId, tournamentId);
            if (!updated) throw new Error("Updated tournament not found");
            return updated;
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
        networkMode: "always",
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
            await localTournamentRepository.delete(orgId, tournamentId);
        },
        onSuccess: (_, { orgId, tournamentId }) => {
            // 一覧キャッシュを無効化
            queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
            // 削除された大会の詳細キャッシュを削除
            queryClient.removeQueries({
                queryKey: tournamentKeys.detail(`${orgId}/${tournamentId}`),
            });
        },
        networkMode: "always",
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
