"use client";

import { useAuth } from "@/hooks/useAuth";
import { useActiveTournament } from "@/store/use-active-tournament-store";
import { useMemo } from "react";

/**
 * 組織・大会情報を含む統合認証フック
 * チーム管理画面で必要な認証状態とコンテキスト情報を提供
 */
export function useAuthContext() {
    const { user, isLoading: authLoading, isAuthenticated } = useAuth();
    const {
        activeTournamentId,
        isLoading: tournamentLoading,
        hasTournamentSelected,
    } = useActiveTournament();

    // ユーザーの組織IDを取得（ユーザーのuidを組織IDとして使用）
    const orgId = useMemo(() => {
        if (!user) return null;
        // ユーザーのuidを組織IDとして使用
        return user.uid;
    }, [user]);

    const isReady = useMemo(() => {
        return (
            !authLoading &&
            !tournamentLoading &&
            isAuthenticated &&
            hasTournamentSelected &&
            orgId
        );
    }, [authLoading, tournamentLoading, isAuthenticated, hasTournamentSelected, orgId]);

    const isLoading = authLoading || tournamentLoading;

    return {
        user,
        orgId,
        activeTournamentId,
        isAuthenticated,
        hasTournamentSelected,
        isReady,
        isLoading,
        // 大会が選択されていない場合のエラー状態
        needsTournamentSelection: isAuthenticated && !hasTournamentSelected,
    };
}