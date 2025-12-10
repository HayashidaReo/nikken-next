import { useState } from "react";
import type { MatchGroup } from "@/types/match.schema";
import { localMatchGroupRepository } from "@/repositories/local/match-group-repository";
import { useToast } from "@/components/providers/notification-provider";

interface UseMatchGroupEditFormProps {
    matchGroup: MatchGroup;
    isOpen: boolean;
    onClose: () => void;
}

interface MatchGroupEditFormState {
    winnerTeam: "teamA" | "teamB" | undefined;
    isCompleted: boolean;
    showResetConfirm: boolean;
}

export function useMatchGroupEditForm({ matchGroup, isOpen, onClose }: UseMatchGroupEditFormProps) {
    const { showSuccess, showError } = useToast();

    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
    const [state, setState] = useState<MatchGroupEditFormState>({
        winnerTeam: matchGroup.winnerTeam,
        isCompleted: matchGroup.isCompleted,
        showResetConfirm: false,
    });

    if (isOpen !== prevIsOpen) {
        setPrevIsOpen(isOpen);
        if (isOpen) {
            setState({
                winnerTeam: matchGroup.winnerTeam,
                isCompleted: matchGroup.isCompleted,
                showResetConfirm: false,
            });
        }
    }

    const handleSave = async () => {
        if (!matchGroup.matchGroupId) {
            showError("試合IDが見つかりません");
            return;
        }

        try {
            await localMatchGroupRepository.update(matchGroup.matchGroupId, {
                winnerTeam: state.winnerTeam,
                isCompleted: state.isCompleted,
            });
            showSuccess("試合結果を保存しました");
            onClose();
        } catch (error) {
            console.error("Failed to save match group:", error);
            showError("保存に失敗しました");
        }
    };

    return {
        formState: state,
        setters: {
            setWinnerTeam: (winnerTeam: MatchGroupEditFormState["winnerTeam"]) => setState(prev => ({ ...prev, winnerTeam })),
            setIsCompleted: (isCompleted: boolean) => setState(prev => ({ ...prev, isCompleted })),
        },
        actions: {
            handleSave,
        },
    };
}
