"use client";

import React, { useState, useEffect } from "react";
import { LoadingIndicator } from "@/components/molecules/loading-indicator";
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
    const [forceClose, setForceClose] = useState(false);

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
    useEffect(() => {
        if (hasTournamentSelected) {
            const timeoutId = setTimeout(() => {
                setForceClose(false);
            }, 0);

            return () => clearTimeout(timeoutId);
        }
    }, [hasTournamentSelected]);

    if (!isInitialized || tournamentLoading) {
        return (
            <LoadingIndicator
                message="準備中..."
                size="lg"
                fullScreen={true}
            />
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