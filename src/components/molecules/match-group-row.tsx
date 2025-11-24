import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { SearchableSelect, type SearchableSelectOption } from "@/components/molecules/searchable-select";
import { AnimatedTableRow } from "@/components/atoms/animated-table-row";
import { TableCell } from "@/components/atoms/table";
import { cn } from "@/lib/utils/utils";
import type { Team } from "@/types/team.schema";
import type { Court } from "@/types/tournament.schema";
import type { MatchGroupSetupData } from "@/types/match-setup";

interface MatchGroupRowProps {
    row: MatchGroupSetupData;
    index: number;
    teams: Team[];
    courts: Court[];
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

    const roundOptions: SearchableSelectOption[] = [
        { value: "予選1回戦", label: "予選1回戦" },
        { value: "予選2回戦", label: "予選2回戦" },
        { value: "予選3回戦", label: "予選3回戦" },
        { value: "予選4回戦", label: "予選4回戦" },
        { value: "決勝トーナメント1回戦", label: "決勝トーナメント1回戦" },
        { value: "決勝トーナメント2回戦", label: "決勝トーナメント2回戦" },
        { value: "準決勝", label: "準決勝" },
        { value: "決勝", label: "決勝" },
    ];

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
            <TableCell className="py-2 px-3 truncate" title={row.round}>
                <SearchableSelect
                    value={row.round}
                    onValueChange={value => onUpdate(index, "round", value)}
                    options={roundOptions}
                    placeholder="ラウンド選択"
                    searchPlaceholder="ラウンド名で検索..."
                    hasError={errors.includes("round")}
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
