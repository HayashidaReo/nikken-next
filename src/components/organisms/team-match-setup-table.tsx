import { useState } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    DragEndEvent,
    DragStartEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";
import { Button } from "@/components/atoms/button";
import { Plus } from "lucide-react";
import MatchTable from "@/components/organisms/match-table";
import { TeamMatchRow } from "@/components/molecules/team-match-row";
import { TableRow, TableCell } from "@/components/atoms/table";
import type { TeamMatch } from "@/types/match.schema";
import type { Team } from "@/types/team.schema";
import type { Court } from "@/types/tournament.schema";
import type { TeamMatchSetupData } from "@/types/match-setup";

interface TeamMatchSetupTableProps {
    teamA: Team;
    teamB: Team;
    courts: Court[];
    matches: TeamMatch[];
    onSave: (data: TeamMatchSetupData[]) => void;
    isSaving: boolean;
}

export function TeamMatchSetupTable({
    teamA,
    teamB,
    courts,
    matches,
    onSave,
    isSaving,
}: TeamMatchSetupTableProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const [data, setData] = useState<TeamMatchSetupData[]>(() =>
        matches.map((m) => ({
            id: m.matchId || "",
            courtId: m.courtId,
            round: m.round,
            playerAId: m.players.playerA.playerId,
            playerBId: m.players.playerB.playerId,
            sortOrder: m.sortOrder,
        }))
    );
    const [activeId, setActiveId] = useState<string | null>(null);

    const updateData = (index: number, field: keyof TeamMatchSetupData, value: string) => {
        setData((prev) => {
            const newData = [...prev];
            newData[index] = { ...newData[index], [field]: value };
            return newData;
        });
    };

    const addRow = () => {
        const maxSortOrder = data.length > 0 ? Math.max(...data.map((d) => d.sortOrder)) : -1;
        setData((prev) => [
            ...prev,
            {
                id: `match-${Date.now()}`,
                courtId: "",
                round: "",
                playerAId: "",
                playerBId: "",
                sortOrder: maxSortOrder + 1,
            },
        ]);
    };

    const removeRow = (index: number) => {
        setData((prev) => prev.filter((_, i) => i !== index));
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setData((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const reorderedItems = arrayMove(items, oldIndex, newIndex);
                return reorderedItems.map((item, idx) => ({ ...item, sortOrder: idx }));
            });
        }
        setActiveId(null);
    };

    const columns = [
        { key: "drag", label: "", width: 40 },
        { key: "court", label: "コート", width: 150 },
        { key: "round", label: "回戦", width: 100 },
        { key: "playerA", label: "選手A", width: 200 },
        { key: "playerB", label: "選手B", width: 200 },
        { key: "action", label: "操作", width: 150, className: "text-center" },
    ];

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <MatchTable
                title={`${teamA.teamName} vs ${teamB.teamName}`}
                headerRight={
                    <Button onClick={() => onSave(data)} disabled={isSaving}>
                        {isSaving ? "保存中..." : "保存"}
                    </Button>
                }
                columns={columns}
            >
                <SortableContext items={data.map((d) => d.id)} strategy={verticalListSortingStrategy}>
                    {data.map((row, index) => (
                        <TeamMatchRow
                            key={row.id}
                            row={row}
                            index={index}
                            teamA={teamA}
                            teamB={teamB}
                            courts={courts}
                            onUpdate={updateData}
                            onRemove={removeRow}
                        />
                    ))}
                </SortableContext>
                <TableRow>
                    <TableCell colSpan={6} className="text-center py-2">
                        <Button variant="outline" size="sm" onClick={addRow}>
                            <Plus className="h-4 w-4 mr-2" />
                            試合追加
                        </Button>
                    </TableCell>
                </TableRow>
            </MatchTable>
            <DragOverlay>
                {activeId ? (
                    <table className="w-full bg-white border shadow-lg">
                        <tbody>
                            {(() => {
                                const activeRow = data.find(row => row.id === activeId);
                                const activeIndex = data.findIndex(row => row.id === activeId);
                                if (!activeRow) return null;
                                return (
                                    <TeamMatchRow
                                        row={activeRow}
                                        index={activeIndex}
                                        teamA={teamA}
                                        teamB={teamB}
                                        courts={courts}
                                        onUpdate={() => { }}
                                        onRemove={() => { }}
                                    />
                                );
                            })()}
                        </tbody>
                    </table>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
