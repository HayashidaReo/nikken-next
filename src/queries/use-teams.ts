import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FirestoreTeamRepository } from "@/repositories/firestore/team-repository";
import { useAuthContext } from "@/hooks/useAuthContext";
import type { Team, TeamCreate } from "@/types/team.schema";
import type { TeamFormData } from "@/types/team-form.schema";

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
  all: ["teams"] as const,
  lists: () => [...teamKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...teamKeys.lists(), { filters }] as const,
  details: () => [...teamKeys.all, "detail"] as const,
  detail: (id: string) => [...teamKeys.details(), id] as const,
};

/**
 * 全てのチームを取得するQuery
 * 認証コンテキストから組織・大会IDを自動取得
 */
export function useTeams() {
  const { orgId, activeTournamentId, isReady } = useAuthContext();

  return useQuery({
    queryKey: teamKeys.list({ orgId, tournamentId: activeTournamentId }),
    queryFn: () => {
      if (!orgId || !activeTournamentId) {
        throw new Error("Organization ID and Tournament ID are required");
      }
      return teamRepository.listAll(orgId, activeTournamentId);
    },
    enabled: Boolean(isReady && orgId && activeTournamentId), // 認証・組織・大会が揃った場合のみ実行
    staleTime: 5 * 60 * 1000, // 5分間はキャッシュを有効とする
  });
}

/**
 * 特定のチームを取得するQuery
 */
export function useTeam(teamId: string | null | undefined) {
  const { orgId, activeTournamentId, isReady } = useAuthContext();

  return useQuery({
    queryKey: teamKeys.detail(teamId || ""),
    queryFn: () => {
      if (!teamId || !orgId || !activeTournamentId) {
        throw new Error("Team ID, Organization ID and Tournament ID are required");
      }
      return teamRepository.getById(orgId, activeTournamentId, teamId);
    },
    enabled: Boolean(isReady && teamId && orgId && activeTournamentId), // 全て揃った場合のみクエリを実行
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * チーム作成のMutation
 */
export function useCreateTeam() {
  const queryClient = useQueryClient();
  const { orgId, activeTournamentId } = useAuthContext();

  return useMutation({
    mutationFn: (newTeam: TeamCreate) => {
      if (!orgId || !activeTournamentId) {
        throw new Error("Organization ID and Tournament ID are required");
      }
      return teamRepository.create(orgId, activeTournamentId, newTeam);
    },
    onSuccess: createdTeam => {
      // 一覧キャッシュを無効化
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      // 作成されたチームの詳細をキャッシュに追加
      queryClient.setQueryData(
        teamKeys.detail(createdTeam.teamId),
        createdTeam
      );
    },
  });
}

/**
 * チーム更新のMutation
 */
export function useUpdateTeam() {
  const queryClient = useQueryClient();
  const { orgId, activeTournamentId } = useAuthContext();

  return useMutation({
    mutationFn: ({ teamId, patch }: { teamId: string; patch: Partial<Team> }) => {
      if (!orgId || !activeTournamentId) {
        throw new Error("Organization ID and Tournament ID are required");
      }
      return teamRepository.update(orgId, activeTournamentId, teamId, patch);
    },
    onSuccess: updatedTeam => {
      // 一覧キャッシュを無効化
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      // 更新されたチームの詳細をキャッシュに追加
      queryClient.setQueryData(
        teamKeys.detail(updatedTeam.teamId),
        updatedTeam
      );
    },
  });
}

/**
 * チーム削除のMutation
 */
export function useDeleteTeam() {
  const queryClient = useQueryClient();
  const { orgId, activeTournamentId } = useAuthContext();

  return useMutation({
    mutationFn: (teamId: string) => {
      if (!orgId || !activeTournamentId) {
        throw new Error("Organization ID and Tournament ID are required");
      }
      return teamRepository.delete(orgId, activeTournamentId, teamId);
    },
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
 * チーム登録用のMutation（API Route経由）
 * 認証なしで使用可能（公開フォーム用）
 */
function useRegisterTeamBase(orgId?: string, tournamentId?: string) {
  return useMutation({
    mutationFn: async (formData: TeamFormData) => {
      const payload =
        orgId && tournamentId ? { ...formData, orgId, tournamentId } : formData;
      const response = await fetch("/api/teams/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details || errorData.error || "チーム登録に失敗しました"
        );
      }

      return response.json();
    },
  });
}

export function useRegisterTeam() {
  return useRegisterTeamBase();
}

/**
 * チーム登録用のMutation（組織ID・大会IDパラメータ付き）
 * 認証なしで使用可能（公開フォーム用）
 */
export function useRegisterTeamWithParams(orgId: string, tournamentId: string) {
  return useRegisterTeamBase(orgId, tournamentId);
}

/**
 * リアルタイム購読用のフック（オプション）
 * 使用例: チーム管理画面でリアルタイム更新が必要な場合
 */
export function useTeamsRealtime() {
  const queryClient = useQueryClient();
  const { orgId, activeTournamentId, isReady } = useAuthContext();

  return useQuery({
    queryKey: [...teamKeys.lists(), "realtime", { orgId, tournamentId: activeTournamentId }],
    queryFn: () => {
      if (!orgId || !activeTournamentId) {
        throw new Error("Organization ID and Tournament ID are required");
      }

      return new Promise<Team[]>(resolve => {
        // リアルタイム購読を開始
        const unsubscribe = teamRepository.listenAll(orgId, activeTournamentId, (teams: Team[]) => {
          // キャッシュを更新
          queryClient.setQueryData(teamKeys.list({ orgId, tournamentId: activeTournamentId }), teams);
          resolve(teams);
        });

        // クリーンアップ関数を返す
        return () => unsubscribe();
      });
    },
    enabled: Boolean(isReady && orgId && activeTournamentId),
    staleTime: Infinity, // リアルタイム更新なので常にフレッシュ
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
