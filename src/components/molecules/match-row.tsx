"use client";

import { useState } from "react";
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
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface MatchRowProps {
    row: MatchSetupData;
    index: number;
    approvedTeams: Team[];
    courts: Array<{ courtId: string; courtName: string }>;
    detectedRowChanges?: { courtId?: boolean; round?: boolean; playerA?: boolean; playerB?: boolean };
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

                <TableCell className="py-2 px-3 truncate" title={row.round}>
                    <div className={cn("rounded-md", detectedRowChanges.round && "ring-2 ring-red-500")}>
                        <SearchableSelect
                            value={row.round}
                            onValueChange={value => onUpdate(index, "round", value)}
                            options={roundOptions}
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
                        <Trash2 className="h-5 w-5 text-gray-500 hover:text-red-500" />
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
