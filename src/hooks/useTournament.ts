"use client";

import { useState } from "react";

interface Tournament {
    tournamentId: string;
    tournamentName: string;
    tournamentDate: string;
    location: string;
    defaultMatchTime: number;
    courts: Array<{ courtId: string; courtName: string }>;
    createdAt: string;
    updatedAt: string;
}

/**
 * 大会データを管理するhook
 * 組織内の大会取得、個別大会取得、大会更新を行う
 */
export function useTournament() {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [currentTournament, setCurrentTournament] = useState<Tournament | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * 組織内の全大会を取得
     */
    const fetchTournaments = async (orgId: string) => {
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
    };

    /**
     * 特定の大会を取得
     */
    const fetchTournament = async (orgId: string, tournamentId: string) => {
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
    };

    /**
     * 大会情報を更新
     */
    const updateTournament = async (
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

            // ローカル状態を更新
            if (currentTournament && currentTournament.tournamentId === tournamentId) {
                setCurrentTournament({
                    ...currentTournament,
                    ...tournamentData,
                });
            }

            // 大会一覧も更新
            setTournaments(prev =>
                prev.map(t =>
                    t.tournamentId === tournamentId
                        ? { ...t, ...tournamentData }
                        : t
                )
            );

            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "大会情報の更新に失敗しました";
            setError(errorMessage);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * 現在の大会を設定
     */
    const selectTournament = (tournament: Tournament) => {
        setCurrentTournament(tournament);
    };

    /**
     * エラーをクリア
     */
    const clearError = () => {
        setError(null);
    };

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
    };
}

/**
 * 組織IDを管理するhook（現在は仮実装）
 * 実際にはログインユーザーの組織情報から取得する
 */
export function useOrganizationId() {
    // TODO: 認証から組織IDを取得する実装
    // 現在はハードコード（デモ用）
    const [orgId, setOrgId] = useState<string | null>(() => {
        // 初期値としてLocalStorageから取得
        if (typeof window !== 'undefined') {
            return localStorage.getItem("currentOrgId");
        }
        return null;
    });

    // 組織IDを設定し、LocalStorageにも保存
    const updateOrgId = (newOrgId: string) => {
        setOrgId(newOrgId);
        if (typeof window !== 'undefined') {
            localStorage.setItem("currentOrgId", newOrgId);
        }
    };

    return { orgId, setOrgId: updateOrgId };
}