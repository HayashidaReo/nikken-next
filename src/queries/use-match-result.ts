import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FirestoreMatchRepository } from "@/repositories/firestore/match-repository";
import { matchKeys } from "./use-matches";
import type { Match } from "@/types/match.schema";

export interface SaveMatchResultRequest {
    matchId: string;
    organizationId: string;
    tournamentId: string;
    players: {
        playerA: {
            score: number;
            hansoku: number;
        };
        playerB: {
            score: number;
            hansoku: number;
        };
    };
}

/**
 * Match リポジトリのインスタンス
 */
const matchRepository = new FirestoreMatchRepository();

/**
 * 試合結果を保存するMutation
 * Firestore SDK を直接使用してオフライン対応
 */
export function useSaveMatchResult() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: SaveMatchResultRequest) => {
            const { matchId, organizationId, tournamentId, players } = request;

            // まず現在の試合データを取得
            const currentMatch = await matchRepository.getById(
                organizationId,
                tournamentId,
                matchId
            );

            if (!currentMatch) {
                throw new Error(`Match not found: ${matchId}`);
            }

            // Repository 経由で Firestore に直接書き込み
            // score と hansoku のみを更新
            const updatedMatch = await matchRepository.update(
                organizationId,
                tournamentId,
                matchId,
                {
                    players: {
                        playerA: {
                            ...currentMatch.players.playerA,
                            score: players.playerA.score,
                            hansoku: players.playerA.hansoku,
                        },
                        playerB: {
                            ...currentMatch.players.playerB,
                            score: players.playerB.score,
                            hansoku: players.playerB.hansoku,
                        },
                    },
                    isCompleted: true, // 試合結果保存時は完了フラグを立てる
                }
            );

            return updatedMatch;
        },
        onSuccess: (updatedMatch, variables) => {
            const { organizationId, tournamentId, matchId } = variables;

            // キャッシュを更新
            queryClient.setQueryData<Match>(
                matchKeys.detail(matchId),
                updatedMatch
            );

            // 一覧キャッシュを無効化
            queryClient.invalidateQueries({
                queryKey: matchKeys.list({ orgId: organizationId, tournamentId }),
            });

            // コート別・ラウンド別のキャッシュも無効化
            queryClient.invalidateQueries({
                queryKey: matchKeys.courtMatches(updatedMatch.courtId),
            });
            queryClient.invalidateQueries({
                queryKey: matchKeys.roundMatches(updatedMatch.round),
            });
        },
    });
}
