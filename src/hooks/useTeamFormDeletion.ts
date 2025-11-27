import { useState, useCallback } from "react";

/**
 * チームフォームの選手削除管理ロジック
 * 既存選手（フォーム開始時に存在していた選手）の削除を追跡する
 */
export function useTeamFormDeletion(existingPlayerIds: string[]) {
    // フォーム開始時の選手IDリスト（既存選手の判定用）
    const [initialPlayerIds] = useState<Set<string>>(() => new Set(existingPlayerIds));

    // 削除された既存選手の数
    const [deletedPlayerCount, setDeletedPlayerCount] = useState(0);

    /**
     * 選手削除時に既存選手かどうかを判定し、カウントを更新
     */
    const trackDeletion = useCallback((playerId: string) => {
        if (initialPlayerIds.has(playerId)) {
            setDeletedPlayerCount(prev => prev + 1);
        }
    }, [initialPlayerIds]);

    /**
     * 削除カウントをリセット（保存成功時などに使用）
     */
    const resetDeletionCount = useCallback(() => {
        setDeletedPlayerCount(0);
    }, []);

    return {
        deletedPlayerCount,
        trackDeletion,
        resetDeletionCount,
    };
}
