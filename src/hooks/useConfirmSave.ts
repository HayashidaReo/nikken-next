import { useState, useCallback } from "react";

interface UseConfirmSaveOptions<T> {
    /**
     * 確認が必要かどうかを判定する関数
     */
    shouldConfirm: () => boolean;
    /**
     * 実際の保存処理
     */
    onSave: (data: T) => Promise<void>;
    /**
     * 保存成功時のコールバック
     */
    onSuccess?: () => void;
}

/**
 * 保存確認ダイアログのロジックを管理するフック
 * 
 * 条件付きで確認ダイアログを表示し、ユーザーの承認後に保存処理を実行する
 */
export function useConfirmSave<T>({ shouldConfirm, onSave, onSuccess }: UseConfirmSaveOptions<T>) {
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingData, setPendingData] = useState<T | null>(null);

    /**
     * 保存を試行する
     * shouldConfirm()がtrueを返す場合は確認ダイアログを表示
     * falseの場合は直接保存処理を実行
     */
    const attemptSave = useCallback(async (data: T) => {
        if (shouldConfirm()) {
            // 確認が必要な場合はダイアログを表示
            setPendingData(data);
            setShowConfirmDialog(true);
        } else {
            // 確認不要な場合は直接保存
            await onSave(data);
            onSuccess?.();
        }
    }, [shouldConfirm, onSave, onSuccess]);

    /**
     * 確認ダイアログで「保存する」を選択
     */
    const confirmSave = useCallback(async () => {
        if (!pendingData) return;

        setShowConfirmDialog(false);
        await onSave(pendingData);
        setPendingData(null);
        onSuccess?.();
    }, [pendingData, onSave, onSuccess]);

    /**
     * 確認ダイアログで「キャンセル」を選択
     */
    const cancelSave = useCallback(() => {
        setShowConfirmDialog(false);
        setPendingData(null);
    }, []);

    return {
        showConfirmDialog,
        attemptSave,
        confirmSave,
        cancelSave,
    };
}
