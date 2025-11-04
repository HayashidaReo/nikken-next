"use client";

import { useState, useEffect, useCallback } from "react";
import { useNotifications } from "@/hooks/useNotifications";

const ACTIVE_TOURNAMENT_KEY = "activeTournamentId";

/**
 * アクティブな大会ID管理のカスタムフック
 * LocalStorageでの永続化とグローバル状態管理を提供
 */
export function useActiveTournament() {
  const [activeTournamentId, setActiveTournamentId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const { addNotification } = useNotifications();

  // LocalStorageから初期値を取得
  useEffect(() => {
    try {
      const savedTournamentId = localStorage.getItem(ACTIVE_TOURNAMENT_KEY);
      setActiveTournamentId(savedTournamentId);
    } catch (error) {
      console.error(
        "Failed to load active tournament ID from localStorage:",
        error
      );
      addNotification({
        type: "error",
        title: "エラー",
        message: "大会情報の読み込みに失敗しました",
      });
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  // 大会IDを設定してLocalStorageに保存
  const setActiveTournament = useCallback(
    (tournamentId: string | null) => {
      try {
        setActiveTournamentId(tournamentId);

        if (tournamentId) {
          localStorage.setItem(ACTIVE_TOURNAMENT_KEY, tournamentId);
        } else {
          localStorage.removeItem(ACTIVE_TOURNAMENT_KEY);
        }
      } catch (error) {
        console.error(
          "Failed to save active tournament ID to localStorage:",
          error
        );
        addNotification({
          type: "error",
          title: "エラー",
          message: "大会情報の保存に失敗しました",
        });
      }
    },
    [addNotification]
  );

  // ログアウト時の大会ID削除
  const clearActiveTournament = useCallback(() => {
    setActiveTournament(null);
  }, [setActiveTournament]);

  // 大会が選択されているかチェック
  const hasTournamentSelected = Boolean(activeTournamentId);

  return {
    activeTournamentId,
    setActiveTournament,
    clearActiveTournament,
    hasTournamentSelected,
    isLoading,
  };
}
