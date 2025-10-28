import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FirestoreTeamRepository } from "@/repositories/firestore/team-repository";
import type { Team, TeamCreate } from "@/types/team.schema";

/**
 * Team リポジトリのインスタンス（シングルトン）
 * 
 * 注意: このクエリは認証済みユーザー専用です
 * - 管理画面（チーム一覧、承認機能など）で使用
 * - 選手登録フォームでは API Route (/api/teams/register) を使用
 */
const teamRepository = new FirestoreTeamRepository();

/**
 * Query Keys for Team entities
 */
export const teamKeys = {
    all: ['teams'] as const,
    lists: () => [...teamKeys.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...teamKeys.lists(), { filters }] as const,
    details: () => [...teamKeys.all, 'detail'] as const,
    detail: (id: string) => [...teamKeys.details(), id] as const,
};

/**
 * 全てのチームを取得するQuery
 */
export function useTeams() {
    return useQuery({
        queryKey: teamKeys.lists(),
        queryFn: () => teamRepository.listAll(),
        staleTime: 5 * 60 * 1000, // 5分間はキャッシュを有効とする
    });
}

/**
 * 特定のチームを取得するQuery
 */
export function useTeam(teamId: string | null | undefined) {
    return useQuery({
        queryKey: teamKeys.detail(teamId || ''),
        queryFn: () => {
            if (!teamId) throw new Error('Team ID is required');
            return teamRepository.getById(teamId);
        },
        enabled: !!teamId, // teamIdがある場合のみクエリを実行
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * チーム作成のMutation
 */
export function useCreateTeam() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (newTeam: TeamCreate) => teamRepository.create(newTeam),
        onSuccess: (createdTeam) => {
            // 一覧キャッシュを無効化
            queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
            // 作成されたチームの詳細をキャッシュに追加
            queryClient.setQueryData(teamKeys.detail(createdTeam.teamId), createdTeam);
        },
    });
}

/**
 * チーム更新のMutation
 */
export function useUpdateTeam() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ teamId, patch }: { teamId: string; patch: Partial<Team> }) =>
            teamRepository.update(teamId, patch),
        onSuccess: (updatedTeam) => {
            // 一覧キャッシュを無効化
            queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
            // 更新されたチームの詳細をキャッシュに追加
            queryClient.setQueryData(teamKeys.detail(updatedTeam.teamId), updatedTeam);
        },
    });
}

/**
 * チーム削除のMutation
 */
export function useDeleteTeam() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (teamId: string) => teamRepository.delete(teamId),
        onSuccess: (_, deletedTeamId) => {
            // 一覧キャッシュを無効化
            queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
            // 削除されたチームの詳細キャッシュを削除
            queryClient.removeQueries({ queryKey: teamKeys.detail(deletedTeamId) });
        },
    });
}

/**
 * チーム承認状態変更のMutation（よく使われる操作）
 */
export function useApproveTeam() {
    const { mutate: updateTeam, ...mutation } = useUpdateTeam();

    return {
        ...mutation,
        mutate: (teamId: string, isApproved: boolean) => {
            updateTeam({ teamId, patch: { isApproved } });
        },
    };
}

/**
 * リアルタイム購読用のフック（オプション）
 * 使用例: チーム管理画面でリアルタイム更新が必要な場合
 */
export function useTeamsRealtime() {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: [...teamKeys.lists(), 'realtime'],
        queryFn: () => {
            return new Promise<Team[]>((resolve) => {
                // リアルタイム購読を開始
                const unsubscribe = teamRepository.listenAll((teams) => {
                    // キャッシュを更新
                    queryClient.setQueryData(teamKeys.lists(), teams);
                    resolve(teams);
                });

                // クリーンアップ関数を返す
                return () => unsubscribe();
            });
        },
        staleTime: Infinity, // リアルタイム更新なので常にフレッシュ
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
}