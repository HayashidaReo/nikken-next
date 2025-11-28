import { useMemo } from "react";
import type { MatchGroup } from "@/types/match.schema";
import { useMasterData } from "@/components/providers/master-data-provider";
import { MATCH_GROUP_STATUS_OPTIONS, MATCH_GROUP_STATUS } from "@/lib/constants";
import { useSessionStorage } from "./useSessionStorage";

const FILTER_STORAGE_KEY = "nikken-match-group-filters";

interface MatchGroupFilters {
    courtIds: string[];
    roundIds: string[];
    statusValues: string[];
}

export const useMatchGroupFilter = (matchGroups: MatchGroup[]) => {
    const { courts, rounds } = useMasterData();

    // SessionStorageからフィルター状態を復元
    const [filters, setFilters] = useSessionStorage<MatchGroupFilters>(
        FILTER_STORAGE_KEY,
        {
            courtIds: [],
            roundIds: [],
            statusValues: [],
        }
    );

    const setSelectedCourtIds = (courtIds: string[]) => {
        setFilters(prev => ({ ...prev, courtIds }));
    };

    const setSelectedRoundIds = (roundIds: string[]) => {
        setFilters(prev => ({ ...prev, roundIds }));
    };

    const setSelectedStatusValues = (statusValues: string[]) => {
        setFilters(prev => ({ ...prev, statusValues }));
    };

    // 選択肢の生成
    const courtOptions = useMemo(() => {
        const uniqueCourtIds = Array.from(new Set(matchGroups.map((g) => g.courtId)));
        return uniqueCourtIds
            .map((id) => ({
                value: id,
                label: courts.get(id)?.courtName || "未設定",
            }))
            .sort((a, b) => a.label.localeCompare(b.label, "ja"));
    }, [matchGroups, courts]);

    const roundOptions = useMemo(() => {
        const uniqueRoundIds = Array.from(new Set(matchGroups.map((g) => g.roundId)));
        return uniqueRoundIds
            .map((id) => ({
                value: id,
                label: rounds.get(id)?.roundName || "未設定",
            }))
            .sort((a, b) => a.label.localeCompare(b.label, "ja"));
    }, [matchGroups, rounds]);

    const statusOptions = [...MATCH_GROUP_STATUS_OPTIONS];

    // フィルタリング処理
    const filteredMatchGroups = useMemo(() => {
        return matchGroups.filter((group) => {
            const courtMatch =
                filters.courtIds.length === 0 || filters.courtIds.includes(group.courtId);
            const roundMatch =
                filters.roundIds.length === 0 || filters.roundIds.includes(group.roundId);
            const statusMatch =
                filters.statusValues.length === 0 ||
                (filters.statusValues.includes(MATCH_GROUP_STATUS.COMPLETED) && group.isCompleted) ||
                (filters.statusValues.includes(MATCH_GROUP_STATUS.INCOMPLETE) && !group.isCompleted);
            return courtMatch && roundMatch && statusMatch;
        });
    }, [matchGroups, filters.courtIds, filters.roundIds, filters.statusValues]);

    return {
        selectedCourtIds: filters.courtIds,
        setSelectedCourtIds,
        selectedRoundIds: filters.roundIds,
        setSelectedRoundIds,
        selectedStatusValues: filters.statusValues,
        setSelectedStatusValues,
        courtOptions,
        roundOptions,
        statusOptions,
        filteredMatchGroups,
    };
};
