import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/select";
import { TableRow, TableCell } from "@/components/atoms/table";
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
}

export function MatchGroupRow({
    row,
    index,
    teams,
    courts,
    onUpdate,
    onRemove,
    onSelect,
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
                    value={row.teamAId}
                    onValueChange={(value) => onUpdate(index, "teamAId", value)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="チームA選択" />
                    </SelectTrigger>
                    <SelectContent>
                        {teams.map((team) => (
                            <SelectItem key={team.teamId} value={team.teamId}>
                                {team.teamName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </TableCell>
            <TableCell>
                <Select
                    value={row.teamBId}
                    onValueChange={(value) => onUpdate(index, "teamBId", value)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="チームB選択" />
                    </SelectTrigger>
                    <SelectContent>
                        {teams.map((team) => (
                            <SelectItem key={team.teamId} value={team.teamId}>
                                {team.teamName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </TableCell>
            <TableCell className="text-center">
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
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}
