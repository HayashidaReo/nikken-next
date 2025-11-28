import { useState, useEffect } from "react";
import type { TeamMatch, WinReason } from "@/types/match.schema";
import { useTeamMatchController } from "@/hooks/useTeamMatchController";
import { createMatchResultUpdateObject } from "@/domains/match/team-match-logic";

interface UseTeamMatchEditFormProps {
    match: TeamMatch;
    isOpen: boolean;
    onClose: () => void;
}

export function useTeamMatchEditForm({ match, isOpen, onClose }: UseTeamMatchEditFormProps) {
    const { handleSaveMatchResult } = useTeamMatchController();

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
        const updateObject = createMatchResultUpdateObject(match, {
            playerAScore,
            playerBScore,
            playerAHansoku: playerAHansoku ?? 0,
            playerBHansoku: playerBHansoku ?? 0,
            winner: winner || "none",
            winReason: winReason || "none",
            isCompleted: true,
        });
        await handleSaveMatchResult(updateObject);
        onClose();
    };

    const handleResetClick = () => {
        setShowResetConfirm(true);
    };

    const executeReset = async () => {
        const updateObject = createMatchResultUpdateObject(match, {
            playerAScore: 0,
            playerBScore: 0,
            playerAHansoku: 0,
            playerBHansoku: 0,
            winner: "none",
            winReason: "none",
            isCompleted: false,
        });
        await handleSaveMatchResult(updateObject);
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
