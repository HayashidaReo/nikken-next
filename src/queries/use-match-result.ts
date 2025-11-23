import { useMutation } from "@tanstack/react-query";
import { localMatchRepository } from "@/repositories/local/match-repository";
import { localTeamMatchRepository } from "@/repositories/local/team-match-repository";
import { LocalMatch, LocalTeamMatch } from "@/lib/db";

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
 * 個人戦の試合結果を保存するMutation (Local DB)
 */
export function useSaveIndividualMatchResult() {
    return useMutation({
        mutationFn: async (request: SaveMatchResultRequest) => {
            const { matchId, players } = request;

            const currentMatch = await localMatchRepository.getById(matchId);

            if (!currentMatch) {
                throw new Error(`Individual Match not found in local DB: ${matchId}`);
            }

            const updatedMatch: LocalMatch = {
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
                isSynced: false,
            };

            await localMatchRepository.put(updatedMatch);
            return updatedMatch;
        },
    });
}

/**
 * 団体戦（個人）の試合結果を保存するMutation (Local DB)
 */
export function useSaveTeamMatchResult() {
    return useMutation({
        mutationFn: async (request: SaveMatchResultRequest) => {
            const { matchId, players } = request;

            const currentMatch = await localTeamMatchRepository.getById(matchId);

            if (!currentMatch) {
                throw new Error(`Team Match not found in local DB: ${matchId}`);
            }

            const updatedMatch: LocalTeamMatch = {
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
                isSynced: false,
            };

            await localTeamMatchRepository.put(updatedMatch);
            return updatedMatch;
        },
    });
}

