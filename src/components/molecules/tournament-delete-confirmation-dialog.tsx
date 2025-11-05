/**
 * 大会削除確認ダイアログ
 */

import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import type { Tournament } from "@/types/tournament.schema";

interface TournamentDeleteConfirmationDialogProps {
    isOpen: boolean;
    tournament: Tournament | null;
    onConfirm: () => void;
    onCancel: () => void;
}

/**
 * 大会削除の確認ダイアログを表示
 * ユーザーに削除前の最終確認を取得
 */
export function TournamentDeleteConfirmationDialog({
    isOpen,
    tournament,
    onConfirm,
    onCancel,
}: TournamentDeleteConfirmationDialogProps) {
    return (
        <ConfirmDialog
            isOpen={isOpen}
            onCancel={onCancel}
            onConfirm={onConfirm}
            title="大会を削除"
            message={`「${tournament?.tournamentName}」を削除してもよろしいですか？この操作は元に戻せません。`}
            confirmText="削除"
            cancelText="キャンセル"
            variant="destructive"
        />
    );
}
