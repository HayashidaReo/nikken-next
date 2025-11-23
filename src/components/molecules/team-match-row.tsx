import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/select";
import { TableRow, TableCell } from "@/components/atoms/table";
import type { Team } from "@/types/team.schema";
import type { Court } from "@/types/tournament.schema";
import type { TeamMatchSetupData } from "@/types/match-setup";

interface TeamMatchRowProps {
    row: TeamMatchSetupData;
    index: number;
    teamA: Team;
    teamB: Team;
    courts: Court[];
    onUpdate: (index: number, field: keyof TeamMatchSetupData, value: string) => void;
    onRemove: (index: number) => void;
}

export function TeamMatchRow({
    row,
    index,
    teamA,
    teamB,
    courts,
    onUpdate,
    onRemove,
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
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <TableRow ref={setNodeRef} style={style} className="group bg-white">
            <TableCell className="w-10 text-center">
                <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 flex justify-center">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                </div>
            </TableCell>
            <TableCell>
                <Select
                    value={row.courtId}
                    onValueChange={(value) => onUpdate(index, "courtId", value)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="コート選択" />
                    </SelectTrigger>
                    <SelectContent>
                        {courts.map((court) => (
                            <SelectItem key={court.courtId} value={court.courtId}>
                                {court.courtName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </TableCell>
            <TableCell>
                <Input
                    value={row.round}
                    onChange={(e) => onUpdate(index, "round", e.target.value)}
                    placeholder="回戦"
                />
            </TableCell>
            <TableCell>
                <Select
                    value={row.playerAId}
                    onValueChange={(value) => onUpdate(index, "playerAId", value)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="選手A選択" />
                    </SelectTrigger>
                    <SelectContent>
                        {teamA.players.map((player) => (
                            <SelectItem key={player.playerId} value={player.playerId}>
                                {player.displayName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </TableCell>
            <TableCell>
                <Select
                    value={row.playerBId}
                    onValueChange={(value) => onUpdate(index, "playerBId", value)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="選手B選択" />
                    </SelectTrigger>
                    <SelectContent>
                        {teamB.players.map((player) => (
                            <SelectItem key={player.playerId} value={player.playerId}>
                                {player.displayName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </TableCell>
            <TableCell className="text-center">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </TableCell>
        </TableRow>
    );
}
