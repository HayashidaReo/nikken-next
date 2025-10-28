"use client";

import { useState, useCallback } from "react";
import type { Tournament } from "@/types/tournament.schema";
import { useAuth } from "@/hooks/useAuth";

// APIレスポンス用の型（createdAt, updatedAtは文字列）
interface TournamentResponse extends Omit<Tournament, 'createdAt' | 'updatedAt'> {
    createdAt: string;
    updatedAt: string;
    tournamentId?: string;
}

/**
 * 大会管理用のカスタムフック
 * 組織内の大会取得、個別大会取得、大会更新を行う
 */
export function useTournament() {
    const [tournaments, setTournaments] = useState<TournamentResponse[]>([]);
    const [currentTournament, setCurrentTournament] = useState<TournamentResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    /**
     * 現在のユーザー用の組織を作成
     */
    const createOrganizationForUser = useCallback(async (): Promise<{ message: string; orgId: string }> => {
        if (!user) {
            throw new Error("ログインが必要です");
        }

        // Firebase Authから直接IDトークンを取得
        const auth = await import("firebase/auth");
        const currentUser = auth.getAuth().currentUser;
        if (!currentUser) {
            throw new Error("認証状態が無効です");
        }

        const token = await currentUser.getIdToken();

        const response = await fetch("/api/organizations/create-for-user", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "組織作成に失敗しました");
        }

        return response.json();
    }, [user]);

    /**
     * 組織内の全大会を取得
     */
    const fetchTournaments = useCallback(async (orgId: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/tournaments/${orgId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "大会一覧の取得に失敗しました");
            }

            const data = await response.json();
            setTournaments(data.tournaments);

            // 最初の大会を自動選択（通常はデフォルト大会）
            if (data.tournaments.length > 0) {
                setCurrentTournament(data.tournaments[0]);
            }

            return data.tournaments;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "大会一覧の取得に失敗しました";
            setError(errorMessage);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * 特定の大会を取得
     */
    const fetchTournament = useCallback(async (orgId: string, tournamentId: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/tournaments/${orgId}/${tournamentId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "大会情報の取得に失敗しました");
            }

            const data = await response.json();
            setCurrentTournament(data.tournament);

            return data.tournament;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "大会情報の取得に失敗しました";
            setError(errorMessage);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * 大会情報を更新
     */
    const updateTournament = useCallback(async (
        orgId: string,
        tournamentId: string,
        tournamentData: Partial<Tournament>
    ) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/tournaments/${orgId}/${tournamentId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(tournamentData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "大会情報の更新に失敗しました");
            }

            // 更新後に大会情報を再取得して状態を同期
            await fetchTournament(orgId, tournamentId);

            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "大会情報の更新に失敗しました";
            setError(errorMessage);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [fetchTournament]);

    /**
     * 現在の大会を設定
     */
    const selectTournament = useCallback((tournament: TournamentResponse) => {
        setCurrentTournament(tournament);
    }, []);

    /**
     * エラーをクリア
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        tournaments,
        currentTournament,
        isLoading,
        error,
        fetchTournaments,
        fetchTournament,
        updateTournament,
        selectTournament,
        clearError,
        createOrganizationForUser,
    };
}

/**
 * 組織IDを管理するhook
 * ユーザーのUIDを組織IDとして使用
 */
export function useOrganizationId() {
    const { user } = useAuth();

    // ユーザーのUIDを組織IDとして使用
    const orgId = user?.uid || null;

    return { orgId };
}