"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/atoms/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { useActiveTournament } from "@/store/use-active-tournament-store";
import { useTournamentsByOrganization } from "@/queries/use-tournaments";
import { useAuthStore } from "@/store/use-auth-store";
import { Calendar, MapPin, AlertCircle } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils/utils";
import { formatDateForDisplay } from "@/lib/utils/date-utils";
import { Tournament } from "@/types/tournament.schema";

interface TournamentSelectionDialogProps {
  /** ダイアログの表示状態 */
  open: boolean;
  /** ダイアログが閉じることができるかどうか（必須選択の場合はfalse） */
  dismissible?: boolean;
  /** ダイアログを閉じる際のコールバック */
  onClose?: () => void;
}

/**
 * 大会選択強制ダイアログコンポーネント
 * Organisms層：ビジネスロジックを持つ自己完結した機能コンポーネント
 *
 * 要件：
 * - ログイン済みでもアクティブな大会IDがLocalStorageに存在しない場合に強制表示
 * - 大会を選択するまでは他の画面操作をブロック
 */
export function TournamentSelectionDialog({
  open,
  dismissible = false,
  onClose,
}: TournamentSelectionDialogProps) {
  const { user } = useAuthStore();
  const { setActiveTournament } = useActiveTournament();
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>("");

  // ユーザーのUIDを組織IDとして使用（大会設定画面と同じ実装）
  const orgId = user?.uid || null;

  const {
    data: tournaments = [],
    isLoading,
    error,
  } = useTournamentsByOrganization(orgId);

  const handleConfirm = () => {
    if (selectedTournamentId) {
      setActiveTournament(selectedTournamentId);
      // 明示的にダイアログを閉じる
      onClose?.();
    }
  };

  const handleTournamentChange = (value: string) => {
    setSelectedTournamentId(value);
  };

  if (!user) {
    return null; // 未ログイン時は表示しない
  }

  return (
    <Dialog open={open} onOpenChange={dismissible ? undefined : () => { }}>
      <DialogContent
        className="sm:max-w-md bg-white"
        onInteractOutside={dismissible ? undefined : e => e.preventDefault()}
        onEscapeKeyDown={dismissible ? undefined : e => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            大会を選択してください
          </DialogTitle>
          <p className="text-sm text-gray-600 text-center mt-1">
            操作を続行するには大会を選択する必要があります。
          </p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <div className="text-sm text-destructive">
                  <p className="font-medium">大会一覧の取得に失敗しました</p>
                  {error.message.includes("組織が見つかりません") && (
                    <p className="text-xs mt-1 text-gray-600">
                      大会設定画面で大会を作成してください。
                    </p>
                  )}
                </div>
              </div>
              {error.message && (
                <details className="text-xs text-gray-500 ml-6">
                  <summary className="cursor-pointer hover:text-gray-700">詳細を表示</summary>
                  <p className="mt-1 font-mono break-words">{error.message}</p>
                </details>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900">大会</label>
            <Select
              value={selectedTournamentId}
              onValueChange={handleTournamentChange}
              disabled={isLoading || !!error}
            >
              <SelectTrigger className={cn(
                "w-full border-gray-200",
                isLoading && "opacity-50"
              )}>
                <SelectValue
                  placeholder={
                    isLoading ? "読み込み中..." : "大会を選択してください"
                  }
                />
              </SelectTrigger>
              <SelectContent className="border-none shadow-lg">
                <div className="py-1">
                  {tournaments
                    .filter((tournament: Tournament) => tournament.tournamentId)
                    .map((tournament: Tournament) => (
                      <SelectItem
                        key={tournament.tournamentId}
                        value={tournament.tournamentId!}
                        className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100 rounded-md"
                      >
                        <div className="flex flex-col py-1">
                          <span className="font-semibold text-gray-900 text-sm leading-snug">
                            {tournament.tournamentName}
                          </span>
                          <div className="flex items-center gap-2 text-xs text-gray-600 mt-0.5">
                            <span className="flex items-center gap-0.5">
                              <Calendar className="h-3 w-3 text-gray-500" />
                              {formatDateForDisplay(tournament.tournamentDate)}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <MapPin className="h-3 w-3 text-gray-500" />
                              {tournament.location}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  {tournaments.length === 0 && !isLoading && !error && (
                    <div className="p-2 text-sm text-center text-gray-500">
                      <p className="font-medium">利用可能な大会がありません</p>
                    </div>
                  )}
                </div>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-2">
            {tournaments.length === 0 && !isLoading && !error && (
              <Button
                variant="link"
                onClick={() => (window.location.href = ROUTES.TOURNAMENT_SETTINGS)}
                className="w-full sm:w-auto px-10"
              >
                こちらから大会を新規作成
              </Button>
            )}
            <Button
              onClick={handleConfirm}
              disabled={!selectedTournamentId || isLoading}
              className="w-full sm:w-auto"
            >
              この大会で続行
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
