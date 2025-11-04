"use client";

import { Button } from "@/components/atoms/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/atoms/select";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import type { MatchSetupData } from "@/lib/utils/match-conflict-detection";
import type { Team, Player } from "@/types/team.schema";

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
    return (
        <tr
            className={cn(
                isAdded && "bg-green-50 border-l-4 border-l-green-500",
                isDeleted && "bg-red-50 border-l-4 border-l-red-500 line-through opacity-60"
            )}
        >
            <td>
                <div className={cn("rounded-md", detectedRowChanges.courtId && "ring-2 ring-red-500")}>
                    <Select value={row.courtId} onValueChange={value => onUpdate(index, "courtId", value)}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="コート選択" />
                        </SelectTrigger>
                        <SelectContent>
                            {courts.map(c => (
                                <SelectItem key={c.courtId} value={c.courtId}>
                                    {c.courtName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </td>

            <td>
                <div className={cn("rounded-md", detectedRowChanges.round && "ring-2 ring-red-500")}>
                    <Select value={row.round} onValueChange={value => onUpdate(index, "round", value)}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="回戦選択" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="予選1回戦">予選1回戦</SelectItem>
                            <SelectItem value="予選2回戦">予選2回戦</SelectItem>
                            <SelectItem value="決勝トーナメント1回戦">決勝トーナメント1回戦</SelectItem>
                            <SelectItem value="決勝トーナメント2回戦">決勝トーナメント2回戦</SelectItem>
                            <SelectItem value="準決勝">準決勝</SelectItem>
                            <SelectItem value="決勝">決勝</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </td>

            <td>
                <Select value={row.playerATeamId} onValueChange={value => onUpdate(index, "playerATeamId", value)}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="チーム選択" />
                    </SelectTrigger>
                    <SelectContent>
                        {approvedTeams.map(team => (
                            <SelectItem key={team.teamId} value={team.teamId}>
                                {team.teamName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </td>

            <td>
                <div className={cn("rounded-md", detectedRowChanges.playerA && "ring-2 ring-red-500")}>
                    <Select
                        value={row.playerAId}
                        onValueChange={value => onUpdate(index, "playerAId", value)}
                        disabled={!row.playerATeamId}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="選手選択" />
                        </SelectTrigger>
                        <SelectContent>
                            {getPlayersFromTeam(row.playerATeamId).map(player => (
                                <SelectItem key={player.playerId} value={player.playerId}>
                                    {player.displayName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </td>

            <td>
                <Select value={row.playerBTeamId} onValueChange={value => onUpdate(index, "playerBTeamId", value)}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="チーム選択" />
                    </SelectTrigger>
                    <SelectContent>
                        {approvedTeams.map(team => (
                            <SelectItem key={team.teamId} value={team.teamId}>
                                {team.teamName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </td>

            <td>
                <div className={cn("rounded-md", detectedRowChanges.playerB && "ring-2 ring-red-500")}>
                    <Select
                        value={row.playerBId}
                        onValueChange={value => onUpdate(index, "playerBId", value)}
                        disabled={!row.playerBTeamId}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="選手選択" />
                        </SelectTrigger>
                        <SelectContent>
                            {getPlayersFromTeam(row.playerBTeamId).map(player => (
                                <SelectItem key={player.playerId} value={player.playerId}>
                                    {player.displayName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </td>

            <td>
                <Button variant="ghost" size="sm" onClick={() => onRemove(index)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </td>
        </tr>
    );
}
