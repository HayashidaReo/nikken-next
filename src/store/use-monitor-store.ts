import { create } from "zustand";
import type { Match } from "@/types/match.schema";

interface MonitorState {
  // 試合の基本情報（初期データから設定）
  matchId: string | null;
  courtName: string;
  round: string;
  tournamentName: string;

  // 選手情報
  playerA: {
    displayName: string;
    teamName: string;
    score: number;
    hansoku: number;
  };
  playerB: {
    displayName: string;
    teamName: string;
    score: number;
    hansoku: number;
  };

  // タイマー関連
  timeRemaining: number; // 秒
  isTimerRunning: boolean;

  // 表示制御
  isPublic: boolean; // 公開/非公開

  // アクション
  initializeMatch: (
    match: Match,
    tournamentName: string,
    courtName: string
  ) => void;
  setPlayerScore: (player: "A" | "B", score: number) => void;
  setPlayerHansoku: (player: "A" | "B", hansoku: number) => void;
  setTimeRemaining: (seconds: number) => void;
  startTimer: () => void;
  stopTimer: () => void;
  togglePublic: () => void;
  saveMatchResult: (onSuccess?: () => void) => Promise<void>;
}

export const useMonitorStore = create<MonitorState>((set, get) => ({
  // 初期状態
  matchId: null,
  courtName: "",
  round: "",
  tournamentName: "",

  playerA: {
    displayName: "",
    teamName: "",
    score: 0,
    hansoku: 0,
  },
  playerB: {
    displayName: "",
    teamName: "",
    score: 0,
    hansoku: 0,
  },

  timeRemaining: 180, // デフォルト3分
  isTimerRunning: false,
  isPublic: false,

  // アクション
  initializeMatch: (
    match: Match,
    tournamentName: string,
    courtName: string
  ) => {
    set({
      matchId: match.matchId,
      courtName,
      round: match.round,
      tournamentName,
      playerA: {
        displayName: match.players.playerA.displayName,
        teamName: match.players.playerA.teamName,
        score: match.players.playerA.score,
        hansoku: match.players.playerA.hansoku,
      },
      playerB: {
        displayName: match.players.playerB.displayName,
        teamName: match.players.playerB.teamName,
        score: match.players.playerB.score,
        hansoku: match.players.playerB.hansoku,
      },
    });
  },

  setPlayerScore: (player: "A" | "B", score: number) => {
    const currentState = get();
    if (player === "A") {
      set({
        playerA: { ...currentState.playerA, score },
      });
    } else {
      set({
        playerB: { ...currentState.playerB, score },
      });
    }

    // 2点先取で自動停止
    if (score >= 2) {
      set({ isTimerRunning: false });
    }
  },

  setPlayerHansoku: (player: "A" | "B", hansoku: number) => {
    const currentState = get();
    const currentPlayer =
      player === "A" ? currentState.playerA : currentState.playerB;
    const opponent =
      player === "A" ? currentState.playerB : currentState.playerA;

    // 反則による得点変動ロジック
    let opponentScoreChange = 0;

    // 新しい赤の数 - 元の赤の数 = 追加された赤の数
    const currentReds = Math.floor(currentPlayer.hansoku / 2);
    const newReds = Math.floor(hansoku / 2);
    opponentScoreChange = newReds - currentReds;

    // 相手の得点を更新（最大2点まで）
    const newOpponentScore = Math.min(
      2,
      Math.max(0, opponent.score + opponentScoreChange)
    );

    if (player === "A") {
      set({
        playerA: { ...currentState.playerA, hansoku },
        playerB: { ...currentState.playerB, score: newOpponentScore },
      });
    } else {
      set({
        playerA: { ...currentState.playerA, score: newOpponentScore },
        playerB: { ...currentState.playerB, hansoku },
      });
    }

    // 赤2つ（hansoku 4）で試合終了
    if (hansoku >= 4 || newOpponentScore >= 2) {
      set({ isTimerRunning: false });
    }
  },

  setTimeRemaining: (seconds: number) => {
    set({ timeRemaining: Math.max(0, seconds) });
  },

  startTimer: () => {
    set({ isTimerRunning: true });
  },

  stopTimer: () => {
    set({ isTimerRunning: false });
  },

  togglePublic: () => {
    const currentState = get();
    set({ isPublic: !currentState.isPublic });
  },

  saveMatchResult: async (onSuccess?: () => void) => {
    // TODO: Firestoreへの保存ロジックを実装

    // 成功時のコールバック実行
    onSuccess?.();
  },
}));
