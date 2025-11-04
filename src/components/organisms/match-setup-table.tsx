"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/atoms/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/atoms/table";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import type { Team, Player } from "@/types/team.schema";
import type { Match } from "@/types/match.schema";
import type { DetectedChanges } from "@/lib/utils/match-conflict-detection";

interface MatchSetupData {
  id: string;
  courtId: string;
  round: string;
  playerATeamId: string;
  playerAId: string;
  playerBTeamId: string;
  playerBId: string;
}

interface MatchSetupTableProps {
  teams: Team[];
  courts: Array<{ courtId: string; courtName: string }>;
  matches: Match[];
  onSave: (matches: MatchSetupData[]) => void;
  isSaving?: boolean;
  className?: string;
  detectedChanges?: DetectedChanges;
}

export function MatchSetupTable({
  teams,
  courts,
  matches,
  onSave,
  isSaving = false,
  className,
  detectedChanges = { fieldChanges: {}, addedMatches: [], deletedMatches: [] },
}: MatchSetupTableProps) {
  // 承認済みのチームのみフィルター
  const approvedTeams = teams.filter(team => team.isApproved); // 初期データを作成
  const initialData = useMemo(() => {
    return matches.map(match => ({
      id: match.matchId || "", // undefined の場合は空文字列
      courtId: match.courtId,
      round: match.round,
      playerATeamId: match.players.playerA.teamId,
      playerAId: match.players.playerA.playerId,
      playerBTeamId: match.players.playerB.teamId,
      playerBId: match.players.playerB.playerId,
    }));
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
    const newRow: MatchSetupData = {
      id: `match-${Date.now()}`,
      courtId: "",
      round: "",
      playerATeamId: "",
      playerAId: "",
      playerBTeamId: "",
      playerBId: "",
    };
    setData(prev => [...prev, newRow]);
  };

  const removeRow = (index: number) => {
    setData(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(data);
  };

  // 赤枠がある場合は保存ボタンを無効化
  const hasConflicts =
    Object.keys(detectedChanges.fieldChanges).length > 0 ||
    detectedChanges.addedMatches.length > 0 ||
    detectedChanges.deletedMatches.length > 0;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">試合設定</h2>
        <div className="flex gap-2">
          <Button
            onClick={addRow}
            variant="outline"
            size="sm"
            disabled={isSaving}
          >
            <Plus className="h-4 w-4 mr-1" />
            試合追加
          </Button>
          <Button
            onClick={handleSave}
            size="sm"
            disabled={isSaving || hasConflicts}
          >
            {isSaving ? "保存中..." : "保存"}
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>コート</TableHead>
              <TableHead>回戦</TableHead>
              <TableHead>選手A所属</TableHead>
              <TableHead>選手A</TableHead>
              <TableHead>選手B所属</TableHead>
              <TableHead>選手B</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => {
              // この行が他端末で追加された試合かチェック
              const isAddedMatch = detectedChanges.addedMatches.some(m => m.matchId === row.id);
              // この行が他端末で削除された試合かチェック
              const isDeletedMatch = detectedChanges.deletedMatches.some(m => m.matchId === row.id);

              return (
                <TableRow
                  key={row.id}
                  className={cn(
                    isAddedMatch && "bg-green-50 border-l-4 border-l-green-500",
                    isDeletedMatch && "bg-red-50 border-l-4 border-l-red-500 line-through opacity-60"
                  )}
                >
                  {/* コート選択 */}
                  <TableCell>
                    <div
                      className={cn(
                        "rounded-md",
                        detectedChanges.fieldChanges[row.id]?.courtId && "ring-2 ring-red-500"
                      )}
                    >
                      <Select
                        value={row.courtId}
                        onValueChange={value => updateData(index, "courtId", value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="コート選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {courts.map(court => (
                            <SelectItem key={court.courtId} value={court.courtId}>
                              {court.courtName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>

                  {/* 回戦選択 */}
                  <TableCell>
                    <div
                      className={cn(
                        "rounded-md",
                        detectedChanges.fieldChanges[row.id]?.round && "ring-2 ring-red-500"
                      )}
                    >
                      <Select
                        value={row.round}
                        onValueChange={value => updateData(index, "round", value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="回戦選択" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="予選1回戦">予選1回戦</SelectItem>
                          <SelectItem value="予選2回戦">予選2回戦</SelectItem>
                          <SelectItem value="決勝トーナメント1回戦">
                            決勝トーナメント1回戦
                          </SelectItem>
                          <SelectItem value="決勝トーナメント2回戦">
                            決勝トーナメント2回戦
                          </SelectItem>
                          <SelectItem value="準決勝">準決勝</SelectItem>
                          <SelectItem value="決勝">決勝</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>

                  {/* 選手A所属チーム */}
                  <TableCell>
                    <Select
                      value={row.playerATeamId}
                      onValueChange={value =>
                        updateData(index, "playerATeamId", value)
                      }
                    >
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
                  </TableCell>

                  {/* 選手A */}
                  <TableCell>
                    <div
                      className={cn(
                        "rounded-md",
                        detectedChanges.fieldChanges[row.id]?.playerA && "ring-2 ring-red-500"
                      )}
                    >
                      <Select
                        value={row.playerAId}
                        onValueChange={value =>
                          updateData(index, "playerAId", value)
                        }
                        disabled={!row.playerATeamId}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="選手選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {getPlayersFromTeam(row.playerATeamId).map(player => (
                            <SelectItem
                              key={player.playerId}
                              value={player.playerId}
                            >
                              {player.displayName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>

                  {/* 選手B所属チーム */}
                  <TableCell>
                    <Select
                      value={row.playerBTeamId}
                      onValueChange={value =>
                        updateData(index, "playerBTeamId", value)
                      }
                    >
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
                  </TableCell>

                  {/* 選手B */}
                  <TableCell>
                    <div
                      className={cn(
                        "rounded-md",
                        detectedChanges.fieldChanges[row.id]?.playerB && "ring-2 ring-red-500"
                      )}
                    >
                      <Select
                        value={row.playerBId}
                        onValueChange={value =>
                          updateData(index, "playerBId", value)
                        }
                        disabled={!row.playerBTeamId}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="選手選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {getPlayersFromTeam(row.playerBTeamId).map(player => (
                            <SelectItem
                              key={player.playerId}
                              value={player.playerId}
                            >
                              {player.displayName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>

                  {/* 削除ボタン */}
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRow(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
