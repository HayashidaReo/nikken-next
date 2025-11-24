import { useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { SearchableSelect, type SearchableSelectOption } from "@/components/molecules/searchable-select";
import { AnimatedTableRow } from "@/components/atoms/animated-table-row";
import { TableCell } from "@/components/atoms/table";
import { cn } from "@/lib/utils/utils";
import type { Team } from "@/types/team.schema";
import type { Court, Round } from "@/types/tournament.schema";
import type { MatchGroupSetupData } from "@/types/match-setup";

interface MatchGroupRowProps {
    row: MatchGroupSetupData;
    index: number;
    teams: Team[];
    courts: Court[];
    rounds: Round[];
    onUpdate: (index: number, field: keyof MatchGroupSetupData, value: string) => void;
    onRemove: (index: number) => void;
    onSelect: (row: MatchGroupSetupData) => void;
    errors?: string[];
}

export function MatchGroupRow({
    row,
    index,
    teams,
    courts,
    rounds,
    onUpdate,
    onRemove,
    onSelect,
    errors = [],
}: MatchGroupRowProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: row.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const courtOptions: SearchableSelectOption[] = courts.map(c => ({
        value: c.courtId,
        label: c.courtName,
    }));

    const roundOptions: SearchableSelectOption[] = useMemo(
        () => rounds.map(round => ({ value: round.roundId, label: round.roundName })),
        [rounds]
    );
    const selectedRoundValue = useMemo(() => {
        if (row.roundId) return row.roundId;
        const fallback = rounds.find(round => round.roundName === row.roundName);
        if (fallback) return fallback.roundId;
        return row.roundName || "";
    }, [row.roundName, row.roundId, rounds]);

    const roundOptionsWithFallback = useMemo(() => {
        if (!row.roundName) return roundOptions;
        const exists = rounds.some(round => round.roundId === row.roundId || round.roundName === row.roundName);
        if (exists) return roundOptions;
        const fallbackValue = row.roundId || row.roundName;
        return [...roundOptions, { value: fallbackValue, label: `${row.roundName} (未登録)` }];
    }, [roundOptions, row.roundName, row.roundId, rounds]);

    const handleRoundChange = (value: string) => {
        const roundName = rounds.find(round => round.roundId === value)?.roundName || value;
        onUpdate(index, "roundId", value);
        onUpdate(index, "roundName", roundName);
    };

    const teamOptions: SearchableSelectOption[] = teams.map(team => ({
        value: team.teamId,
        label: team.teamName,
    }));

    return (
        <AnimatedTableRow
            ref={setNodeRef}
            style={style}
            className={cn(
                "bg-white",
                isDragging && "opacity-50"
            )}
        >
            <TableCell className="py-2 px-3 text-center cursor-grab active:cursor-grabbing">
                <div {...attributes} {...listeners}>
                    <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </div>
            </TableCell>
            <TableCell className="py-2 px-3 truncate" title={row.courtId}>
                <SearchableSelect
                    value={row.courtId}
                    onValueChange={value => onUpdate(index, "courtId", value)}
                    options={courtOptions}
                    placeholder="コート選択"
                    searchPlaceholder="コート名で検索..."
                    hasError={errors.includes("courtId")}
                />
            </TableCell>
            <TableCell className="py-2 px-3 truncate" title={row.roundName}>
                <SearchableSelect
                    value={selectedRoundValue}
                    onValueChange={handleRoundChange}
                    options={roundOptionsWithFallback}
                    placeholder="ラウンド選択"
                    searchPlaceholder="ラウンド名で検索..."
                    hasError={errors.includes("round") || errors.includes("roundId")}
                />
            </TableCell>
            <TableCell className="py-2 px-3 truncate" title={row.teamAId}>
                <SearchableSelect
                    value={row.teamAId}
                    onValueChange={value => onUpdate(index, "teamAId", value)}
                    options={teamOptions}
                    placeholder="チームA選択"
                    searchPlaceholder="チーム名で検索..."
                    hasError={errors.includes("teamAId")}
                />
            </TableCell>
            <TableCell className="py-2 px-3 truncate" title={row.teamBId}>
                <SearchableSelect
                    value={row.teamBId}
                    onValueChange={value => onUpdate(index, "teamBId", value)}
                    options={teamOptions}
                    placeholder="チームB選択"
                    searchPlaceholder="チーム名で検索..."
                    hasError={errors.includes("teamBId")}
                />
            </TableCell>
            <TableCell className="py-2 px-3 text-center">
                <div className="flex items-center justify-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelect(row)}
                        disabled={!row.teamAId || !row.teamBId}
                    >
                        詳細設定
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove(index)}
                        className="text-red-500 hover:text-red-700 h-8"
                    >
                        <Trash2 className="h-5 w-5" />
                    </Button>
                </div>
            </TableCell>
        </AnimatedTableRow>
    );
}
