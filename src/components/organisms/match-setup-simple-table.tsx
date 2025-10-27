"use client";

import * as React from "react";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
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
import { cn } from "@/lib/utils";
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
  className?: string;
}

export function MatchSetupTable({
  teams,
  courts,
  matches,
  onSave,
  className,
}: MatchSetupTableProps) {
  // 承認済みのチームのみフィルター
  const approvedTeams = teams.filter(team => team.isApproved);
  
  // 初期データを作成
  const initialData = React.useMemo(() => {
    return matches.map(match => ({
      id: match.matchId,
      courtId: match.courtId,
      round: match.round,
      playerATeamId: match.players.playerA.teamId,
      playerAId: match.players.playerA.playerId,
      playerBTeamId: match.players.playerB.teamId,
      playerBId: match.players.playerB.playerId,
    }));
  }, [matches]);

  const [data, setData] = React.useState<MatchSetupData[]>(initialData);

  // チームから選手を取得する関数
  const getPlayersFromTeam = (teamId: string): Player[] => {
    const team = approvedTeams.find(t => t.teamId === teamId);
    return team ? team.players : [];
  };



  // データを更新する関数
  const updateData = (rowIndex: number, field: keyof MatchSetupData, value: string) => {
    setData(prev => 
      prev.map((row, index) => {
        if (index === rowIndex) {
          const newRow = { ...row, [field]: value };
          
          // チームが変更された場合は対応する選手もリセット
          if (field === 'playerATeamId') {
            newRow.playerAId = '';
          } else if (field === 'playerBTeamId') {
            newRow.playerBId = '';
          }
          
          return newRow;
        }
        return row;
      })
    );
  };

  // 新しい行を追加
  const addNewRow = () => {
    const newRow: MatchSetupData = {
      id: `match-${Date.now()}`,
      courtId: '',
      round: '',
      playerATeamId: '',
      playerAId: '',
      playerBTeamId: '',
      playerBId: '',
    };
    setData(prev => [...prev, newRow]);
  };

  // 行を削除
  const removeRow = (rowIndex: number) => {
    setData(prev => prev.filter((_, index) => index !== rowIndex));
  };

  const handleSave = () => {
    // バリデーション
    const isValid = data.every(row => 
      row.courtId && row.round && row.playerATeamId && row.playerAId && 
      row.playerBTeamId && row.playerBId
    );

    if (!isValid) {
      alert('すべての項目を入力してください');
      return;
    }

    onSave(data);
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          試合の組み合わせ設定
          <div className="space-x-2">
            <Button onClick={addNewRow} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              行を追加
            </Button>
            <Button onClick={handleSave}>
              保存
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">コート名</TableHead>
                <TableHead className="min-w-[100px]">回戦</TableHead>
                <TableHead className="min-w-[150px]">選手A所属</TableHead>
                <TableHead className="min-w-[150px]">選手A表示名</TableHead>
                <TableHead className="min-w-[150px]">選手B所属</TableHead>
                <TableHead className="min-w-[150px]">選手B表示名</TableHead>
                <TableHead className="w-[80px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                data.map((row, index) => (
                  <TableRow key={row.id}>
                    {/* コート名 */}
                    <TableCell className="p-2">
                      <Select
                        value={row.courtId}
                        onValueChange={(value) => updateData(index, 'courtId', value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="コートを選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {courts.map(court => (
                            <SelectItem key={court.courtId} value={court.courtId}>
                              {court.courtName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    
                    {/* 回戦 */}
                    <TableCell className="p-2">
                      <Select
                        value={row.round}
                        onValueChange={(value) => updateData(index, 'round', value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="回戦を選択" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1回戦">1回戦</SelectItem>
                          <SelectItem value="2回戦">2回戦</SelectItem>
                          <SelectItem value="準々決勝">準々決勝</SelectItem>
                          <SelectItem value="準決勝">準決勝</SelectItem>
                          <SelectItem value="決勝">決勝</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    
                    {/* 選手A所属 */}
                    <TableCell className="p-2">
                      <Select
                        value={row.playerATeamId}
                        onValueChange={(value) => updateData(index, 'playerATeamId', value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="チームを選択" />
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
                    
                    {/* 選手A表示名 */}
                    <TableCell className="p-2">
                      <Select
                        value={row.playerAId}
                        onValueChange={(value) => updateData(index, 'playerAId', value)}
                        disabled={!row.playerATeamId}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="選手を選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {getPlayersFromTeam(row.playerATeamId).map(player => (
                            <SelectItem key={player.playerId} value={player.playerId}>
                              {player.displayName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    
                    {/* 選手B所属 */}
                    <TableCell className="p-2">
                      <Select
                        value={row.playerBTeamId}
                        onValueChange={(value) => updateData(index, 'playerBTeamId', value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="チームを選択" />
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
                    
                    {/* 選手B表示名 */}
                    <TableCell className="p-2">
                      <Select
                        value={row.playerBId}
                        onValueChange={(value) => updateData(index, 'playerBId', value)}
                        disabled={!row.playerBTeamId}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="選手を選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {getPlayersFromTeam(row.playerBTeamId).map(player => (
                            <SelectItem key={player.playerId} value={player.playerId}>
                              {player.displayName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    
                    {/* 操作 */}
                    <TableCell className="p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRow(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    組み合わせが登録されていません
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}