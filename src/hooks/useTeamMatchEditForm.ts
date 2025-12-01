import { useState } from "react";
import type { TeamMatch, WinReason } from "@/types/match.schema";
import { useTeamMatchController } from "@/hooks/useTeamMatchController";
import { createMatchResultUpdateObject } from "@/domains/match/team-match-logic";

interface UseTeamMatchEditFormProps {
    match: TeamMatch;
    isOpen: boolean;
    onClose: () => void;
}

interface TeamMatchEditFormState {
    winner: "playerA" | "playerB" | "draw" | "none" | null;
    winReason: WinReason | null;
    playerAScore: number;
    playerBScore: number;
    playerAHansoku: number | null;
    playerBHansoku: number | null;
    showResetConfirm: boolean;
}

export function useTeamMatchEditForm({ match, isOpen, onClose }: UseTeamMatchEditFormProps) {
    const { handleSaveMatchResult } = useTeamMatchController();

    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
    const [state, setState] = useState<TeamMatchEditFormState>({
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
        const updateObject = createMatchResultUpdateObject(match, {
            playerAScore: state.playerAScore,
            playerBScore: state.playerBScore,
            playerAHansoku: state.playerAHansoku ?? 0,
            playerBHansoku: state.playerBHansoku ?? 0,
            winner: state.winner || "none",
            winReason: state.winReason || "none",
            isCompleted: true,
        });
        await handleSaveMatchResult(updateObject);
        onClose();
    };

    const handleResetClick = () => {
        setState(prev => ({ ...prev, showResetConfirm: true }));
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
        setState(prev => ({ ...prev, showResetConfirm: false }));
        onClose();
    };

    const closeResetConfirm = () => {
        setState(prev => ({ ...prev, showResetConfirm: false }));
    };

    return {
        formState: state,
        setters: {
            setWinner: (winner: TeamMatchEditFormState["winner"]) => setState(prev => ({ ...prev, winner })),
            setWinReason: (winReason: TeamMatchEditFormState["winReason"]) => setState(prev => ({ ...prev, winReason })),
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
