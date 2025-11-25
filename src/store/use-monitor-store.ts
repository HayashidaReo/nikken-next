import { create } from "zustand";
import type { Match, TeamMatch } from "@/types/match.schema";
import type { ResolvedMatchPlayer } from "@/lib/utils/player-directory";
import type { MonitorData, MonitorPlayer } from "@/types/monitor.schema";
import { SCORE_CONSTANTS, HANSOKU_CONSTANTS } from "@/lib/constants";
import {
  calculateOpponentScoreChange,
  updateOpponentScore,
  isMatchEnded,
} from "@/domains/match/match-logic";

interface MonitorState {
  // 試合の基本情報（初期データから設定）
  matchId: string | null;
  matchGroupId?: string;
  sortOrder?: number;
  courtName: string;
  roundName: string;
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
  viewMode: "scoreboard" | "match_result" | "team_result";
  matchResult?: {
    playerA: MonitorPlayer;
    playerB: MonitorPlayer;
    winner: "playerA" | "playerB" | "draw" | "none";
  };
  teamMatchResults?: MonitorData["teamMatchResults"];

  presentationConnected: boolean;
  presentationConnection?: PresentationConnection | null;
  fallbackOpen: boolean;
  selectedPlayer: "playerA" | "playerB" | null;

  // アクション
  initializeMatch: (
    match: Match | TeamMatch,
    tournamentName: string,
    courtName: string,
    options?: {
      resolvedPlayers?: {
        playerA: ResolvedMatchPlayer;
        playerB: ResolvedMatchPlayer;
      };
      roundName?: string;
      defaultMatchTime?: number;
    }
  ) => void;
  setPlayerScore: (player: "A" | "B", score: number) => void;
  setPlayerHansoku: (player: "A" | "B", hansoku: number) => void;
  setTimeRemaining: (seconds: number) => void;
  startTimer: () => void;
  stopTimer: () => void;
  toggleTimer: () => void;
  togglePublic: () => void;
  setPublic: (isPublic: boolean) => void;
  setViewMode: (mode: "scoreboard" | "match_result" | "team_result") => void;
  setMatchResult: (result: MonitorState["matchResult"]) => void;
  setTeamMatchResults: (results: MonitorData["teamMatchResults"]) => void;
  setPresentationConnected: (connected: boolean) => void;
  setPresentationConnection: (conn: PresentationConnection | null) => void;
  setFallbackOpen: (open: boolean) => void;
  toggleSelectedPlayer: (player: "playerA" | "playerB" | "none") => void;
  incrementScoreForSelectedPlayer: () => void;
  incrementFoulForSelectedPlayer: () => void;
  getMonitorSnapshot: () => MonitorData;
}

