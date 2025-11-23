"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const ACTIVE_TOURNAMENT_KEY = "active-tournament-storage";

interface ActiveTournamentState {
    activeTournamentId: string | null;
    activeTournamentType: "individual" | "team" | null;
    setActiveTournament: (tournamentId: string | null, tournamentType?: "individual" | "team" | null) => void;
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
            activeTournamentType: null,
            setActiveTournament: (tournamentId: string | null, tournamentType: "individual" | "team" | null = null) => {
                set({ activeTournamentId: tournamentId, activeTournamentType: tournamentType });
            },
            clearActiveTournament: () => {
                set({ activeTournamentId: null, activeTournamentType: null });
            },
        }),
        {
            name: ACTIVE_TOURNAMENT_KEY,
            partialize: (state) => ({
                activeTournamentId: state.activeTournamentId,
                activeTournamentType: state.activeTournamentType
            }),
        }
    )
);

/**
 * React Hook ラッパー
 */
export function useActiveTournament() {
    const { activeTournamentId, activeTournamentType, setActiveTournament, clearActiveTournament } =
        useActiveTournamentStore();

    const hasTournamentSelected = Boolean(activeTournamentId);
    const isLoading = false; // Zustand ストア版では非同期不要

    return {
        activeTournamentId,
        activeTournamentType,
        setActiveTournament,
        clearActiveTournament,
        hasTournamentSelected,
        isLoading,
    };
}

