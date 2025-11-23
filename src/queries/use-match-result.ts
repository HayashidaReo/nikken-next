import { useMutation } from "@tanstack/react-query";
import { db } from "@/lib/db";

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
 * 試合結果を保存するMutation (Local DB)
 */
export function useSaveMatchResult() {
    return useMutation({
        mutationFn: async (request: SaveMatchResultRequest) => {
            const { matchId, players } = request;

            // ローカルDBから現在の試合データを取得
            const currentMatch = await db.matches.where("matchId").equals(matchId).first();

            if (!currentMatch) {
                throw new Error(`Match not found in local DB: ${matchId}`);
            }

            // 更新データを作成
            const updatedMatch = {
                ...currentMatch,
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
                isCompleted: true,
                updatedAt: new Date(),
                isSynced: false, // 未送信フラグを立てる
            };

            // ローカルDBを更新
            await db.matches.put(updatedMatch);

            return updatedMatch;
        },
    });
}
