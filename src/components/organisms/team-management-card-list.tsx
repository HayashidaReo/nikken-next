"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { ChevronDown, ChevronRight, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Team } from "@/types/team.schema";

interface TeamManagementCardListProps {
  teams: Team[];
  onApprovalChange: (teamId: string, isApproved: boolean) => void;
  className?: string;
}

interface TeamCardProps {
  team: Team;
  onApprovalChange: (teamId: string, isApproved: boolean) => void;
}

function TeamCard({ team, onApprovalChange }: TeamCardProps) {
  const [isPlayersExpanded, setIsPlayersExpanded] = React.useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = React.useState<'approve' | 'unapprove' | null>(null);

  const handleApprovalClick = (action: 'approve' | 'unapprove') => {
    setShowConfirmDialog(action);
  };

  const confirmApprovalChange = () => {
    if (showConfirmDialog) {
      const newApprovalState = showConfirmDialog === 'approve';
      onApprovalChange(team.teamId, newApprovalState);
      setShowConfirmDialog(null);
    }
  };

  const cancelApprovalChange = () => {
    setShowConfirmDialog(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-3">
              <span>{team.teamName}</span>
              <Badge variant={team.isApproved ? "default" : "secondary"}>
                {team.isApproved ? "承認済み" : "未承認"}
              </Badge>
            </CardTitle>
            <div className="mt-2 text-sm text-gray-600 space-y-1">
              <div>代表者: {team.representativeName}</div>
              <div>電話: {team.representativePhone}</div>
              <div>メール: {team.representativeEmail}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Link href={`/teams/edit/${team.teamId}`}>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                編集
              </Button>
            </Link>
            
            {team.isApproved ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleApprovalClick('unapprove')}
              >
                承認前に戻す
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => handleApprovalClick('approve')}
              >
                承認
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* 選手数表示とトグルボタン */}
        <button
          onClick={() => setIsPlayersExpanded(!isPlayersExpanded)}
          className="flex items-center gap-2 w-full text-left p-2 rounded hover:bg-gray-50 transition-colors"
        >
          {isPlayersExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          <span className="font-medium">選手数: {team.players.length}人</span>
        </button>
        
        {/* 選手一覧（展開時） */}
        {isPlayersExpanded && (
          <div className="mt-3 pl-6 space-y-2">
            {team.players.map((player) => (
              <div
                key={player.playerId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <span className="font-medium">{player.displayName}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({player.lastName} {player.firstName})
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* 備考 */}
        {team.remarks && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm font-medium text-blue-900 mb-1">備考</div>
            <div className="text-sm text-blue-800">{team.remarks}</div>
          </div>
        )}
        
        {/* 登録日時 */}
        <div className="mt-4 text-xs text-gray-500">
          登録日時: {team.createdAt.toLocaleDateString('ja-JP')} {team.createdAt.toLocaleTimeString('ja-JP')}
        </div>
      </CardContent>
      
      {/* 確認ダイアログ */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {showConfirmDialog === 'approve' ? '承認確認' : '承認取消確認'}
            </h3>
            <p className="text-gray-600 mb-6">
              {showConfirmDialog === 'approve'
                ? `${team.teamName} を承認しますか？`
                : `${team.teamName} の承認を取り消しますか？`
              }
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={cancelApprovalChange}>
                キャンセル
              </Button>
              <Button onClick={confirmApprovalChange}>
                {showConfirmDialog === 'approve' ? '承認する' : '取り消す'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export function TeamManagementCardList({
  teams,
  onApprovalChange,
  className,
}: TeamManagementCardListProps) {
  // 承認済みと未承認でソート
  const sortedTeams = React.useMemo(() => {
    return [...teams].sort((a, b) => {
      // 未承認を上に表示
      if (a.isApproved !== b.isApproved) {
        return a.isApproved ? 1 : -1;
      }
      // 同じ承認状態の場合は登録日順
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [teams]);

  return (
    <div className={cn("w-full space-y-4", className)}>
      {sortedTeams.length > 0 ? (
        sortedTeams.map((team) => (
          <TeamCard
            key={team.teamId}
            team={team}
            onApprovalChange={onApprovalChange}
          />
        ))
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-gray-500">
              チームの申請がありません
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}