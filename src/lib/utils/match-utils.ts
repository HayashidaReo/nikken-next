import { SCORE_COLORS } from "@/lib/ui-constants";

export const getPlayerTextColor = (
    playerScore: number,
    opponentScore: number,
    isCompleted: boolean,
    winner: "playerA" | "playerB" | "draw" | "none" | null | undefined,
    isPlayerA: boolean
) => {
    if (!isCompleted) return SCORE_COLORS.unplayed;

    if (winner && winner !== "none") {
        if (winner === "draw") return SCORE_COLORS.draw;
        if (isPlayerA && winner === "playerA") return SCORE_COLORS.win;
        if (!isPlayerA && winner === "playerB") return SCORE_COLORS.win;
        return SCORE_COLORS.loss;
    }

    if (playerScore === 0 && opponentScore === 0) {
        return SCORE_COLORS.draw;
    }
    if (playerScore > opponentScore) return SCORE_COLORS.win;
    if (playerScore === opponentScore) return SCORE_COLORS.draw;
    return SCORE_COLORS.loss;
};
