"use client";

import React from "react";
import { LoadingIndicator } from "@/components/molecules/loading-indicator";
import { useAuthStore } from "@/store/use-auth-store";
import { useActiveTournament } from "@/store/use-active-tournament-store";
import { TournamentSelectionDialog } from "@/components/organisms/TournamentSelectionDialog";

interface TournamentProviderProps {
  children: React.ReactNode;
}

/**
 * 大会選択管理Provider
 *
 * 要件：
 * - ログイン済みかつ大会IDが未選択の場合は強制ダイアログ表示
 * - 大会選択完了まで他の操作をブロック
 */
export function TournamentProvider({ children }: TournamentProviderProps) {
  const { user, isInitialized } = useAuthStore();
  const { hasTournamentSelected, isLoading: tournamentLoading } =
    useActiveTournament();

  // ダイアログ表示条件: ログイン済み＆大会未選択の場合は常に表示
  const shouldShowDialog =
    isInitialized &&
    !tournamentLoading &&
    Boolean(user) &&
    !hasTournamentSelected;

  // ダイアログが必要な場合は、ローディング表示をスキップして直接ダイアログを表示
  const needsDialog = isInitialized && !tournamentLoading && Boolean(user) && !hasTournamentSelected;

  // ダイアログ内で大会選択完了時に自動的に閉じられるため、
  // 外部からのクローズは必要ない（dismissible=false）
  const handleDialogClose = () => {
    // 無操作ハンドラ（ダイアログは dismissible=false なので呼ばれない）
  };

  // ローディング中の場合のみローディングインジケーター表示
  // （ただし大会選択が必要な場合はダイアログを同時に表示）
  if (!isInitialized || tournamentLoading) {
    if (needsDialog) {
      // 大会選択が必要な場合は、ダイアログのみ表示
      return (
        <>
          <TournamentSelectionDialog
            open={shouldShowDialog}
            dismissible={false}
            onClose={handleDialogClose}
          />
        </>
      );
    }
    return <LoadingIndicator message="準備中..." size="lg" fullScreen={true} />;
  }

  return (
    <>
      {children}

      {/* 大会選択強制ダイアログ */}
      <TournamentSelectionDialog
        open={shouldShowDialog}
        dismissible={false} // 必須選択のため閉じることはできない
        onClose={handleDialogClose}
      />
    </>
  );
}
