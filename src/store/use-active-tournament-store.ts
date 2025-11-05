"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const ACTIVE_TOURNAMENT_KEY = "activeTournamentId";

interface ActiveTournamentState {
    activeTournamentId: string | null;
    setActiveTournament: (tournamentId: string | null) => void;
    clearActiveTournament: () => void;
}

/**
 * アクティブな大会ID管理のZustandストア
 * LocalStorage での永続化をサポート
 */
export const useActiveTournamentStore = create<ActiveTournamentState>()(
    persist(
        (set) => ({
            activeTournamentId: null,

            setActiveTournament: (tournamentId: string | null) => {
                set({ activeTournamentId: tournamentId });
            },

            clearActiveTournament: () => {
                set({ activeTournamentId: null });
            },
        }),
        {
            name: ACTIVE_TOURNAMENT_KEY,
            partialize: (state) => ({ activeTournamentId: state.activeTournamentId }),
        }
    )
);

/**
 * React Hook ラッパー
 */
export function useActiveTournament() {
    const { activeTournamentId, setActiveTournament, clearActiveTournament } =
        useActiveTournamentStore();

    const hasTournamentSelected = Boolean(activeTournamentId);
    const isLoading = false; // Zustand ストア版では非同期不要

    return {
        activeTournamentId,
        setActiveTournament,
        clearActiveTournament,
        hasTournamentSelected,
        isLoading,
    };
}
