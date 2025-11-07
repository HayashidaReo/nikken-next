"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { LoadingIndicator } from "@/components/molecules/loading-indicator";
import { useAuthStore } from "@/store/use-auth-store";
import { useActiveTournament } from "@/store/use-active-tournament-store";
import { TournamentSelectionDialog } from "@/components/organisms/TournamentSelectionDialog";
import { ROUTES } from "@/lib/constants";

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
  const pathname = usePathname();
  const { user, isInitialized } = useAuthStore();
  const { hasTournamentSelected, isLoading: tournamentLoading } =
    useActiveTournament();

  // 大会設定画面ではダイアログを表示しない
  const shouldDisableDialog = pathname.includes(ROUTES.TOURNAMENT_SETTINGS);

  // ダイアログ表示条件: ログイン済み＆大会未選択の場合は常に表示（大会設定画面場合は表示しない）
  const shouldShowDialog =
    !shouldDisableDialog &&
    isInitialized &&
    !tournamentLoading &&
    Boolean(user) &&
    !hasTournamentSelected;

  // ダイアログを閉じるハンドラー
  // onClose はダイアログ内部で大会選択が確定した際に
  // ストア側の状態（hasTournamentSelected）が更新されることを期待する。
  // その結果 shouldShowDialog が false になり自動的に閉じる
  const handleCloseDialog = () => {
  };

  // ローディング中の場合のみローディングインジケーター表示
  if (!isInitialized || tournamentLoading) {
    if (shouldShowDialog) {
      // 大会選択が必要な場合は、ダイアログのみ表示
      return (
        <TournamentSelectionDialog
          open={true}
          dismissible={false}
          onClose={handleCloseDialog}
        />
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
        dismissible={false}
        onClose={handleCloseDialog}
      />
    </>
  );
}