export const useMonitorStore = create<MonitorState>((set, get) => ({
  // 初期状態
  matchId: null,
  courtName: "",
  roundName: "",
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
  viewMode: "scoreboard",
  presentationConnected: false,
  fallbackOpen: false,
  selectedPlayer: null,

  // アクション
  initializeMatch: (
    match: Match | TeamMatch,
    tournamentName: string,
    courtName: string,
    options?: {
      resolvedPlayers?: {
        playerA: ResolvedMatchPlayer;
        playerB: ResolvedMatchPlayer;
      };
      roundName?: string;
      defaultMatchTime?: number;
    }
  ) => {
    const { resolvedPlayers, roundName, defaultMatchTime = 180 } = options || {};
    const fallbackPlayer = (
      player: Match["players"]["playerA"] | TeamMatch["players"]["playerA"]
    ): ResolvedMatchPlayer => ({
      ...player,
      displayName: player.playerId,
      teamName: player.teamId,
    });

    const playerAData = resolvedPlayers?.playerA || fallbackPlayer(match.players.playerA);
    const playerBData = resolvedPlayers?.playerB || fallbackPlayer(match.players.playerB);

    const matchGroupId = "matchGroupId" in match ? match.matchGroupId : undefined;
    const sortOrder = match.sortOrder;

    set({
      matchId: match.matchId,
      matchGroupId,
      sortOrder,
      courtName,
      roundName,
      tournamentName,
      playerA: {
        displayName: playerAData.displayName,
        teamName: playerAData.teamName,
        score: playerAData.score,
        hansoku: playerAData.hansoku,
      },
      playerB: {
        displayName: playerBData.displayName,
        teamName: playerBData.teamName,
        score: playerBData.score,
        hansoku: playerBData.hansoku,
      },
      // 試合切り替え時にモードをリセット
      viewMode: "scoreboard",
      matchResult: undefined,
      // タイマーをリセット（大会設定値を使用）
      timeRemaining: defaultMatchTime,
      isTimerRunning: false,
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
    if (score >= SCORE_CONSTANTS.MAX_SCORE) {
      set({ isTimerRunning: false });
    }
  },

  setPlayerHansoku: (player: "A" | "B", hansoku: number) => {
    const currentState = get();
    const currentPlayer =
      player === "A" ? currentState.playerA : currentState.playerB;
    const opponent =
      player === "A" ? currentState.playerB : currentState.playerA;

    // 相手のスコア変動を計算
    const scoreChange = calculateOpponentScoreChange(
      currentPlayer.hansoku,
      hansoku
    );
    const newOpponentScore = updateOpponentScore(opponent.score, scoreChange);

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

    // 試合終了判定
    if (isMatchEnded(hansoku, newOpponentScore)) {
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

  toggleTimer: () => {
    const { isTimerRunning } = get();
    set({ isTimerRunning: !isTimerRunning });
  },

  togglePublic: () => {
    const currentState = get();
    set({ isPublic: !currentState.isPublic });
  },

  setPublic: (isPublic: boolean) => {
    set({ isPublic });
  },

  setViewMode: (mode) => {
    set({ viewMode: mode });
  },

  setMatchResult: (result) => {
    set({ matchResult: result });
  },

  setTeamMatchResults: (results) => {
    set({ teamMatchResults: results });
  },

  setPresentationConnected: (connected: boolean) => {
    set({ presentationConnected: connected });
  },

  setPresentationConnection: (conn: PresentationConnection | null) => {
    set({ presentationConnection: conn });
  },

  setFallbackOpen: (open: boolean) => {
    set({ fallbackOpen: open });
  },

  toggleSelectedPlayer: (player: "playerA" | "playerB" | "none") => {
    const { selectedPlayer } = get();
    if (player === "none") {
      set({ selectedPlayer: null });
      return;
    }

    if (selectedPlayer === player) {
      set({ selectedPlayer: null });
    } else {
      set({ selectedPlayer: player });
    }
  },

  incrementScoreForSelectedPlayer: () => {
    const { selectedPlayer, playerA, playerB, setPlayerScore } = get();
    if (!selectedPlayer) return;

    const targetPlayer = selectedPlayer === "playerA" ? playerA : playerB;
    const newScore = targetPlayer.score + 1;

    if (newScore <= SCORE_CONSTANTS.MAX_SCORE) {
      setPlayerScore(selectedPlayer === "playerA" ? "A" : "B", newScore);
    }
  },

  incrementFoulForSelectedPlayer: () => {
    const { selectedPlayer, playerA, playerB, setPlayerHansoku } = get();
    if (!selectedPlayer) return;

    const targetPlayer = selectedPlayer === "playerA" ? playerA : playerB;
    const newHansoku = targetPlayer.hansoku + 1;

    if (newHansoku <= HANSOKU_CONSTANTS.MAX_HANSOKU) {
      setPlayerHansoku(selectedPlayer === "playerA" ? "A" : "B", newHansoku);
    }
  },

  getMonitorSnapshot: () => {
    const s = get();
    return {
      matchId: s.matchId || "",
      tournamentName: s.tournamentName,
      courtName: s.courtName,
      roundName: s.roundName,
      playerA: s.playerA,
      playerB: s.playerB,
      timeRemaining: s.timeRemaining,
      isTimerRunning: s.isTimerRunning,
      isPublic: s.isPublic,
      viewMode: s.viewMode,
      matchResult: s.matchResult,
      teamMatchResults: s.teamMatchResults,
    };
  },
}));
