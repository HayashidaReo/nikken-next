"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/atoms/select";
import { useActiveTournament } from "@/store/use-active-tournament-store";
import { useTournamentsByOrganization } from "@/queries/use-tournaments";
import { useAuthStore } from "@/store/use-auth-store";
import { Settings, Calendar, MapPin } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { formatDateForDisplay } from "@/lib/utils/date-utils";
import type { Tournament } from "@/types/tournament.schema";

interface TournamentSelectorProps {
  className?: string;
  onManageClick?: () => void;
}

/**
 * ヘッダー用の大会選択ドロップダウンコンポーネント
 * Molecules層：Selectコンポーネント(Atom)を組み合わせた機能単位
 */
export function TournamentSelector({
  className,
  onManageClick,
}: TournamentSelectorProps) {
  const { user } = useAuthStore();
  const { activeTournamentId, setActiveTournament } = useActiveTournament();

  // ユーザーのUIDを組織IDとして使用（大会設定画面と同じ実装）
  const orgId = user?.uid || null;

  const {
    data: tournaments = [],
    isLoading,
    error,
  } = useTournamentsByOrganization(orgId);

  const handleTournamentChange = (value: string) => {
    if (value === "manage") {
      onManageClick?.();
      return;
    }
    setActiveTournament(value);
  };

  if (!user) {
    return null; // 未ログイン時は表示しない
  }

  if (error) {
    return (
      <div className={cn("text-sm text-destructive", className)}>
        大会一覧の取得に失敗しました
      </div>
    );
  }

  // 選択中の大会を取得
  const selectedTournament = tournaments.find(
    (t: Tournament) => t.tournamentId === activeTournamentId
  );

  return (
    <div className={cn("flex items-center", className)}>
      {/* 大会選択ドロップダウン */}
      <Select
        value={activeTournamentId || ""}
        onValueChange={handleTournamentChange}
        disabled={isLoading}
      >
        <SelectTrigger className="border-none bg-transparent hover:bg-gray-100 transition-colors min-w-[320px] h-auto shadow-none focus:ring-0 focus:ring-offset-0 py-2 px-3">
          {selectedTournament ? (
            <div className="flex flex-col items-start gap-0.5">
              <span className="font-semibold text-gray-900 text-sm leading-tight">
                {selectedTournament.tournamentName}
              </span>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-gray-500" />
                  {formatDateForDisplay(selectedTournament.tournamentDate)}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-gray-500" />
                  {selectedTournament.location}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-sm text-gray-500">
              {isLoading ? "読み込み中..." : "大会を選択"}
            </span>
          )}
        </SelectTrigger>
        <SelectContent className="min-w-[280px] border-none shadow-lg">
          <div className="py-1">
            {tournaments.map((tournament: Tournament) => (
              <SelectItem
                key={tournament.tournamentId}
                value={tournament.tournamentId!}
                className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100 rounded-md"
              >
                <div className="flex flex-col py-1">
                  <span className="font-semibold text-gray-900 text-sm leading-snug">
                    {tournament.tournamentName}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDateForDisplay(tournament.tournamentDate)}
                    </span>
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {tournament.location}
                    </span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </div>

          {tournaments.length > 0 && (
            <div className="bg-gray-50 mt-1 pt-1 pb-0.5">
              {/* 大会管理メニュー */}
              <SelectItem
                value="manage"
                className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 cursor-pointer rounded-md"
              >
                <div className="flex items-center space-x-2 py-1.5">
                  <Settings className="h-4 w-4" />
                  <span className="font-medium">大会を管理</span>
                </div>
              </SelectItem>
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
