import { useState, useMemo } from "react";
import type { MatchGroup } from "@/types/match.schema";
import { useMasterData } from "@/components/providers/master-data-provider";

export const useMatchGroupFilter = (matchGroups: MatchGroup[]) => {
    const { courts, rounds } = useMasterData();
    const [selectedCourtIds, setSelectedCourtIds] = useState<string[]>([]);
    const [selectedRoundIds, setSelectedRoundIds] = useState<string[]>([]);

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

    // フィルタリング処理
    const filteredMatchGroups = useMemo(() => {
        return matchGroups.filter((group) => {
            const courtMatch =
                selectedCourtIds.length === 0 || selectedCourtIds.includes(group.courtId);
            const roundMatch =
                selectedRoundIds.length === 0 || selectedRoundIds.includes(group.roundId);
            return courtMatch && roundMatch;
        });
    }, [matchGroups, selectedCourtIds, selectedRoundIds]);

    return {
        selectedCourtIds,
        setSelectedCourtIds,
        selectedRoundIds,
        setSelectedRoundIds,
        courtOptions,
        roundOptions,
        filteredMatchGroups,
    };
};
