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
import { MATCH_GROUP_SETUP_TABLE_COLUMN_WIDTHS } from "@/lib/ui-constants";
import { Button } from "@/components/atoms/button";
import { Plus } from "lucide-react";
import MatchTable from "@/components/organisms/match-table";
import { MatchGroupRow } from "@/components/molecules/match-group-row";
import { TableRow, TableCell } from "@/components/atoms/table";
import { useToast } from "@/components/providers/notification-provider";
import type { MatchGroup } from "@/types/match.schema";
import type { Team } from "@/types/team.schema";
import type { Court } from "@/types/tournament.schema";
import type { MatchGroupSetupData } from "@/types/match-setup";

interface MatchGroupSetupTableProps {
    teams: Team[];
    courts: Court[];
    matchGroups: MatchGroup[];
    onSave: (data: MatchGroupSetupData[]) => void;
    onSelect: (group: MatchGroupSetupData) => void;
    isSaving: boolean;
}

export function MatchGroupSetupTable({
    teams,
    courts,
    matchGroups,
    onSave,
    onSelect,
    isSaving,
}: MatchGroupSetupTableProps) {
    const { showError } = useToast();
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const [data, setData] = useState<MatchGroupSetupData[]>(() =>
        matchGroups.map((g) => ({
            id: g.matchGroupId || "",
            courtId: g.courtId,
            round: g.round,
            teamAId: g.teamAId,
            teamBId: g.teamBId,
            sortOrder: g.sortOrder,
        }))
    );
    const [activeId, setActiveId] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    const updateData = (index: number, field: keyof MatchGroupSetupData, value: string) => {
        setData((prev) => {
            const newData = [...prev];
            newData[index] = { ...newData[index], [field]: value };
            return newData;
        });
        // もしこのフィールドにエラーがあればクリアする
        if (errors[data[index].id]?.includes(field as string)) {
            setErrors(prev => ({
                ...prev,
                [data[index].id]: prev[data[index].id].filter(f => f !== field)
            }));
        }
    };

    const handleSave = () => {
        const newErrors: Record<string, string[]> = {};
        let hasError = false;

        data.forEach(row => {
            const rowErrors: string[] = [];
            if (!row.courtId) rowErrors.push("courtId");
            if (!row.round) rowErrors.push("round");
            if (!row.teamAId) rowErrors.push("teamAId");
            if (!row.teamBId) rowErrors.push("teamBId");

            if (rowErrors.length > 0) {
                newErrors[row.id] = rowErrors;
                hasError = true;
            }
        });

        setErrors(newErrors);

        if (hasError) {
            showError("すべての項目を入力してください");
            return;
        }

        onSave(data);
    };

    const addRow = () => {
        const maxSortOrder = data.length > 0 ? Math.max(...data.map((d) => d.sortOrder)) : -1;
        setData((prev) => [
            ...prev,
            {
                id: `group-${Date.now()}`,
                courtId: "",
                round: "",
                teamAId: "",
                teamBId: "",
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
        { key: "drag", label: "", width: MATCH_GROUP_SETUP_TABLE_COLUMN_WIDTHS.drag },
        { key: "court", label: "コート", width: MATCH_GROUP_SETUP_TABLE_COLUMN_WIDTHS.courtName },
        { key: "round", label: "ラウンド", width: MATCH_GROUP_SETUP_TABLE_COLUMN_WIDTHS.round },
        { key: "teamA", label: "チームA", width: MATCH_GROUP_SETUP_TABLE_COLUMN_WIDTHS.teamA },
        { key: "teamB", label: "チームB", width: MATCH_GROUP_SETUP_TABLE_COLUMN_WIDTHS.teamB },
        { key: "action", label: "操作", width: MATCH_GROUP_SETUP_TABLE_COLUMN_WIDTHS.action, className: "text-center" },
    ];

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <MatchTable
                title="チーム対戦設定"
                headerRight={
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? "保存中..." : "保存"}
                    </Button>
                }
                columns={columns}
            >
                <SortableContext items={data.map((d) => d.id)} strategy={verticalListSortingStrategy}>
                    {data.map((row, index) => (
                        <MatchGroupRow
                            key={row.id}
                            row={row}
                            index={index}
                            teams={teams}
                            courts={courts}
                            onUpdate={updateData}
                            onRemove={removeRow}
                            onSelect={onSelect}
                            errors={errors[row.id]}
                        />
                    ))}
                </SortableContext>
                <TableRow>
                    <TableCell colSpan={6} className="text-center py-2">
                        <Button variant="outline" size="sm" onClick={addRow}>
                            <Plus className="h-4 w-4 mr-2" />
                            対戦追加
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
                                    <MatchGroupRow
                                        row={activeRow}
                                        index={activeIndex}
                                        teams={teams}
                                        courts={courts}
                                        onUpdate={() => { }}
                                        onRemove={() => { }}
                                        onSelect={() => { }}
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
