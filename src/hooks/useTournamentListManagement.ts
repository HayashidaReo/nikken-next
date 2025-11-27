/**
 * 大会一覧管理フック
 * 大会の削除など一覧画面の操作を管理
 */

import { useState, useCallback } from "react";
import { useToast } from "@/components/providers/notification-provider";
import { useDeleteTournament } from "@/queries/use-tournaments";
import { useTournamentPersistence } from "@/hooks/useTournamentPersistence";
import type { Tournament } from "@/types/tournament.schema";
import { useActiveTournament } from "@/store/use-active-tournament-store";

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
 */
export function useTournamentListManagement(tournaments: Tournament[] = []): UseTournamentListManagementResult {
    const { showSuccess, showError } = useToast();
    const { mutateAsync: deleteTournament, isPending: isDeleting } =
        useDeleteTournament();
    const { syncTournamentToCloud } = useTournamentPersistence();
    const { activeTournamentId, setActiveTournament, clearActiveTournament } = useActiveTournament();

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
        async (orgId: string) => {
            if (!deleteConfirm.tournament?.tournamentId) return;

            const tournamentId = deleteConfirm.tournament.tournamentId;
            const tournamentName = deleteConfirm.tournament.tournamentName;

            try {
                // 1. ローカルから削除
                await deleteTournament({ orgId, tournamentId });

                // 削除対象がアクティブな大会だった場合、次の大会を選択する
                if (activeTournamentId === tournamentId) {
                    const currentIndex = tournaments.findIndex(t => t.tournamentId === tournamentId);
                    let nextTournament: Tournament | undefined;

                    if (currentIndex >= 0) {
                        // 次の要素があるか確認
                        if (currentIndex + 1 < tournaments.length) {
                            nextTournament = tournaments[currentIndex + 1];
                        }
                        // なければ前の要素を確認
                        else if (currentIndex - 1 >= 0) {
                            nextTournament = tournaments[currentIndex - 1];
                        }
                    }

                    if (nextTournament && nextTournament.tournamentId) {
                        setActiveTournament(nextTournament.tournamentId, nextTournament.tournamentType);
                    } else {
                        clearActiveTournament();
                    }
                }

                showSuccess(`「${tournamentName}」を端末から削除しました`);
                setDeleteConfirm({ isOpen: false, tournament: null });

                // 2. バックグラウンドでクラウド同期を試行
                setTimeout(() => {
                    syncTournamentToCloud(tournamentId, { showSuccessToast: true }).catch((err) => {
                        console.error("Background sync failed:", err);
                    });
                }, 0);

            } catch (error) {
                showError(`削除に失敗しました: ${error}`);
            }
        },
        [
            deleteConfirm.tournament,
            showSuccess,
            showError,
            activeTournamentId,
            tournaments,
            setActiveTournament,
            clearActiveTournament,
            deleteTournament,
            syncTournamentToCloud,
        ]
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
