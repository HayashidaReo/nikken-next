import { useState } from "react";
import type { Match, WinReason } from "@/types/match.schema";
import { localMatchRepository } from "@/repositories/local/match-repository";

interface UseMatchEditFormProps {
    match: Match;
    isOpen: boolean;
    onClose: () => void;
}

interface MatchEditFormState {
    winner: "playerA" | "playerB" | "draw" | "none" | null;
    winReason: WinReason | null;
    playerAScore: number;
    playerBScore: number;
    playerAHansoku: number | null;
    playerBHansoku: number | null;
    showResetConfirm: boolean;
}

export function useMatchEditForm({ match, isOpen, onClose }: UseMatchEditFormProps) {
    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
    const [state, setState] = useState<MatchEditFormState>({
        winner: match.winner,
        winReason: match.winReason,
        playerAScore: match.players.playerA.score,
        playerBScore: match.players.playerB.score,
        playerAHansoku: match.players.playerA.hansoku,
        playerBHansoku: match.players.playerB.hansoku,
        showResetConfirm: false,
    });

    if (isOpen !== prevIsOpen) {
        setPrevIsOpen(isOpen);
        if (isOpen) {
            setState({
                winner: match.winner,
                winReason: match.winReason,
                playerAScore: match.players.playerA.score,
                playerBScore: match.players.playerB.score,
                playerAHansoku: match.players.playerA.hansoku,
                playerBHansoku: match.players.playerB.hansoku,
                showResetConfirm: false,
            });
        }
    }

    const handleSave = async () => {
        if (!match.matchId) return;

        await localMatchRepository.update(match.matchId, {
            players: {
                playerA: {
                    ...match.players.playerA,
                    score: state.playerAScore,
                    hansoku: state.playerAHansoku ?? 0,
                },
                playerB: {
                    ...match.players.playerB,
                    score: state.playerBScore,
                    hansoku: state.playerBHansoku ?? 0,
                },
            },
            winner: state.winner || "none",
            winReason: state.winReason || "none",
            isCompleted: true,
            isSynced: false,
        });
        onClose();
    };

    const handleResetClick = () => {
        setState(prev => ({ ...prev, showResetConfirm: true }));
    };

    const executeReset = async () => {
        if (!match.matchId) return;

        await localMatchRepository.update(match.matchId, {
            players: {
                playerA: {
                    ...match.players.playerA,
                    score: 0,
                    hansoku: 0,
                },
                playerB: {
                    ...match.players.playerB,
                    score: 0,
                    hansoku: 0,
                },
            },
            winner: "none",
            winReason: "none",
            isCompleted: false,
            isSynced: false,
        });
        setState(prev => ({ ...prev, showResetConfirm: false }));
        onClose();
    };

    const closeResetConfirm = () => {
        setState(prev => ({ ...prev, showResetConfirm: false }));
    };

    return {
        formState: state,
        setters: {
            setWinner: (winner: MatchEditFormState["winner"]) => setState(prev => ({ ...prev, winner })),
            setWinReason: (winReason: MatchEditFormState["winReason"]) => setState(prev => ({ ...prev, winReason })),
            setPlayerAScore: (playerAScore: number) => setState(prev => ({ ...prev, playerAScore })),
            setPlayerBScore: (playerBScore: number) => setState(prev => ({ ...prev, playerBScore })),
            setPlayerAHansoku: (playerAHansoku: number | null) => setState(prev => ({ ...prev, playerAHansoku })),
            setPlayerBHansoku: (playerBHansoku: number | null) => setState(prev => ({ ...prev, playerBHansoku })),
        },
        actions: {
            handleSave,
            handleResetClick,
            executeReset,
            closeResetConfirm,
        },
    };
}
