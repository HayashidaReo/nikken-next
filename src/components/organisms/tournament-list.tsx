"use client";

import { Plus, Trash2, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { LoadingIndicator } from "@/components/molecules/loading-indicator";
import { useTournamentsByOrganization } from "@/queries/use-tournaments";
import { TournamentDeleteConfirmationDialog } from "@/components/molecules/tournament-delete-confirmation-dialog";
import { useTournamentListManagement } from "@/hooks/useTournamentListManagement";
import type { Tournament } from "@/types/tournament.schema";
import { cn } from "@/lib/utils/utils";
import { formatDateForDisplay } from "@/lib/utils/date-utils";
import { InfoDisplay } from "@/components/molecules/info-display";

interface TournamentListProps {
  orgId: string | null;
  selectedTournamentId: string | null;
  onTournamentSelect: (tournament: Tournament) => void;
  onNewTournament: () => void;
  isCreating?: boolean;
  className?: string;
}

export function TournamentList({
  orgId,
  selectedTournamentId,
  onTournamentSelect,
  onNewTournament,
  isCreating = false,
  className,
}: TournamentListProps) {
  const {
    data: tournaments = [],
    isLoading,
    error,
  } = useTournamentsByOrganization(orgId);

  // 削除管理専用フック
  const {
    deleteConfirm,
    isDeleting,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = useTournamentListManagement(tournaments);

  const onDeleteConfirm = () => {
    if (orgId) {
      handleDeleteConfirm(orgId);
    }
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">大会一覧</h2>
        </div>
        <LoadingIndicator message="大会一覧を読み込み中..." className="py-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">大会一覧</h2>
        </div>
        <div className="py-8">
          <InfoDisplay
            variant="destructive"
            title="大会一覧の読み込みに失敗しました"
            message={error?.message || "大会一覧の取得中にエラーが発生しました"}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">大会一覧</h2>
      </div>

      <div className="space-y-3">
        {isCreating && (
          <Card className="border-2 border-dashed border-blue-200 bg-blue-50/50 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="h-6 w-32 bg-blue-100 rounded animate-pulse mb-2" />
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                    <div className="h-4 w-20 bg-blue-100 rounded animate-pulse" />
                    <div className="h-4 w-20 bg-blue-100 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xs text-blue-400 font-medium">新しい大会を作成中...</p>
            </CardContent>
          </Card>
        )}

        {tournaments.length === 0 && !isCreating ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500 mb-4">まだ大会が作成されていません</p>
              <Button onClick={onNewTournament} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                最初の大会を作成
              </Button>
            </CardContent>
          </Card>
        ) : (
          tournaments.map((tournament: Tournament) => (
            <Card
              key={tournament.tournamentId}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md",
                selectedTournamentId === tournament.tournamentId
                  ? "ring-2 ring-blue-500 bg-blue-50"
                  : "hover:bg-gray-50"
              )}
              onClick={() => onTournamentSelect(tournament)}
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-bold truncate leading-tight mb-2">
                      {tournament.tournamentName}
                    </CardTitle>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                      <div className="flex items-center gap-1 min-w-0">
                        <Calendar className="w-3 h-3 flex-shrink-0 text-gray-500" />
                        <span className="truncate text-xs text-gray-500">
                          {formatDateForDisplay(tournament.tournamentDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 min-w-0">
                        <MapPin className="w-3 h-3 flex-shrink-0 text-gray-500" />
                        <span className="truncate text-xs text-gray-500">
                          {tournament.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(tournament);
                    }}
                    disabled={isDeleting}
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 -mr-2 -mt-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-1">
                {tournament.tournamentDetail && (
                  <p className="text-xs text-gray-500 truncate">
                    {tournament.tournamentDetail}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Button onClick={onNewTournament} className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        新しい大会を追加
      </Button>

      <TournamentDeleteConfirmationDialog
        isOpen={deleteConfirm.isOpen}
        tournament={deleteConfirm.tournament}
        onCancel={handleDeleteCancel}
        onConfirm={() => onDeleteConfirm()}
      />
    </div>
  );
}
