"use client";

import { useState, useMemo } from "react";
import MatchTable from "@/components/organisms/match-table";
import { MatchRow } from "@/components/molecules/match-row";
import { SaveControls } from "@/components/molecules/match-setup-controls";
import { ConflictSummary } from "@/components/molecules/conflict-summary";
import { Button } from "@/components/atoms/button";
import { AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { TableRow, TableCell } from "@/components/atoms/table";
import { MATCH_SETUP_TABLE_COLUMN_WIDTHS } from "@/lib/ui-constants";
import type { Team, Player } from "@/types/team.schema";
import type { Match } from "@/types/match.schema";
import type { DetectedChanges } from "@/lib/utils/match-conflict-detection";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { arrayMove } from "@dnd-kit/sortable";

interface MatchSetupData {
  id: string;
  courtId: string;
  round: string;
  playerATeamId: string;
  playerAId: string;
  playerBTeamId: string;
  playerBId: string;
  sortOrder: number;
}

interface MatchSetupTableProps {
  teams: Team[];
  courts: Array<{ courtId: string; courtName: string }>;
  matches: Match[];
  onSave: (matches: MatchSetupData[]) => void;
  isSaving?: boolean;
  className?: string;
  detectedChanges?: DetectedChanges;
  detectedCount?: number;
  onOpenUpdateDialog?: () => void;
}

// レンダリングごとに新しい関数を生成しないための定義
const noop = () => { };

export function MatchSetupTable({
  teams,
  courts,
  matches,
  onSave,
  isSaving = false,
  className,
  detectedChanges = { fieldChanges: {}, addedMatches: [], deletedMatches: [] },
  detectedCount = 0,
  onOpenUpdateDialog,
}: MatchSetupTableProps) {
  // ドラッグ＆ドロップのセンサー設定
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 承認済みのチームのみフィルター
  const approvedTeams = teams.filter(team => team.isApproved); // 初期データを作成
  const initialData = useMemo(() => {
    return matches
      .map(match => ({
        id: match.matchId || "", // undefined の場合は空文字列
        courtId: match.courtId,
        round: match.round,
        playerATeamId: match.players.playerA.teamId,
        playerAId: match.players.playerA.playerId,
        playerBTeamId: match.players.playerB.teamId,
        playerBId: match.players.playerB.playerId,
        sortOrder: match.sortOrder,
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [matches]);

  // data の初期化と更新
  // ID構成のハッシュキーを計算（追加・削除の検知用）
  const matchIdsKey = useMemo(
    () => initialData.map(d => d.id).sort().join(','),
    [initialData]
  );

  const [data, setData] = useState<MatchSetupData[]>(initialData);
  const [lastMatchIdsKey, setLastMatchIdsKey] = useState<string>(matchIdsKey);
  const [lastInitialData, setLastInitialData] = useState<MatchSetupData[]>(initialData);
  const [activeId, setActiveId] = useState<string | null>(null);

  // detectedChanges の情報をキャプチャして保持（クリアされる前に）
  const [capturedChanges, setCapturedChanges] = useState<typeof detectedChanges.fieldChanges>({});
  const detectedChangesCount = Object.keys(detectedChanges.fieldChanges).length;
  const capturedChangesCount = Object.keys(capturedChanges).length;

  // detectedChanges が空でない場合はキャプチャ
  if (detectedChangesCount > 0 &&
    JSON.stringify(detectedChanges.fieldChanges) !== JSON.stringify(capturedChanges)) {
    setCapturedChanges(detectedChanges.fieldChanges);
  }

  // detectedChanges がクリアされ、かつキャプチャが残っている場合
  // マージ処理が完了したか、却下されたのでキャプチャもクリア
  if (detectedChangesCount === 0 && capturedChangesCount > 0) {
    // initialData が変わった場合（マージ完了後）、または変わらない場合（却下後）どちらもクリア
    setCapturedChanges({});
  }

  // ID構成が変わった場合（追加・削除）は全体を更新
  if (matchIdsKey !== lastMatchIdsKey) {
    setData(initialData);
    setLastMatchIdsKey(matchIdsKey);
    setLastInitialData(initialData);
    setCapturedChanges({}); // リセット
  }
  // フィールド変更の場合は、変更されたフィールドのみを選択的に更新
  else if (initialData !== lastInitialData) {
    setData(prevData => {
      return prevData.map(row => {
        const newRow = initialData.find(d => d.id === row.id);
        if (!newRow) return row;

        // キャプチャした変更情報から、変更があったフィールドを特定
        const changes = capturedChanges[row.id];
        if (!changes) return row;

        // 変更されたフィールドのみを更新（ユーザーの編集内容は保持）
        const updatedRow = { ...row };
        if (changes.courtId) updatedRow.courtId = newRow.courtId;
        if (changes.round) updatedRow.round = newRow.round;
        if (changes.playerA) {
          updatedRow.playerATeamId = newRow.playerATeamId;
          updatedRow.playerAId = newRow.playerAId;
        }
        if (changes.playerB) {
          updatedRow.playerBTeamId = newRow.playerBTeamId;
          updatedRow.playerBId = newRow.playerBId;
        }

        return updatedRow;
      });
    });
    setLastInitialData(initialData);
  }



  // チームから選手を取得する関数
  const getPlayersFromTeam = (teamId: string): Player[] => {
    const team = approvedTeams.find(t => t.teamId === teamId);
    return team ? team.players : [];
  };

  // データを更新する関数
  const updateData = (
    rowIndex: number,
    field: keyof MatchSetupData,
    value: string
  ) => {
    setData(prev =>
      prev.map((row, index) => {
        if (index === rowIndex) {
          const newRow = { ...row, [field]: value };

          // チームが変更された場合は対応する選手もリセット
          if (field === "playerATeamId") {
            newRow.playerAId = "";
          } else if (field === "playerBTeamId") {
            newRow.playerBId = "";
          }

          return newRow;
        }
        return row;
      })
    );
  };

  const addRow = () => {
    const maxSortOrder = data.length > 0 ? Math.max(...data.map(d => d.sortOrder)) : -1;
    const newRow: MatchSetupData = {
      id: `match-${Date.now()}`,
      courtId: "",
      round: "",
      playerATeamId: "",
      playerAId: "",
      playerBTeamId: "",
      playerBId: "",
      sortOrder: maxSortOrder + 1,
    };
    setData(prev => [...prev, newRow]);
  };

  const removeRow = (index: number) => {
    setData(prev => prev.filter((_, i) => i !== index));
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

        // sortOrderを再割り当て
        return reorderedItems.map((item, idx) => ({
          ...item,
          sortOrder: idx,
        }));
      });
    }

    setActiveId(null);
  };

  const handleSave = () => {
    onSave(data);
  };

  // 赤枠がある場合は保存ボタンを無効化
  const hasConflicts =
    Object.keys(detectedChanges.fieldChanges).length > 0 ||
    detectedChanges.addedMatches.length > 0 ||
    detectedChanges.deletedMatches.length > 0;

  // カラム定義を一度だけ作成して再利用
  const columns = [
    { key: "drag", label: "", width: MATCH_SETUP_TABLE_COLUMN_WIDTHS.drag },
    { key: "court", label: "コート", width: MATCH_SETUP_TABLE_COLUMN_WIDTHS.courtName },
    { key: "round", label: "ラウンド", width: MATCH_SETUP_TABLE_COLUMN_WIDTHS.round },
    { key: "playerATeam", label: "選手A所属", width: MATCH_SETUP_TABLE_COLUMN_WIDTHS.playerATeam },
    { key: "playerAName", label: "選手A", width: MATCH_SETUP_TABLE_COLUMN_WIDTHS.playerAName },
    { key: "playerBTeam", label: "選手B所属", width: MATCH_SETUP_TABLE_COLUMN_WIDTHS.playerBTeam },
    { key: "playerBName", label: "選手B", width: MATCH_SETUP_TABLE_COLUMN_WIDTHS.playerBName },
    { key: "action", label: "削除", width: MATCH_SETUP_TABLE_COLUMN_WIDTHS.action, className: "text-center" },
  ];

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <MatchTable
        title="試合組み合わせ設定"
        headerRight={
          <div className="flex items-center gap-4">
            <ConflictSummary count={detectedCount} onOpenUpdateDialog={onOpenUpdateDialog ?? noop} />
            <SaveControls onAdd={addRow} onSave={handleSave} isSaving={isSaving} hasConflicts={hasConflicts} showAdd={false} />
          </div>
        }
        columns={columns}
        className={className}
      >
        <SortableContext
          items={data.map(d => d.id)}
          strategy={verticalListSortingStrategy}
        >
          <AnimatePresence>
            {data.map((row, index) => {
              const isAddedMatch = detectedChanges.addedMatches.some(m => m.matchId === row.id);
              const isDeletedMatch = detectedChanges.deletedMatches.some(m => m.matchId === row.id);
              const rowChanges = detectedChanges.fieldChanges[row.id] || {};

              return (
                <MatchRow
                  key={row.id}
                  row={row}
                  index={index}
                  approvedTeams={approvedTeams}
                  courts={courts}
                  detectedRowChanges={{
                    courtId: Boolean(rowChanges.courtId),
                    round: Boolean(rowChanges.round),
                    playerA: Boolean(rowChanges.playerA),
                    playerB: Boolean(rowChanges.playerB),
                    sortOrder: Boolean(rowChanges.sortOrder),
                  }}
                  isAdded={isAddedMatch}
                  isDeleted={isDeletedMatch}
                  getPlayersFromTeam={getPlayersFromTeam}
                  onUpdate={updateData}
                  onRemove={removeRow}
                />
              );
            })}
          </AnimatePresence>
        </SortableContext>

        {/* テーブルの最後尾に「試合追加」ボタンを置くための行 */}
        <TableRow>
          <TableCell className="py-2 px-3" colSpan={Object.keys(MATCH_SETUP_TABLE_COLUMN_WIDTHS).length}>
            <div className="flex justify-center">
              <Button onClick={addRow} variant="outline" size="sm" className="w-100 justify-center">
                <Plus className="h-4 w-4 mr-2" />
                試合追加
              </Button>
            </div>
          </TableCell>
        </TableRow>
      </MatchTable>

      <DragOverlay>
        {activeId ? (
          <table className="w-full">
            <tbody>
              {(() => {
                const activeRow = data.find(row => row.id === activeId);
                if (!activeRow) return null;
                const activeIndex = data.findIndex(row => row.id === activeId);
                const rowChanges = detectedChanges.fieldChanges[activeRow.id] || {};

                return (
                  <MatchRow
                    row={activeRow}
                    index={activeIndex}
                    approvedTeams={approvedTeams}
                    courts={courts}
                    detectedRowChanges={{
                      courtId: Boolean(rowChanges.courtId),
                      round: Boolean(rowChanges.round),
                      playerA: Boolean(rowChanges.playerA),
                      playerB: Boolean(rowChanges.playerB),
                      sortOrder: Boolean(rowChanges.sortOrder),
                    }}
                    isAdded={false}
                    isDeleted={false}
                    getPlayersFromTeam={getPlayersFromTeam}
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
