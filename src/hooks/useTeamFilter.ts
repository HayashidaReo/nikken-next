import { useMemo } from "react";
import type { Team } from "@/types/team.schema";
import { useSessionStorage } from "./useSessionStorage";

const FILTER_STORAGE_KEY = "nikken-team-search-query";

/**
 * チーム検索・フィルタリング用のカスタムフック
 * @param teams フィルタリング対象のチーム配列
 * @returns 検索クエリ、クエリ設定関数、フィルタリング済みチーム配列
 */
export const useTeamFilter = (teams: Team[]) => {
    const [searchQuery, setSearchQuery] = useSessionStorage<string>(
        FILTER_STORAGE_KEY,
        ""
    );

    const filteredTeams = useMemo(() => {
        if (!searchQuery.trim()) {
            return teams;
        }

        const lowerQuery = searchQuery.toLowerCase();
        return teams.filter((team) =>
            team.teamName.toLowerCase().includes(lowerQuery)
        );
    }, [teams, searchQuery]);

    return {
        searchQuery,
        setSearchQuery,
        filteredTeams,
    };
};
