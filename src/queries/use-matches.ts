import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FirestoreMatchRepository } from "@/repositories/firestore/match-repository";
import { useAuthContext } from "@/hooks/useAuthContext";
import type { Match, MatchCreate } from "@/types/match.schema";

/**
 * Match リポジトリのインスタンス（シングルトン）
 *
 * 注意: このクエリは認証済みユーザー専用です
 * - 管理画面（試合一覧、組み合わせ設定など）で使用
 */
const matchRepository = new FirestoreMatchRepository();

/**
 * Query Keys for Match entities
 */
export const matchKeys = {
    all: ["matches"] as const,
    lists: () => [...matchKeys.all, "list"] as const,
    list: (filters: Record<string, unknown>) =>
        [...matchKeys.lists(), { filters }] as const,
    details: () => [...matchKeys.all, "detail"] as const,
    detail: (id: string) => [...matchKeys.details(), id] as const,
    courtMatches: (courtId: string) => [...matchKeys.all, "court", courtId] as const,
    roundMatches: (round: string) => [...matchKeys.all, "round", round] as const,
    playerMatches: (playerId: string) => [...matchKeys.all, "player", playerId] as const,
    teamMatches: (teamId: string) => [...matchKeys.all, "team", teamId] as const,
};

/**
 * 全ての試合を取得するQuery
 * 認証コンテキストから組織・大会IDを自動取得
 */
export function useMatches() {
    const { orgId, activeTournamentId, isReady } = useAuthContext();

    return useQuery({
        queryKey: matchKeys.list({ orgId, tournamentId: activeTournamentId }),
        queryFn: () => {
            if (!orgId || !activeTournamentId) {
                throw new Error("Organization ID and Tournament ID are required");
            }
            return matchRepository.listAll(orgId, activeTournamentId);
        },
        enabled: Boolean(isReady && orgId && activeTournamentId), // 認証・組織・大会が揃った場合のみ実行
        staleTime: 5 * 60 * 1000, // 5分間はキャッシュを有効とする
    });
}

/**
 * 特定の試合を取得するQuery
 */
