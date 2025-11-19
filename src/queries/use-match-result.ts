import { useMutation } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/lib/constants";

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
 * 試合結果を保存するMutation
 */
export function useSaveMatchResult() {
    return useMutation({
        mutationFn: async (request: SaveMatchResultRequest) => {
            const { matchId, ...body } = request;

            const response = await fetch(API_ENDPOINTS.MATCH_UPDATE(matchId), {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to save match result");
            }

            return response.json();
        },
    });
}
