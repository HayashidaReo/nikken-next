/**
 * 大会一覧管理フック
 * 大会の削除など一覧画面の操作を管理
 */

import { useState, useCallback } from "react";
import { useToast } from "@/components/providers/notification-provider";
import { useDeleteTournament } from "@/queries/use-tournaments";
import { localTournamentRepository } from "@/repositories/local/tournament-repository";
import type { Tournament } from "@/types/tournament.schema";

interface DeleteConfirmState {
    isOpen: boolean;
    tournament: Tournament | null;
}

interface SyncConfirmState {
    isOpen: boolean;
    orgId: string | null;
    tournamentId: string | null;
    tournamentName: string | null;
}

interface UseTournamentListManagementResult {
    deleteConfirm: DeleteConfirmState;
    syncConfirm: SyncConfirmState;
    isDeleting: boolean;

    // 削除操作関数
    handleDeleteClick: (tournament: Tournament) => void;
    handleDeleteConfirm: (orgId: string) => void;
    handleDeleteCancel: () => void;
    handleSyncConfirm: () => void;
    handleSyncCancel: () => void;
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

    const [syncConfirm, setSyncConfirm] = useState<SyncConfirmState>({
        isOpen: false,
        orgId: null,
        tournamentId: null,
        tournamentName: null,
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
                await localTournamentRepository.delete(orgId, tournamentId);

                // 2. 成功したらダイアログを閉じて、同期確認ダイアログを開く
                setDeleteConfirm({ isOpen: false, tournament: null });
                setSyncConfirm({
                    isOpen: true,
                    orgId,
                    tournamentId,
                    tournamentName,
                });

                showSuccess(`「${tournamentName}」を端末から削除しました`);
            } catch (error) {
                showError(`削除に失敗しました: ${error}`);
            }
        },
        [deleteConfirm.tournament, showSuccess, showError]
    );

    /**
     * 同期確認ダイアログで「はい」が押された場合
     */
    const handleSyncConfirm = useCallback(() => {
        if (!syncConfirm.orgId || !syncConfirm.tournamentId) return;

        deleteTournament(
            {
                orgId: syncConfirm.orgId,
                tournamentId: syncConfirm.tournamentId,
            },
            {
                onSuccess: () => {
                    showSuccess(
                        `「${syncConfirm.tournamentName}」をクラウドからも削除しました`
                    );
                    setSyncConfirm({
                        isOpen: false,
                        orgId: null,
                        tournamentId: null,
                        tournamentName: null,
                    });
                },
                onError: (error) => {
                    showError(`クラウドからの削除に失敗しました: ${error.message}`);
                    setSyncConfirm({
                        isOpen: false,
                        orgId: null,
                        tournamentId: null,
                        tournamentName: null,
                    });
                },
            }
        );
    }, [syncConfirm, deleteTournament, showSuccess, showError]);

    /**
     * 同期確認ダイアログをキャンセル
     */
    const handleSyncCancel = useCallback(() => {
        setSyncConfirm({
            isOpen: false,
            orgId: null,
            tournamentId: null,
            tournamentName: null,
        });
    }, []);

    /**
     * 削除確認ダイアログをキャンセル
     */
    const handleDeleteCancel = useCallback(() => {
        setDeleteConfirm({ isOpen: false, tournament: null });
    }, []);

    return {
        deleteConfirm,
        syncConfirm,
        isDeleting,
        handleDeleteClick,
        handleDeleteConfirm,
        handleDeleteCancel,
        handleSyncConfirm,
        handleSyncCancel,
    };
}
