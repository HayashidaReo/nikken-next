"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/atoms/button";
import { SearchableSelect, type SearchableSelectOption } from "@/components/molecules/searchable-select";
import {
    TableCell,
} from "@/components/atoms/table";
import { AnimatedTableRow } from "@/components/atoms/animated-table-row";
import { Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import type { MatchSetupData } from "@/lib/utils/match-conflict-detection";
import type { Team, Player } from "@/types/team.schema";
import type { Round } from "@/types/tournament.schema";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface MatchRowProps {
    row: MatchSetupData;
    index: number;
    approvedTeams: Team[];
    courts: Array<{ courtId: string; courtName: string }>;
    rounds: Round[];
    detectedRowChanges?: { courtId?: boolean; round?: boolean; playerA?: boolean; playerB?: boolean; sortOrder?: boolean };
    isAdded?: boolean;
    isDeleted?: boolean;
    getPlayersFromTeam: (teamId: string) => Player[];
    onUpdate: (index: number, field: keyof MatchSetupData, value: string) => void;
    onRemove: (index: number) => void;
}

export function MatchRow({
    row,
    index,
    approvedTeams,
    courts,
    rounds,
    detectedRowChanges = {},
    isAdded = false,
    isDeleted = false,
    getPlayersFromTeam,
    onUpdate,
    onRemove,
}: MatchRowProps) {
    const [showConfirm, setShowConfirm] = useState(false);

    // ドラッグ＆ドロップ機能のセットアップ
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

    // Prepare options for searchable selects
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

    const teamOptions: SearchableSelectOption[] = approvedTeams.map(team => ({
        value: team.teamId,
        label: team.teamName,
    }));

    const playerAOptions: SearchableSelectOption[] = getPlayersFromTeam(row.playerATeamId).map(player => ({
        value: player.playerId,
        label: player.displayName,
    }));

    const playerBOptions: SearchableSelectOption[] = getPlayersFromTeam(row.playerBTeamId).map(player => ({
        value: player.playerId,
        label: player.displayName,
    }));

    return (
        <>
            <AnimatedTableRow
                ref={setNodeRef}
                style={style}
                className={cn(
                    "bg-white",
                    isAdded && "bg-green-50 border-l-4 border-l-green-500",
                    isDeleted && "bg-red-50 border-l-4 border-l-red-500 line-through opacity-60",
                    detectedRowChanges.sortOrder && !isAdded && !isDeleted && "bg-red-50",
                    isDragging && "opacity-50"
                )}
            >
                <TableCell className="py-2 px-3 text-center cursor-grab active:cursor-grabbing">
                    <div {...attributes} {...listeners}>
                        <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    </div>
                </TableCell>
                <TableCell className="py-2 px-3 truncate" title={row.courtId}>
                    <div className={cn("rounded-md", detectedRowChanges.courtId && "ring-2 ring-red-500")}>
                        <SearchableSelect
                            value={row.courtId}
                            onValueChange={value => onUpdate(index, "courtId", value)}
                            options={courtOptions}
                            placeholder="コート選択"
                            searchPlaceholder="コート名で検索..."
                        />
                    </div>
                </TableCell>

                <TableCell className="py-2 px-3 truncate" title={row.roundName}>
                    <div className={cn("rounded-md", detectedRowChanges.round && "ring-2 ring-red-500")}>
                        <SearchableSelect
                            value={selectedRoundValue}
                            onValueChange={handleRoundChange}
                            options={roundOptionsWithFallback}
                            placeholder="ラウンド選択"
                            searchPlaceholder="ラウンド名で検索..."
                        />
                    </div>
                </TableCell>

                <TableCell className="py-2 px-3 truncate" title={row.playerATeamId}>
                    <SearchableSelect
                        value={row.playerATeamId}
                        onValueChange={value => onUpdate(index, "playerATeamId", value)}
                        options={teamOptions}
                        placeholder="チーム選択"
                        searchPlaceholder="チーム名で検索..."
                    />
                </TableCell>

                <TableCell className="py-2 px-3 truncate" title={row.playerAId}>
                    <div className={cn("rounded-md", detectedRowChanges.playerA && "ring-2 ring-red-500")}>
                        <SearchableSelect
                            value={row.playerAId}
                            onValueChange={value => onUpdate(index, "playerAId", value)}
                            options={playerAOptions}
                            placeholder="選手選択"
                            searchPlaceholder="選手名で検索..."
                            disabled={!row.playerATeamId}
                        />
                    </div>
                </TableCell>

                <TableCell className="py-2 px-3 truncate" title={row.playerBTeamId}>
                    <SearchableSelect
                        value={row.playerBTeamId}
                        onValueChange={value => onUpdate(index, "playerBTeamId", value)}
                        options={teamOptions}
                        placeholder="チーム選択"
                        searchPlaceholder="チーム名で検索..."
                    />
                </TableCell>

                <TableCell className="py-2 px-3 truncate" title={row.playerBId}>
                    <div className={cn("rounded-md", detectedRowChanges.playerB && "ring-2 ring-red-500")}>
                        <SearchableSelect
                            value={row.playerBId}
                            onValueChange={value => onUpdate(index, "playerBId", value)}
                            options={playerBOptions}
                            placeholder="選手選択"
                            searchPlaceholder="選手名で検索..."
                            disabled={!row.playerBTeamId}
                        />
                    </div>
                </TableCell>

                <TableCell className="py-2 px-3 text-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowConfirm(true)}
                        className="text-red-500 hover:text-red-700 h-8"
                    >
                        <Trash2 className="h-5 w-5" aria-hidden />
                    </Button>
                </TableCell>
            </AnimatedTableRow>
            {showConfirm && (
                <ConfirmDialog
                    isOpen={showConfirm}
                    title="試合を削除しますか？"
                    message="この操作は取り消せません。本当にこの試合を削除してよいですか？"
                    onConfirm={() => {
                        onRemove(index);
                        setShowConfirm(false);
                    }}
                    onCancel={() => setShowConfirm(false)}
                    confirmText="削除"
                    cancelText="キャンセル"
                    variant="destructive"
                />
            )}
        </>
    );
}
