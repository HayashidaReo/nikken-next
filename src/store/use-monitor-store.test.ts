/**
 * @jest-environment jsdom
 */

import { renderHook, act } from "@testing-library/react";
import { useMonitorStore } from "./use-monitor-store";
import type { Match } from "@/types/match.schema";

// テスト用のモックMatch データ
const mockMatch: Match = {
  matchId: "test-match-001",
  courtId: "court-001",
  roundId: "final",
  players: {
    playerA: {
      playerId: "player-a-001",
      teamId: "team-a-001",
      score: 0,
      hansoku: 0,
    },
    playerB: {
      playerId: "player-b-001",
      teamId: "team-b-001",
      score: 1,
      hansoku: 1,
    },
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  sortOrder: 1,
  isCompleted: false,
  winner: "none",
  winReason: "none",
};

const resolvedPlayers = {
  playerA: {
    ...mockMatch.players.playerA,
    displayName: "山田",
    teamName: "チームA",
  },
  playerB: {
    ...mockMatch.players.playerB,
    displayName: "鈴木",
    teamName: "チームB",
  },
};

const initializeOptions = {
  resolvedPlayers,
  roundName: "決勝",
};

// スパイを設定
let consoleSpy: jest.SpyInstance;

beforeEach(() => {
  consoleSpy = jest.spyOn(console, "log").mockImplementation(() => { });
  // ストアをリセット
  useMonitorStore.setState({
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
    timeRemaining: 180,
    isTimerRunning: false,
    isPublic: false,
  });
});

afterEach(() => {
  consoleSpy.mockRestore();
});

describe("useMonitorStore", () => {
  describe("初期状態", () => {
    it("正しい初期値を持つ", () => {
      const { result } = renderHook(() => useMonitorStore());

      expect(result.current.matchId).toBeNull();
      expect(result.current.courtName).toBe("");
      expect(result.current.roundName).toBe("");
      expect(result.current.tournamentName).toBe("");
      expect(result.current.playerA).toEqual({
        displayName: "",
        teamName: "",
        score: 0,
        hansoku: 0,
      });
      expect(result.current.playerB).toEqual({
        displayName: "",
        teamName: "",
        score: 0,
        hansoku: 0,
      });
      expect(result.current.timeRemaining).toBe(180);
      expect(result.current.isTimerRunning).toBe(false);
      expect(result.current.isPublic).toBe(false);
    });
  });

  describe("initializeMatch", () => {
    it("試合データで正しく初期化される", () => {
      const { result } = renderHook(() => useMonitorStore());

      act(() => {
        result.current.initializeMatch(mockMatch, "テスト大会", "Aコート", initializeOptions);
      });

      expect(result.current.matchId).toBe("test-match-001");
      expect(result.current.courtName).toBe("Aコート");
      expect(result.current.roundName).toBe("決勝");
      expect(result.current.tournamentName).toBe("テスト大会");
      expect(result.current.playerA).toEqual({
        displayName: "山田",
        teamName: "チームA",
        score: 0,
        hansoku: 0,
      });
      expect(result.current.playerB).toEqual({
        displayName: "鈴木",
        teamName: "チームB",
        score: 1,
        hansoku: 1,
      });
    });

    it("グループ試合データで正しく初期化される", () => {
      const { result } = renderHook(() => useMonitorStore());
      const groupMatches = [
        {
          matchId: "m1",
          sortOrder: 1,
          playerA: { displayName: "A1", teamName: "T1", score: 0, hansoku: 0 },
          playerB: { displayName: "B1", teamName: "T2", score: 0, hansoku: 0 },
          isCompleted: true,
          winner: "playerA" as const,
          winReason: "ippon" as const,
        },
        {
          matchId: "m2",
          sortOrder: 2,
          playerA: { displayName: "A2", teamName: "T1", score: 0, hansoku: 0 },
          playerB: { displayName: "B2", teamName: "T2", score: 0, hansoku: 0 },
          isCompleted: false,
          winner: "none" as const,
          winReason: "none" as const,
        },
      ];

      act(() => {
        result.current.initializeMatch(mockMatch, "テスト大会", "Aコート", {
          ...initializeOptions,
          groupMatches,
        });
      });

      expect(result.current.groupMatches).toEqual(groupMatches);
    });
  });

  describe("setPlayerScore", () => {
    beforeEach(() => {
      const { result } = renderHook(() => useMonitorStore());
      act(() => {
        result.current.initializeMatch(mockMatch, "テスト大会", "Aコート", initializeOptions);
      });
    });

    it("選手Aの得点を設定できる", () => {
      const { result } = renderHook(() => useMonitorStore());

      act(() => {
        result.current.setPlayerScore("A", 2);
      });

      expect(result.current.playerA.score).toBe(2);
      expect(result.current.playerB.score).toBe(1); // 変更されない
    });

    it("選手Bの得点を設定できる", () => {
      const { result } = renderHook(() => useMonitorStore());

      act(() => {
        result.current.setPlayerScore("B", 2);
      });

      expect(result.current.playerA.score).toBe(0); // 変更されない
      expect(result.current.playerB.score).toBe(2);
    });

    it("2点に達するとタイマーが停止する", () => {
      const { result } = renderHook(() => useMonitorStore());

      // タイマーを開始
      act(() => {
        result.current.startTimer();
      });

      expect(result.current.isTimerRunning).toBe(true);

      // 2点に設定
      act(() => {
        result.current.setPlayerScore("A", 2);
      });

      expect(result.current.playerA.score).toBe(2);
      expect(result.current.isTimerRunning).toBe(false);
    });

    it("1点以下ではタイマーは停止しない", () => {
      const { result } = renderHook(() => useMonitorStore());

      // タイマーを開始
      act(() => {
        result.current.startTimer();
      });

      expect(result.current.isTimerRunning).toBe(true);

      // 1点に設定
      act(() => {
        result.current.setPlayerScore("A", 1);
      });

      expect(result.current.playerA.score).toBe(1);
      expect(result.current.isTimerRunning).toBe(true);
    });
  });

  describe("setPlayerHansoku", () => {
    beforeEach(() => {
      const { result } = renderHook(() => useMonitorStore());
      act(() => {
        result.current.initializeMatch(mockMatch, "テスト大会", "Aコート", initializeOptions);
      });
    });

    it("選手Aの反則を設定できる", () => {
      const { result } = renderHook(() => useMonitorStore());

      act(() => {
        result.current.setPlayerHansoku("A", 2); // 赤カード
      });

      expect(result.current.playerA.hansoku).toBe(2);
      expect(result.current.playerB.hansoku).toBe(1); // 変更されない
    });

    it("赤カード（hansoku: 2）で相手の得点が1増加する", () => {
      const { result } = renderHook(() => useMonitorStore());

      const initialScoreB = result.current.playerB.score;

      act(() => {
        result.current.setPlayerHansoku("A", 2); // 選手Aに赤カード
      });

      expect(result.current.playerA.hansoku).toBe(2);
      expect(result.current.playerB.score).toBe(initialScoreB + 1);
    });

    it("赤2枚（hansoku: 4）で相手の得点が増加し試合終了", () => {
      const { result } = renderHook(() => useMonitorStore());

      // タイマーを開始
      act(() => {
        result.current.startTimer();
      });

      act(() => {
        result.current.setPlayerHansoku("A", 4); // 選手Aに赤2枚
      });

      expect(result.current.playerA.hansoku).toBe(4);
      // 初期値1 + 赤2枚による2点 = 3 だが、最大2点でクランプされる
      expect(result.current.playerB.score).toBe(2);
      expect(result.current.isTimerRunning).toBe(false); // 試合終了
    });

    it("反則による得点は最大2点まで", () => {
      const { result } = renderHook(() => useMonitorStore());

      // 選手Bの得点を1にする
      act(() => {
        result.current.setPlayerScore("B", 1);
      });

      act(() => {
        result.current.setPlayerHansoku("A", 4); // 選手Aに赤2枚（+2点）
      });

      expect(result.current.playerB.score).toBe(2); // 1 + 2 = 3 だが、最大2点
    });

    it("黄カード（hansoku: 1）では相手の得点は変わらない", () => {
      const { result } = renderHook(() => useMonitorStore());

      const initialScoreB = result.current.playerB.score;

      act(() => {
        result.current.setPlayerHansoku("A", 1); // 選手Aに黄カード
      });

      expect(result.current.playerA.hansoku).toBe(1);
      expect(result.current.playerB.score).toBe(initialScoreB); // 変わらない
    });
  });

  describe("タイマー関連", () => {
    it("setTimeRemainingで時間を設定できる", () => {
      const { result } = renderHook(() => useMonitorStore());

      act(() => {
        result.current.setTimeRemaining(120);
      });

      expect(result.current.timeRemaining).toBe(120);
    });

    it("負の時間は0に設定される", () => {
      const { result } = renderHook(() => useMonitorStore());

      act(() => {
        result.current.setTimeRemaining(-10);
      });

      expect(result.current.timeRemaining).toBe(0);
    });

    it("startTimerでタイマーが開始される", () => {
      const { result } = renderHook(() => useMonitorStore());

      expect(result.current.isTimerRunning).toBe(false);

      act(() => {
        result.current.startTimer();
      });

      expect(result.current.isTimerRunning).toBe(true);
    });

    it("stopTimerでタイマーが停止される", () => {
      const { result } = renderHook(() => useMonitorStore());

      // タイマーを開始
      act(() => {
        result.current.startTimer();
      });

      expect(result.current.isTimerRunning).toBe(true);

      // タイマーを停止
      act(() => {
        result.current.stopTimer();
      });

      expect(result.current.isTimerRunning).toBe(false);
    });
  });

  describe("表示制御", () => {
    it("togglePublicで公開状態を切り替えられる", () => {
      const { result } = renderHook(() => useMonitorStore());

      expect(result.current.isPublic).toBe(false);

      act(() => {
        result.current.togglePublic();
      });

      expect(result.current.isPublic).toBe(true);

      act(() => {
        result.current.togglePublic();
      });

      expect(result.current.isPublic).toBe(false);
    });
  });

  describe("getMonitorSnapshot", () => {
    it("現在の状態のスナップショットを正しく返す", () => {
      const { result } = renderHook(() => useMonitorStore());

      // 状態を変更
      act(() => {
        result.current.initializeMatch(mockMatch, "テスト大会", "Aコート", initializeOptions);
        result.current.setPlayerScore("A", 1);
        result.current.togglePublic();
      });

      const snapshot = result.current.getMonitorSnapshot();

      expect(snapshot).toEqual({
        matchId: "test-match-001",
        tournamentName: "テスト大会",
        courtName: "Aコート",
        roundName: "決勝",
        playerA: {
          displayName: "山田",
          teamName: "チームA",
          score: 1,
          hansoku: 0,
        },
        playerB: {
          displayName: "鈴木",
          teamName: "チームB",
          score: 1,
          hansoku: 1,
        },
        timeRemaining: 180,
        isTimerRunning: false,
        isPublic: true,
        matchResult: undefined,
        teamMatchResults: undefined,
        groupMatches: undefined,
        timerMode: "countdown",
        viewMode: "scoreboard",
      });
    });
  });

  describe("複合的なシナリオ", () => {
    it("試合の流れをシミュレート", () => {
      const { result } = renderHook(() => useMonitorStore());

      // 1. 試合を初期化
      act(() => {
        result.current.initializeMatch(mockMatch, "全国大会", "中央コート", initializeOptions);
      });

      expect(result.current.matchId).toBe("test-match-001");
      expect(result.current.tournamentName).toBe("全国大会");

      // 2. タイマーを開始
      act(() => {
        result.current.startTimer();
      });

      expect(result.current.isTimerRunning).toBe(true);

      // 3. 選手Aに1点
      act(() => {
        result.current.setPlayerScore("A", 1);
      });

      expect(result.current.playerA.score).toBe(1);
      expect(result.current.isTimerRunning).toBe(true); // まだ継続

      // 4. 選手Bに反則（赤カード）-> 選手Aに1点追加
      act(() => {
        result.current.setPlayerHansoku("B", 2);
      });

      expect(result.current.playerB.hansoku).toBe(2);
      expect(result.current.playerA.score).toBe(2); // 反則による得点
      expect(result.current.isTimerRunning).toBe(false); // 2点で試合終了

      // 5. 公開状態に切り替え
      act(() => {
        result.current.togglePublic();
      });

      expect(result.current.isPublic).toBe(true);
    });
  });
});
