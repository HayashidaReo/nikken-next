import { useLocalStorage } from "./useLocalStorage";
import type { Tournament } from "@/types/tournament.schema";

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

export function sortTournaments(tournaments: Tournament[], config: TournamentSortState): Tournament[] {
    return [...tournaments].sort((a, b) => {
        let dateA: Date | string | undefined;
        let dateB: Date | string | undefined;

        if (config.field === "createdAt") {
            dateA = a.createdAt;
            dateB = b.createdAt;
        } else if (config.field === "tournamentDate") {
            dateA = a.tournamentDate;
            dateB = b.tournamentDate;
        }

        const timeA = dateA ? new Date(dateA).getTime() : 0;
        const timeB = dateB ? new Date(dateB).getTime() : 0;

        if (config.direction === "asc") {
            return timeA - timeB;
        } else {
            return timeB - timeA;
        }
    });
}

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

