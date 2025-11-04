"use client";

import { useState, useMemo, useEffect } from "react";
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
  detectedChanges?: Record<string, Record<string, { initial: string; server: string }>>;
}

export function MatchSetupTable({
  teams,
  courts,
  matches,
  onSave,
  isSaving = false,
  className,
  detectedChanges = {},
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

  const [data, setData] = useState<MatchSetupData[]>(initialData);

  // matches が更新されたら data も更新（マージ時など）
  // initialData の変更を監視して data を更新
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

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
            disabled={isSaving}
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
            {data.map((row, index) => (
              <TableRow key={row.id}>
                {/* コート選択 */}
                <TableCell>
                  <div
                    className={cn(
                      "rounded-md",
                      detectedChanges[row.id]?.courtId && "ring-2 ring-red-500"
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
                      detectedChanges[row.id]?.round && "ring-2 ring-red-500"
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
                      detectedChanges[row.id]?.playerA && "ring-2 ring-red-500"
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
                      detectedChanges[row.id]?.playerB && "ring-2 ring-red-500"
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
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
