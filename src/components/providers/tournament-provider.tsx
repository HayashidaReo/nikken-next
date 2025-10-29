"use client";

import React from "react";
import { useAuthStore } from "@/store/use-auth-store";
import { useActiveTournament } from "@/hooks/useActiveTournament";
import { TournamentSelectionDialog } from "@/components/organisms/TournamentSelectionDialog";

interface TournamentProviderProps {
    children: React.ReactNode;
}

/**
 * 大会選択管理Provider
 * 
 * 要件：
 * - ログイン済みかつ大会IDが未選択の場合は強制ダイアログ表示
 * - 大会選択完了まで他の操作をブロック
 */
export function TournamentProvider({ children }: TournamentProviderProps) {
    const { user, isInitialized } = useAuthStore();
    const { hasTournamentSelected, isLoading: tournamentLoading } = useActiveTournament();
    const [forceClose, setForceClose] = React.useState(false);

    // ダイアログ表示条件を計算で決定（副作用なし）
    const shouldShowDialog = isInitialized &&
        !tournamentLoading &&
        Boolean(user) &&
        !hasTournamentSelected &&
        !forceClose;

    const handleDialogClose = () => {
        setForceClose(true);
    };

    // 大会選択状態が変わった場合、forceCloseをリセット
    React.useEffect(() => {
        if (hasTournamentSelected) {
            setForceClose(false);
        }
    }, [hasTournamentSelected]);

    // 初期化中は何も表示しない
    if (!isInitialized || tournamentLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">初期化中...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {children}

            {/* 大会選択強制ダイアログ */}
            <TournamentSelectionDialog
                open={shouldShowDialog}
                dismissible={false} // 必須選択のため閉じることはできない
                onClose={handleDialogClose}
            />
        </>
    );
}