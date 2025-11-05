"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/atoms/button";
import { useActiveTournament } from "@/store/use-active-tournament-store";
import { useTournamentsByOrganization } from "@/queries/use-tournaments";
import { useAuthStore } from "@/store/use-auth-store";
import { AlertCircle } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { TournamentSelectDropdown } from "@/components/atoms/tournament-select-dropdown";

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
  const [isConfirming, setIsConfirming] = useState(false);

  // ユーザーのUIDを組織IDとして使用（大会設定画面と同じ実装）
  const orgId = user?.uid || null;

  const {
    data: tournaments = [],
    isLoading,
    error,
  } = useTournamentsByOrganization(orgId);

  const handleConfirm = async () => {
    if (selectedTournamentId && !isConfirming) {
      setIsConfirming(true);

      // アクティブな大会を設定
      setActiveTournament(selectedTournamentId);

      // LocalStorageへの書き込みが完了するまで少し待機
      await new Promise(resolve => setTimeout(resolve, 100));

      // 大会選択後は明示的に閉じる
      // onCloseが定義されている場合は呼び出す
      if (onClose) {
        onClose();
      }

      setIsConfirming(false);
    }
  };

  const handleTournamentChange = (value: string) => {
    setSelectedTournamentId(value);
  };

  const handleOpenChange = (newOpen: boolean) => {
    // dismissibleがtrueの場合のみ、外部からのクローズ要求を受け入れる
    if (dismissible && !newOpen) {
      onClose?.();
    }
  };

  if (!user) {
    return null; // 未ログイン時は表示しない
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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

          <div>
            <TournamentSelectDropdown
              tournaments={tournaments}
              selectedId={selectedTournamentId}
              onSelect={handleTournamentChange}
              isLoading={isLoading}
              isError={!!error}
              placeholder="大会を選択してください"
              showSelectedDetails={false}
              triggerClassName="w-full border-gray-200"
              contentMinWidth="min-w-[280px]"
              disabled={isLoading || !!error}
            />
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
              disabled={!selectedTournamentId || isLoading || isConfirming}
              className="w-full sm:w-auto"
            >
              {isConfirming ? "設定中..." : "この大会で続行"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
