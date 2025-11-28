"use client";

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
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { useToast } from "@/components/providers/notification-provider";
import type { MatchGroup } from "@/types/match.schema";
import type { MatchGroupSetupData } from "@/types/match-setup";
import { useMasterData } from "@/components/providers/master-data-provider";

interface MatchGroupSetupTableProps {
    matchGroups: MatchGroup[];
    onSave: (data: MatchGroupSetupData[]) => void;
    onSelect: (group: MatchGroupSetupData) => void;
    isSaving: boolean;
}

export function MatchGroupSetupTable({
    matchGroups,
    onSave,
    onSelect,
    isSaving,
}: MatchGroupSetupTableProps) {
    const { showError } = useToast();
    const { rounds } = useMasterData();
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const [data, setData] = useState<MatchGroupSetupData[]>(() =>
        matchGroups.map((g) => {
            return {
                id: g.matchGroupId || "",
                courtId: g.courtId,
                roundId: g.roundId,
                roundName: rounds.get(g.roundId)?.roundName || g.roundId || "",
                teamAId: g.teamAId,
                teamBId: g.teamBId,
                sortOrder: g.sortOrder,
            };
        })
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



    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [showTeamChangeConfirm, setShowTeamChangeConfirm] = useState(false);

    // 削除された既存対戦の数
    const [deletedGroupCount, setDeletedGroupCount] = useState(0);
    // チーム変更があった既存対戦の数
    const [changedTeamGroupCount, setChangedTeamGroupCount] = useState(0);

    const checkDeleteAndSave = () => {
        // 既存の対戦が削除されている場合は確認ダイアログを表示
        const currentIds = new Set(data.map(d => d.id));
        const count = Array.from(initialGroupIds).filter((id: string) => !currentIds.has(id)).length;

        if (count > 0) {
            setDeletedGroupCount(count);
            setShowSaveConfirm(true);
            return;
        }

        onSave(data);
    };

    const confirmTeamChange = () => {
        setShowTeamChangeConfirm(false);
        checkDeleteAndSave();
    };

    const cancelTeamChange = () => {
        setShowTeamChangeConfirm(false);
    };

    const confirmSave = () => {
        setShowSaveConfirm(false);
        onSave(data);
        setDeletedGroupCount(0);
    };

    const cancelSave = () => {
        setShowSaveConfirm(false);
    };

    const handleSave = () => {
        const newErrors: Record<string, string[]> = {};
        let hasError = false;

        data.forEach(row => {
            const rowErrors: string[] = [];
            if (!row.courtId) rowErrors.push("courtId");
            if (!row.roundId) rowErrors.push("roundId");
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

        // チーム変更のチェック
        const changedGroups = data.filter(row => {
            // 新規作成行はスキップ
            if (row.id.startsWith("group-")) return false;

            const original = matchGroups.find(g => g.matchGroupId === row.id);
            if (!original) return false;

            return original.teamAId !== row.teamAId || original.teamBId !== row.teamBId;
        });

        if (changedGroups.length > 0) {
            setChangedTeamGroupCount(changedGroups.length);
            setShowTeamChangeConfirm(true);
            return;
        }

        checkDeleteAndSave();
    };

    const addRow = () => {
        const maxSortOrder = data.length > 0 ? Math.max(...data.map((d) => d.sortOrder)) : -1;
        setData((prev) => [
            ...prev,
            {
                id: `group-${Date.now()} `,
                courtId: "",
                roundName: "",
                roundId: "",
                teamAId: "",
                teamBId: "",
                sortOrder: maxSortOrder + 1,
            },
        ]);
    };

    // 初期データのIDセット（既存対戦の削除判定用）
    const [initialGroupIds] = useState(() => {
        return new Set(matchGroups.map(g => g.matchGroupId || ""));
    });

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

            <ConfirmDialog
                isOpen={showTeamChangeConfirm}
                title="チーム変更の確認"
                message={`${changedTeamGroupCount}件の対戦でチームが変更されています。保存すると、登録済みの選手情報との整合性が取れなくなる可能性があります。保存してもよろしいですか？`}
                onConfirm={confirmTeamChange}
                onCancel={cancelTeamChange}
                confirmText="保存する"
                cancelText="キャンセル"
                variant="destructive"
            />

            <ConfirmDialog
                isOpen={showSaveConfirm}
                title="対戦の削除確認"
                message={`${deletedGroupCount}件の対戦を削除しました。このまま保存しますか？`}
                onConfirm={confirmSave}
                onCancel={cancelSave}
                confirmText="保存する"
                cancelText="キャンセル"
            />
        </DndContext >
    );
}
