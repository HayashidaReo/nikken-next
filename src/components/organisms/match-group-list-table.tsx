"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";
import { TableRow, TableCell } from "@/components/atoms/table";
import PlayerCell from "@/components/molecules/player-cell";
import MatchTable from "@/components/organisms/match-table";
import { Button } from "@/components/atoms/button";
import { ArrowRight, Check } from "lucide-react";
import type { MatchGroup } from "@/types/match.schema";
import { useMasterData } from "@/components/providers/master-data-provider";
import { MultiSelectDropdown } from "@/components/molecules/multi-select-dropdown";
import { useMatchGroupFilter } from "@/hooks/useMatchGroupFilter";
import { MATCH_GROUP_LIST_TABLE_COLUMN_WIDTHS } from "@/lib/ui-constants";

import { ShareMenu } from "@/components/molecules/share-menu";
import { useAuth } from "@/hooks/useAuth";
import { useActiveTournament } from "@/store/use-active-tournament-store";

import { MatchActionMenu } from "@/components/molecules/match-action-menu";
import { MatchGroupEditDialog } from "./match-group-edit-dialog";
import { useState } from "react";

interface MatchGroupListTableProps {
    matchGroups: MatchGroup[];
    tournamentName: string;
    className?: string;
}

export function MatchGroupListTable({ matchGroups, tournamentName, className }: MatchGroupListTableProps) {
    const router = useRouter();
    const { user } = useAuth();
    const { activeTournamentId } = useActiveTournament();
    const [editingGroup, setEditingGroup] = useState<MatchGroup | null>(null);

    // orgIdはユーザーID、tournamentIdはアクティブな大会IDを使用
    const orgId = user?.uid;
    const tournamentId = activeTournamentId;

    const { teams, courts, rounds } = useMasterData();
    const {
        selectedCourtIds,
        setSelectedCourtIds,
        selectedRoundIds,
        setSelectedRoundIds,
        selectedStatusValues,
        setSelectedStatusValues,
        courtOptions,
        roundOptions,
        statusOptions,
        filteredMatchGroups,
    } = useMatchGroupFilter(matchGroups);

    return (
        <>
            <MatchTable
                title={tournamentName}
                headerRight={
                    <ShareMenu
                        itemName="トーナメント表"
                        sharePath={`/tournament-bracket/${orgId}/${tournamentId}`}
                    />
                }
                columns={[
                    {
                        key: "status",
                        label: (
                            <MultiSelectDropdown
                                label="終了"
                                options={statusOptions}
                                selectedValues={selectedStatusValues}
                                onSelectionChange={setSelectedStatusValues}
                            />
                        ),
                        width: MATCH_GROUP_LIST_TABLE_COLUMN_WIDTHS.status,
                        className: "text-center",
                    },
                    {
                        key: "court",
                        label: (
                            <MultiSelectDropdown
                                label="コート名"
                                options={courtOptions}
                                selectedValues={selectedCourtIds}
                                onSelectionChange={setSelectedCourtIds}
                            />
                        ),
                        width: MATCH_GROUP_LIST_TABLE_COLUMN_WIDTHS.court,
                    },
                    {
                        key: "round",
                        label: (
                            <MultiSelectDropdown
                                label="回戦"
                                options={roundOptions}
                                selectedValues={selectedRoundIds}
                                onSelectionChange={setSelectedRoundIds}
                            />
                        ),
                        width: MATCH_GROUP_LIST_TABLE_COLUMN_WIDTHS.round,
                    },
                    { key: "teamA", label: "チームA", width: MATCH_GROUP_LIST_TABLE_COLUMN_WIDTHS.teamA },
                    { key: "vs", label: "", width: MATCH_GROUP_LIST_TABLE_COLUMN_WIDTHS.vs, className: "text-center" },
                    { key: "teamB", label: "チームB", width: MATCH_GROUP_LIST_TABLE_COLUMN_WIDTHS.teamB },
                    { key: "action", label: "詳細", width: MATCH_GROUP_LIST_TABLE_COLUMN_WIDTHS.action, className: "text-center" },
                    { key: "others", label: "その他", width: MATCH_GROUP_LIST_TABLE_COLUMN_WIDTHS.others, className: "text-center" },
                ]}
                className={className}
            >
                {filteredMatchGroups.map((group) => {
                    const courtName = courts.get(group.courtId)?.courtName || "";
                    const roundName = rounds.get(group.roundId)?.roundName || "";
                    const teamAName = teams.get(group.teamAId)?.teamName || "不明なチーム";
                    const teamBName = teams.get(group.teamBId)?.teamName || "不明なチーム";

                    return (
                        <TableRow key={group.matchGroupId}>
                            <TableCell className="p-2 text-center">
                                <div className="flex items-center justify-center">
                                    {group.isCompleted ? (
                                        <Check className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <Check className="h-5 w-5 text-gray-300" />
                                    )}
                                </div>
                            </TableCell>
                            <PlayerCell text={courtName} title={courtName} />
                            <PlayerCell text={roundName} title={roundName} />
                            <PlayerCell text={teamAName} title={teamAName} />
                            <TableCell className="p-0 text-center">
                                <div className="flex items-center justify-center h-full text-gray-400 font-bold">vs</div>
                            </TableCell>
                            <PlayerCell text={teamBName} title={teamBName} />
                            <TableCell className="p-2 text-center">
                                <div className="flex items-center justify-center">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => router.push(`?matchGroupId=${group.matchGroupId}`)}
                                    >
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                            <TableCell className="p-2 text-center">
                                <div className="flex items-center justify-center">
                                    <MatchActionMenu onEdit={() => setEditingGroup(group)} />
                                </div>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </MatchTable>

            {editingGroup && (
                <MatchGroupEditDialog
                    isOpen={!!editingGroup}
                    onClose={() => setEditingGroup(null)}
                    matchGroup={editingGroup}
                    teamAName={teams.get(editingGroup.teamAId)?.teamName || "不明なチーム"}
                    teamBName={teams.get(editingGroup.teamBId)?.teamName || "不明なチーム"}
                />
            )}
        </>
    );
}

export const MatchGroupListTableMemo = memo(MatchGroupListTable);
