/**
 * 大会一覧管理フック
 * 大会の削除など一覧画面の操作を管理
 */

import { useState, useCallback } from "react";
import { useToast } from "@/components/providers/notification-provider";
import { useDeleteTournament } from "@/queries/use-tournaments";
import type { Tournament } from "@/types/tournament.schema";

interface DeleteConfirmState {
    isOpen: boolean;
    tournament: Tournament | null;
}

interface UseTournamentListManagementResult {
    deleteConfirm: DeleteConfirmState;
    isDeleting: boolean;

    // 削除操作関数
    handleDeleteClick: (tournament: Tournament) => void;
    handleDeleteConfirm: (orgId: string) => void;
    handleDeleteCancel: () => void;
}

/**
 * 大会一覧の操作（削除など）を管理
 * TournamentListコンポーネント内での複雑な削除ロジックを抽出
 */
export function useTournamentListManagement(): UseTournamentListManagementResult {
    const { showSuccess, showError } = useToast();
    const { mutate: deleteTournament, isPending: isDeleting } =
        useDeleteTournament();

    const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
        isOpen: false,
        tournament: null,
    });

    /**
     * 削除ボタンがクリックされたときの処理
     */
    const handleDeleteClick = useCallback((tournament: Tournament) => {
        setDeleteConfirm({ isOpen: true, tournament });
    }, []);

    /**
     * 削除確認ダイアログで「削除」が押された場合
     */
    const handleDeleteConfirm = useCallback(
        (orgId: string) => {
            if (!deleteConfirm.tournament?.tournamentId) return;

            deleteTournament(
                {
                    orgId,
                    tournamentId: deleteConfirm.tournament.tournamentId,
                },
                {
                    onSuccess: () => {
                        showSuccess(
                            `「${deleteConfirm.tournament?.tournamentName}」を削除しました`
                        );
                        setDeleteConfirm({ isOpen: false, tournament: null });
                    },
                    onError: (error) => {
                        showError(`大会の削除に失敗しました: ${error.message}`);
                    },
                }
            );
        },
        [deleteConfirm.tournament, deleteTournament, showSuccess, showError]
    );

    /**
     * 削除確認ダイアログをキャンセル
     */
    const handleDeleteCancel = useCallback(() => {
        setDeleteConfirm({ isOpen: false, tournament: null });
    }, []);

    return {
        deleteConfirm,
        isDeleting,
        handleDeleteClick,
        handleDeleteConfirm,
        handleDeleteCancel,
    };
}
