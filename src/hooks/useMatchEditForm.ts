import { useState, useEffect } from "react";
import type { Match, WinReason } from "@/types/match.schema";
import { localMatchRepository } from "@/repositories/local/match-repository";

interface UseMatchEditFormProps {
    match: Match;
    isOpen: boolean;
    onClose: () => void;
}

export function useMatchEditForm({ match, isOpen, onClose }: UseMatchEditFormProps) {
    const [winner, setWinner] = useState<"playerA" | "playerB" | "draw" | "none" | null>(match.winner);
    const [winReason, setWinReason] = useState<WinReason | null>(match.winReason);
    const [playerAScore, setPlayerAScore] = useState(match.players.playerA.score);
    const [playerBScore, setPlayerBScore] = useState(match.players.playerB.score);
    const [playerAHansoku, setPlayerAHansoku] = useState(match.players.playerA.hansoku);
    const [playerBHansoku, setPlayerBHansoku] = useState(match.players.playerB.hansoku);
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setWinner(match.winner);
            setWinReason(match.winReason);
            setPlayerAScore(match.players.playerA.score);
            setPlayerBScore(match.players.playerB.score);
            setPlayerAHansoku(match.players.playerA.hansoku);
            setPlayerBHansoku(match.players.playerB.hansoku);
        }
        // matchを依存配列から外して、編集中にリセットされないようにする
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const handleSave = async () => {
        if (!match.matchId) return;

        await localMatchRepository.update(match.matchId, {
            players: {
                playerA: {
                    ...match.players.playerA,
                    score: playerAScore,
                    hansoku: playerAHansoku ?? 0,
                },
                playerB: {
                    ...match.players.playerB,
                    score: playerBScore,
                    hansoku: playerBHansoku ?? 0,
                },
            },
            winner: winner || "none",
            winReason: winReason || "none",
            isCompleted: true,
            isSynced: false,
        });
        onClose();
    };

    const handleResetClick = () => {
        setShowResetConfirm(true);
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
        setShowResetConfirm(false);
        onClose();
    };

    const closeResetConfirm = () => {
        setShowResetConfirm(false);
    };

    return {
        formState: {
            winner,
            winReason,
            playerAScore,
            playerBScore,
            playerAHansoku,
            playerBHansoku,
            showResetConfirm,
        },
        setters: {
            setWinner,
            setWinReason,
            setPlayerAScore,
            setPlayerBScore,
            setPlayerAHansoku,
            setPlayerBHansoku,
        },
        actions: {
            handleSave,
            handleResetClick,
            executeReset,
            closeResetConfirm,
        },
    };
}
