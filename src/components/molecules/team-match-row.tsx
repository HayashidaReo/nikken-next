import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { SearchableSelect, type SearchableSelectOption } from "@/components/molecules/searchable-select";
import { AnimatedTableRow } from "@/components/atoms/animated-table-row";
import { TableCell } from "@/components/atoms/table";
import { cn } from "@/lib/utils/utils";
import { TEAM_MATCH_ROUNDS } from "@/lib/constants";
import type { Team } from "@/types/team.schema";
import type { TeamMatchSetupData } from "@/types/match-setup";

interface TeamMatchRowProps {
    row: TeamMatchSetupData;
    index: number;
    teamA: Team;
    teamB: Team;
    onUpdate: (index: number, field: keyof TeamMatchSetupData, value: string) => void;
    onRemove: (index: number) => void;
    errors?: string[];
}

export function TeamMatchRow({
    row,
    index,
    teamA,
    teamB,
    onUpdate,
    onRemove,
    errors = [],
}: TeamMatchRowProps) {
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

    const roundOptions: SearchableSelectOption[] = TEAM_MATCH_ROUNDS.map((r) => ({ value: r, label: r }));

    const playerAOptions: SearchableSelectOption[] = teamA.players.map(player => ({
        value: player.playerId,
        label: player.displayName,
    }));

    const playerBOptions: SearchableSelectOption[] = teamB.players.map(player => ({
        value: player.playerId,
        label: player.displayName,
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
            <TableCell className="py-2 px-3 truncate" title={row.round}>
                <SearchableSelect
                    value={row.round}
                    onValueChange={value => onUpdate(index, "round", value)}
                    options={roundOptions}
                    placeholder="ポジション選択"
                    searchPlaceholder="ポジション名で検索..."
                    hasError={errors.includes("round")}
                />
            </TableCell>
            <TableCell className="py-2 px-3 truncate" title={row.playerAId}>
                <SearchableSelect
                    value={row.playerAId}
                    onValueChange={value => onUpdate(index, "playerAId", value)}
                    options={playerAOptions}
                    placeholder="選手A選択"
                    searchPlaceholder="選手名で検索..."
                    hasError={errors.includes("playerAId")}
                />
            </TableCell>
            <TableCell className="py-2 px-3 text-center text-muted-foreground text-sm">
                vs
            </TableCell>
            <TableCell className="py-2 px-3 truncate" title={row.playerBId}>
                <SearchableSelect
                    value={row.playerBId}
                    onValueChange={value => onUpdate(index, "playerBId", value)}
                    options={playerBOptions}
                    placeholder="選手B選択"
                    searchPlaceholder="選手名で検索..."
                    hasError={errors.includes("playerBId")}
                />
            </TableCell>
            <TableCell className="py-2 px-3 text-center">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(index)}
                    className="text-red-500 hover:text-red-700 h-8"
                >
                    <Trash2 className="h-5 w-5" />
                </Button>
            </TableCell>
        </AnimatedTableRow>
    );
}
