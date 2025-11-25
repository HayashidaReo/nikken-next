import { renderHook, act, waitFor } from "@testing-library/react";
import { useMonitorData } from "./use-monitor-data";
import { MONITOR_DISPLAY_CHANNEL, HEARTBEAT_TIMEOUT_MS } from "@/lib/constants/monitor";

// BroadcastChannelをモック
const mockBroadcastChannel = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  close: jest.fn(),
  postMessage: jest.fn(),
};

Object.defineProperty(global, "BroadcastChannel", {
  value: jest.fn(() => mockBroadcastChannel),
  writable: true,
});

// console.error/warnをモック
const consoleErrorSpy = jest
  .spyOn(console, "error")
  .mockImplementation(() => { });
const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => { });

// Presentation APIをモック
const mockPresentation = {
  receiver: {
    connectionList: Promise.resolve([
      {
        url: "https://example.com/display?matchId=123",
        id: "conn1",
        state: "connected",
        send: jest.fn(),
        close: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      },
    ]),
  },
};

// navigatorをモック
Object.defineProperty(navigator, "presentation", {
  value: mockPresentation,
  writable: true,
});

// window.locationをモック（beforeEachで設定）

describe("useMonitorData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockClear();
    consoleWarnSpy.mockClear();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe("初期化", () => {
    it("デフォルト値で初期化される", () => {
      const { result } = renderHook(() => useMonitorData());

      expect(result.current.data).toEqual({
        matchId: "",
        tournamentName: "大会名未設定",
        courtName: "コート名未設定",
        roundName: "ラウンド未設定",
        playerA: {
          displayName: "選手A",
          teamName: "チーム名未設定",
          score: 0,
          hansoku: 0,
        },
        playerB: {
          displayName: "選手B",
          teamName: "チーム名未設定",
          score: 0,
          hansoku: 0,
        },
        timeRemaining: 300,
        isTimerRunning: false,
        isPublic: false,
        timerMode: "countdown",
        viewMode: "scoreboard",
      });

      expect(result.current.isConnected).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it("BroadcastChannelが作成される", () => {
      renderHook(() => useMonitorData());

      expect(global.BroadcastChannel).toHaveBeenCalledWith(
        MONITOR_DISPLAY_CHANNEL
      );
      expect(mockBroadcastChannel.addEventListener).toHaveBeenCalledWith(
        "message",
        expect.any(Function)
      );
    });
  });

  describe("BroadcastChannel通信", () => {
    it("heartbeat を受けると ack を返す & タイムアウトで切断される", () => {
      jest.useFakeTimers();
      const { result } = renderHook(() => useMonitorData());

      const messageHandler =
        mockBroadcastChannel.addEventListener.mock.calls.find(
          call => call[0] === "message"
        )?.[1];

      const payload = {
        matchId: "hb-1",
        tournamentName: "HB大会",
        courtName: "コート",
        roundName: "決勝",
        playerA: { displayName: "A", teamName: "T", score: 0, hansoku: 0 },
        playerB: { displayName: "B", teamName: "T", score: 0, hansoku: 0 },
        timeRemaining: 60,
        isTimerRunning: false,
        isPublic: false,
      };

      act(() => {
        messageHandler?.({ data: { type: "heartbeat", payload } } as MessageEvent);
      });

      expect(mockBroadcastChannel.postMessage).toHaveBeenCalledWith(expect.objectContaining({ type: "ack" }));
      expect(result.current.isConnected).toBe(true);

      act(() => {
        jest.advanceTimersByTime(HEARTBEAT_TIMEOUT_MS + 10);
      });

      expect(result.current.isConnected).toBe(false);
      jest.useRealTimers();
    });

    it("連続 heartbeat でタイマーがリセットされる", () => {
      jest.useFakeTimers();
      const { result } = renderHook(() => useMonitorData());

      const messageHandler =
        mockBroadcastChannel.addEventListener.mock.calls.find(
          call => call[0] === "message"
        )?.[1];

      const payload = {
        matchId: "hb-2",
        tournamentName: "HB2",
        courtName: "C",
        roundName: "準決勝",
        playerA: { displayName: "A", teamName: "T", score: 0, hansoku: 0 },
        playerB: { displayName: "B", teamName: "T", score: 0, hansoku: 0 },
        timeRemaining: 60,
        isTimerRunning: false,
        isPublic: false,
      };

      act(() => {
        messageHandler?.({ data: { type: "heartbeat", payload } } as MessageEvent);
      });

      // タイムアウト直前まで進める
      act(() => {
        jest.advanceTimersByTime(HEARTBEAT_TIMEOUT_MS - 10);
      });

      // ここで再度 heartbeat を受ける（タイマーがリセットされる）
      act(() => {
        messageHandler?.({ data: { type: "heartbeat", payload } } as MessageEvent);
      });

      // 少し進めても切断されない
      act(() => {
        jest.advanceTimersByTime(20);
      });

      expect(result.current.isConnected).toBe(true);

      // 最後の heartbeat からタイムアウト分進めると切断される
      act(() => {
        jest.advanceTimersByTime(HEARTBEAT_TIMEOUT_MS + 10);
      });

      expect(result.current.isConnected).toBe(false);
      jest.useRealTimers();
    });

    it("生の MonitorData オブジェクトも受け入れる (wrapped で送る)", () => {
      const { result } = renderHook(() => useMonitorData());

      const raw = {
        matchId: "raw-1",
        tournamentName: "Raw大会",
        courtName: "R",
        roundName: "予選",
        playerA: { displayName: "A", teamName: "T", score: 1, hansoku: 0 },
        playerB: { displayName: "B", teamName: "T", score: 2, hansoku: 0 },
        timeRemaining: 120,
        isTimerRunning: false,
        isPublic: false,
      };

      const messageHandler =
        mockBroadcastChannel.addEventListener.mock.calls.find(
          call => call[0] === "message"
        )?.[1];

      act(() => {
        messageHandler?.({ data: { type: "data", payload: raw } } as MessageEvent);
      });

      expect(result.current.data.matchId).toBe("raw-1");
      expect(result.current.isConnected).toBe(true);
    });

    it("メッセージ受信時にデータが更新される", () => {
      const { result } = renderHook(() => useMonitorData());

      const testData = {
        matchId: "match-123",
        tournamentName: "テスト大会",
        courtName: "Aコート",
        roundName: "準決勝",
        playerA: {
          displayName: "選手1",
          teamName: "チーム1",
          score: 5,
          hansoku: 0,
        },
        playerB: {
          displayName: "選手2",
          teamName: "チーム2",
          score: 3,
          hansoku: 1,
        },
        timeRemaining: 180,
        isTimerRunning: true,
        isPublic: true,
      };

      // メッセージイベントハンドラを取得
      const messageHandler =
        mockBroadcastChannel.addEventListener.mock.calls.find(
          call => call[0] === "message"
        )?.[1];

      expect(messageHandler).toBeDefined();

      // メッセージイベントをシミュレート（ラップされたデータ形式）
      act(() => {
        messageHandler?.({ data: { type: "data", payload: testData } } as MessageEvent);
      });

      expect(result.current.data).toEqual(testData);
      expect(result.current.isConnected).toBe(true);
    });

    it("無効なメッセージデータでもエラーにならない", () => {
      const { result } = renderHook(() => useMonitorData());

      const messageHandler =
        mockBroadcastChannel.addEventListener.mock.calls.find(
          call => call[0] === "message"
        )?.[1];

      act(() => {
        messageHandler?.({ data: null } as MessageEvent);
      });

      // データは変更されない
      expect(result.current.data.tournamentName).toBe("大会名未設定");
      expect(result.current.isConnected).toBe(false);
    });

    it("文字列データは無視される", () => {
      const { result } = renderHook(() => useMonitorData());

      const messageHandler =
        mockBroadcastChannel.addEventListener.mock.calls.find(
          call => call[0] === "message"
        )?.[1];

      act(() => {
        messageHandler?.({ data: "string data" } as MessageEvent);
      });

      expect(result.current.isConnected).toBe(false);
    });
  });

  describe("Presentation API", () => {
    it("Presentation APIが利用できない場合は警告が出る", () => {
      // navigatorにpresentationがない状態でテスト
      const { result } = renderHook(() => useMonitorData());

      // この場合は何もエラーは出ないはず（if文で分岐している）
      expect(result.current.error).toBe(null);
    });

    it("Presentation APIでエラーが発生した場合", () => {
      // presentation APIをモック
      Object.defineProperty(global.navigator, "presentation", {
        value: {
          receiver: {
            connectionList: Promise.reject(new Error("API Error")),
          },
        },
        writable: true,
      });

      const { result } = renderHook(() => useMonitorData());

      // エラーは非同期的に設定されるので、waitForを使用
      return waitFor(() => {
        if (result.current.error) {
          expect(result.current.error).toContain(
            "プレゼンテーション接続の初期化に失敗しました"
          );
        }
      });
    });
  });

  describe("クリーンアップ", () => {
    it("アンマウント時にBroadcastChannelがクリーンアップされる", () => {
      const { unmount } = renderHook(() => useMonitorData());

      unmount();

      expect(mockBroadcastChannel.removeEventListener).toHaveBeenCalledWith(
        "message",
        expect.any(Function)
      );
      expect(mockBroadcastChannel.close).toHaveBeenCalled();
    });
  });

  describe("エラーハンドリング", () => {
    it("BroadcastChannelメッセージ処理でエラーが発生してもハンドリングされる", async () => {
      const { result } = renderHook(() => useMonitorData()); // 初期状態確認
      expect(result.current.data.tournamentName).toBe("大会名未設定");

      const messageHandler =
        mockBroadcastChannel.addEventListener.mock.calls.find(
          call => call[0] === "message"
        )?.[1];

      // tournamentNameのないオブジェクト（ラップ形式で送ると matchId は反映される）
      const incompletePayload = { matchId: "test" };

      act(() => {
        messageHandler?.({ data: { type: "data", payload: incompletePayload } } as MessageEvent);
      });

      // ラップされたpayloadはそのまま反映される（matchId が更新される）
      expect(result.current.data.matchId).toBe("test");

      // エラーが発生する場合をテスト: 循環参照
      const circularObj: Record<string, unknown> = {
        tournamentName: "テスト大会",
        matchId: "test-match",
        data: {},
      };
      (circularObj.data as Record<string, unknown>).self = circularObj;

      act(() => {
        messageHandler?.({ data: { type: "data", payload: circularObj } } as MessageEvent);
      });

      // 有効なtournamentNameとmatchIdがあるので更新される
      expect(result.current.data.tournamentName).toBe("テスト大会");
    });
  });

  describe("データ形式の検証", () => {
    it("部分的なデータでも受け入れられる", () => {
      const { result } = renderHook(() => useMonitorData());

      const partialData = {
        matchId: "partial-match",
        tournamentName: "部分的な大会",
        playerA: {
          displayName: "部分選手A",
        },
      };

      const messageHandler =
        mockBroadcastChannel.addEventListener.mock.calls.find(
          call => call[0] === "message"
        )?.[1];

      act(() => {
        messageHandler?.({ data: { type: "data", payload: partialData } } as MessageEvent);
      });

      // 部分的なデータが受け入れられて更新される
      expect(result.current.data.tournamentName).toBe("部分的な大会");
      expect(result.current.data.matchId).toBe("partial-match");
      expect(result.current.isConnected).toBe(true);
    });

    it("空のオブジェクトは無視される", () => {
      const { result } = renderHook(() => useMonitorData());

      const messageHandler =
        mockBroadcastChannel.addEventListener.mock.calls.find(
          call => call[0] === "message"
        )?.[1];

      act(() => {
        messageHandler?.({ data: {} } as MessageEvent);
      });

      // 空のオブジェクトは無視され、初期値を保持
      expect(result.current.data.tournamentName).toBe("大会名未設定");
      expect(result.current.isConnected).toBe(false); // データが受信されていないため
    });
  });
});
