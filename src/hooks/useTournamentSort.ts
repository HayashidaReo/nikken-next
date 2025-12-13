"use client";

import { useLocalStorage } from "./useLocalStorage";

// Sort field types
export type SortField = "createdAt" | "tournamentDate";
export type SortDirection = "asc" | "desc";

export interface TournamentSortState {
    field: SortField;
    direction: SortDirection;
}

// Key for storage
export const TOURNAMENT_SORT_CONFIG_KEY = "tournament_sort_config";

// Default config: Create Date Descending (Newest first)
export const DEFAULT_SORT_CONFIG: TournamentSortState = {
    field: "createdAt",
    direction: "desc",
};

export function useTournamentSort() {
    const [sortConfig, setSortConfig] = useLocalStorage<TournamentSortState>(
        TOURNAMENT_SORT_CONFIG_KEY,
        DEFAULT_SORT_CONFIG
    );

    return {
        sortConfig,
        setSortConfig,
    };
}
