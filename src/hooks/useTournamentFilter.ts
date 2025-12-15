import { useMemo } from "react";
import type { Tournament } from "@/types/tournament.schema";
import { useSessionStorage } from "./useSessionStorage";

const FILTER_STORAGE_KEY = "nikken-tournament-list-filters";

interface TournamentFilters {
    statusValues: string[];
}

export const TOURNAMENT_FILTER_OPTIONS = [
    { value: "active", label: "有効" },
    { value: "archived", label: "アーカイブ済み" },
] as const;

export const useTournamentFilter = (tournaments: Tournament[]) => {
    // SessionStorageからフィルター状態を復元
    const [filters, setFilters] = useSessionStorage<TournamentFilters>(
        FILTER_STORAGE_KEY,
        {
            statusValues: ["active"], // デフォルトは有効のみ
        }
    );

    const setSelectedStatusValues = (statusValues: string[]) => {
        setFilters((prev) => ({ ...prev, statusValues }));
    };

    // フィルタリング処理
    const filteredTournaments = useMemo(() => {
        return tournaments.filter((t) => {
            // ステータスフィルター
            // 選択が空の場合は全て表示

            const showActive = filters.statusValues.includes("active");
            const showArchived = filters.statusValues.includes("archived");

            if (filters.statusValues.length === 0) return true; // 全て表示

            if (showActive && !t.isArchived) return true;
            if (showArchived && t.isArchived) return true;

            return false;
        });
    }, [tournaments, filters.statusValues]);

    return {
        selectedStatusValues: filters.statusValues,
        setSelectedStatusValues,
        filterOptions: TOURNAMENT_FILTER_OPTIONS,
        filteredTournaments,
    };
};