export function useMatch(matchId: string | null | undefined) {
    const { orgId, activeTournamentId, isReady } = useAuthContext();

    return useQuery({
        queryKey: matchKeys.detail(matchId || ""),
        queryFn: () => {
            if (!matchId || !orgId || !activeTournamentId) {
                throw new Error("Match ID, Organization ID and Tournament ID are required");
            }
            return matchRepository.getById(orgId, activeTournamentId, matchId);
        },
        enabled: Boolean(isReady && matchId && orgId && activeTournamentId), // 全て揃った場合のみクエリを実行
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * 特定のコートの試合を取得するQuery
 */
export function useMatchesByCourtId(courtId: string | null | undefined) {
    const { orgId, activeTournamentId, isReady } = useAuthContext();

    return useQuery({
        queryKey: matchKeys.courtMatches(courtId || ""),
        queryFn: () => {
            if (!courtId || !orgId || !activeTournamentId) {
                throw new Error("Court ID, Organization ID and Tournament ID are required");
            }
            return matchRepository.listByCourtId(orgId, activeTournamentId, courtId);
        },
        enabled: Boolean(isReady && courtId && orgId && activeTournamentId),
        staleTime: 3 * 60 * 1000, // 3分間はキャッシュを有効とする
    });
}

/**
 * 特定のラウンドの試合を取得するQuery
 */
export function useMatchesByRound(round: string | null | undefined) {
    const { orgId, activeTournamentId, isReady } = useAuthContext();

    return useQuery({
        queryKey: matchKeys.roundMatches(round || ""),
        queryFn: () => {
            if (!round || !orgId || !activeTournamentId) {
                throw new Error("Round, Organization ID and Tournament ID are required");
            }
            return matchRepository.listByRound(orgId, activeTournamentId, round);
        },
        enabled: Boolean(isReady && round && orgId && activeTournamentId),
        staleTime: 3 * 60 * 1000,
    });
}

/**
 * 特定の選手が関わる試合を取得するQuery
 */
export function useMatchesByPlayerId(playerId: string | null | undefined) {
    const { orgId, activeTournamentId, isReady } = useAuthContext();

    return useQuery({
        queryKey: matchKeys.playerMatches(playerId || ""),
        queryFn: () => {
            if (!playerId || !orgId || !activeTournamentId) {
                throw new Error("Player ID, Organization ID and Tournament ID are required");
            }
            return matchRepository.listByPlayerId(orgId, activeTournamentId, playerId);
        },
        enabled: Boolean(isReady && playerId && orgId && activeTournamentId),
        staleTime: 3 * 60 * 1000,
    });
}

/**
 * 特定のチームが関わる試合を取得するQuery
 */
export function useMatchesByTeamId(teamId: string | null | undefined) {
    const { orgId, activeTournamentId, isReady } = useAuthContext();

    return useQuery({
        queryKey: matchKeys.teamMatches(teamId || ""),
        queryFn: () => {
            if (!teamId || !orgId || !activeTournamentId) {
                throw new Error("Team ID, Organization ID and Tournament ID are required");
            }
            return matchRepository.listByTeamId(orgId, activeTournamentId, teamId);
        },
        enabled: Boolean(isReady && teamId && orgId && activeTournamentId),
        staleTime: 3 * 60 * 1000,
    });
}

/**
 * 単一試合作成のMutation
 */
export function useCreateMatch() {
    const queryClient = useQueryClient();
    const { orgId, activeTournamentId } = useAuthContext();

    return useMutation({
        mutationFn: (newMatch: MatchCreate) => {
            if (!orgId || !activeTournamentId) {
                throw new Error("Organization ID and Tournament ID are required");
            }
            return matchRepository.create(orgId, activeTournamentId, newMatch);
        },
        onSuccess: createdMatch => {
            // 一覧キャッシュを無効化
            queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
            // 作成された試合の詳細をキャッシュに追加
            queryClient.setQueryData(
                matchKeys.detail(createdMatch.matchId!),
                createdMatch
            );
            // 関連する条件検索のキャッシュも無効化
            queryClient.invalidateQueries({ queryKey: matchKeys.courtMatches(createdMatch.courtId) });
            queryClient.invalidateQueries({ queryKey: matchKeys.roundMatches(createdMatch.round) });
        },
    });
}
export function useCreateMatches() {
    const queryClient = useQueryClient();
    const { orgId, activeTournamentId } = useAuthContext();

    return useMutation({
        mutationFn: (newMatches: MatchCreate[]) => {
            if (!orgId || !activeTournamentId) {
                throw new Error("Organization ID and Tournament ID are required");
            }
            return matchRepository.createMultiple(orgId, activeTournamentId, newMatches);
        },
        onSuccess: createdMatches => {
            // 全ての一覧キャッシュを無効化
            queryClient.invalidateQueries({ queryKey: matchKeys.lists() });

            // 作成された各試合の詳細をキャッシュに追加
            createdMatches.forEach(match => {
                queryClient.setQueryData(
                    matchKeys.detail(match.matchId!),
                    match
                );
            });

            // 関連する条件検索のキャッシュも無効化
            const courtIds = [...new Set(createdMatches.map(m => m.courtId))];
            const rounds = [...new Set(createdMatches.map(m => m.round))];

            courtIds.forEach(courtId => {
                queryClient.invalidateQueries({ queryKey: matchKeys.courtMatches(courtId) });
            });

            rounds.forEach(round => {
                queryClient.invalidateQueries({ queryKey: matchKeys.roundMatches(round) });
            });
        },
    });
}

/**
 * 試合更新のMutation（Transaction版で競合を回避）
 * 複数端末での同時編集に対応
 */
export function useUpdateMatch() {
    const queryClient = useQueryClient();
    const { orgId, activeTournamentId } = useAuthContext();

    return useMutation({
        mutationFn: ({ matchId, patch }: { matchId: string; patch: Partial<Match> }) => {
            if (!orgId || !activeTournamentId) {
                throw new Error("Organization ID and Tournament ID are required");
            }
            return matchRepository.update(orgId, activeTournamentId, matchId, patch);
        },
        onSuccess: updatedMatch => {
            // 一覧キャッシュを無効化
            queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
            // 更新された試合の詳細をキャッシュに追加
            queryClient.setQueryData(
                matchKeys.detail(updatedMatch.matchId!),
                updatedMatch
            );
            // 関連する条件検索のキャッシュも無効化
            queryClient.invalidateQueries({ queryKey: matchKeys.courtMatches(updatedMatch.courtId) });
            queryClient.invalidateQueries({ queryKey: matchKeys.roundMatches(updatedMatch.round) });
        },
    });
}

/**
 * 単一試合削除のMutation
 */
export function useDeleteMatch() {
    const queryClient = useQueryClient();
    const { orgId, activeTournamentId } = useAuthContext();

    return useMutation({
        mutationFn: (matchId: string) => {
            if (!orgId || !activeTournamentId) {
                throw new Error("Organization ID and Tournament ID are required");
            }
            return matchRepository.delete(orgId, activeTournamentId, matchId);
        },
        onSuccess: (_, deletedMatchId) => {
            // 一覧キャッシュを無効化
            queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
            // 削除された試合の詳細キャッシュを削除
            queryClient.removeQueries({ queryKey: matchKeys.detail(deletedMatchId) });
            // 条件検索のキャッシュも無効化
            queryClient.invalidateQueries({ queryKey: matchKeys.all });
        },
    });
}

/**
 * 複数試合一括削除のMutation
 */
export function useDeleteMatches() {
    const queryClient = useQueryClient();
    const { orgId, activeTournamentId } = useAuthContext();

    return useMutation({
        mutationFn: (matchIds: string[]) => {
            if (!orgId || !activeTournamentId) {
                throw new Error("Organization ID and Tournament ID are required");
            }
            return matchRepository.deleteMultiple(orgId, activeTournamentId, matchIds);
        },
        onSuccess: (_, deletedMatchIds) => {
            // 一覧キャッシュを無効化
            queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
            // 削除された試合の詳細キャッシュを削除
            deletedMatchIds.forEach(matchId => {
                queryClient.removeQueries({ queryKey: matchKeys.detail(matchId) });
            });
            // 全ての条件検索のキャッシュも無効化
            queryClient.invalidateQueries({ queryKey: matchKeys.all });
        },
    });
}

/**
 * リアルタイム購読用のフック（オプション）
 * 使用例: 試合一覧画面やモニター操作画面でリアルタイム更新が必要な場合
 */
export function useMatchesRealtime() {
    const queryClient = useQueryClient();
    const { orgId, activeTournamentId, isReady } = useAuthContext();

    const [data, setData] = useState<Match[] | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!isReady || !orgId || !activeTournamentId) {
            // useEffect 内で同期的に setState を実行すると
            // 複数回の同期レンダリングや ESLint の警告が発生する場合があるため、
            // ここでは setTimeout によって更新を遅延させて安全に初期化しています。
            setTimeout(() => {
                setData(undefined);
                setIsLoading(false);
                setError(null);
            }, 0);
            return;
        }

        // 同様に、同期的な state 更新による連続レンダリングや副作用の発生を避けるため、
        // isLoading と error の更新は setTimeout によって非同期に行っています。
        setTimeout(() => {
            setIsLoading(true);
            setError(null);
        }, 0);

        const listKey = matchKeys.list({ orgId, tournamentId: activeTournamentId });
        const realtimeKey = [...matchKeys.lists(), "realtime", { orgId, tournamentId: activeTournamentId }];

        const unsubscribe = matchRepository.listenAll(orgId, activeTournamentId, (matches: Match[]) => {
            try {
                setData(matches);
                setIsLoading(false);
                // update both realtime and list caches for compatibility
                queryClient.setQueryData(realtimeKey, matches);
                queryClient.setQueryData(listKey, matches);
            } catch (e) {
                setError(e instanceof Error ? e : new Error("Unknown error"));
            }
        });

        return () => {
            try {
                unsubscribe();
            } catch (e) {
                console.warn("Failed to unsubscribe matches realtime listener:", e);
            }
        };
    }, [isReady, orgId, activeTournamentId, queryClient]);

    return {
        data,
        isLoading,
        error,
    };
}

/**
 * 特定の試合のリアルタイム購読用のフック
 * 使用例: モニター操作画面で特定の試合のリアルタイム更新が必要な場合
 */
export function useMatchRealtime(matchId: string | null | undefined) {
    const queryClient = useQueryClient();
    const { orgId, activeTournamentId, isReady } = useAuthContext();

    return useQuery({
        queryKey: [...matchKeys.detail(matchId || ""), "realtime"],
        queryFn: () => {
            if (!matchId || !orgId || !activeTournamentId) {
                throw new Error("Match ID, Organization ID and Tournament ID are required");
            }

            return new Promise<Match | null>(resolve => {
                // リアルタイム購読を開始
                const unsubscribe = matchRepository.listenById(orgId, activeTournamentId, matchId, (match: Match | null) => {
                    // キャッシュを更新
                    if (match) {
                        queryClient.setQueryData(matchKeys.detail(matchId), match);
                    }
                    resolve(match);
                });

                // クリーンアップ関数を返す
                return () => unsubscribe();
            });
        },
        enabled: Boolean(isReady && matchId && orgId && activeTournamentId),
        staleTime: Infinity, // リアルタイム更新なので常にフレッシュ
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
}