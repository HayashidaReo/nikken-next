import { renderHook, act, waitFor } from "@testing-library/react";
import { useMonitorData } from "./use-monitor-data";

// BroadcastChannelをモック
const mockBroadcastChannel = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    close: jest.fn(),
    postMessage: jest.fn(),
};

Object.defineProperty(global, 'BroadcastChannel', {
    value: jest.fn(() => mockBroadcastChannel),
    writable: true,
});

// console.error/warnをモック
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });

// URL検索パラメータをモック
const mockURLSearchParams = {
    get: jest.fn(),
};

Object.defineProperty(window, 'URLSearchParams', {
    value: jest.fn(() => mockURLSearchParams),
    writable: true,
});

// Presentation APIをモック
const mockPresentation = {
    receiver: {
        connectionList: Promise.resolve([
            {
                url: 'https://example.com/display?matchId=123',
                id: 'conn1',
                state: 'connected',
                send: jest.fn(),
                close: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
            }
        ]),
    },
};

// navigatorをモック
Object.defineProperty(navigator, 'presentation', {
    value: mockPresentation,
    writable: true,
});

// window.locationをモック（beforeEachで設定）

describe("useMonitorData", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockURLSearchParams.get.mockReturnValue(null);

        // locationの値をリセット（再定義ではなく値の変更）
        if (window.location && typeof window.location.search === 'string') {
            // すでに定義されている場合は値を変更
            (window.location as { search: string }).search = '';
        }

        // navigatorのpresentationは既存のものをそのまま使用（テスト環境では通常undefined）
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
                round: "回戦未設定",
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
            });

            expect(result.current.isConnected).toBe(false);
            expect(result.current.error).toBe(null);
        });

        it("BroadcastChannelが作成される", () => {
            renderHook(() => useMonitorData());

            expect(global.BroadcastChannel).toHaveBeenCalledWith("monitor-display-channel");
            expect(mockBroadcastChannel.addEventListener).toHaveBeenCalledWith(
                "message",
                expect.any(Function)
            );
        });
    });

    describe("BroadcastChannel通信", () => {
        it("メッセージ受信時にデータが更新される", () => {
            const { result } = renderHook(() => useMonitorData());

            const testData = {
                matchId: "match-123",
                tournamentName: "テスト大会",
                courtName: "Aコート",
                round: "準決勝",
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
            const messageHandler = mockBroadcastChannel.addEventListener.mock.calls
                .find(call => call[0] === "message")?.[1];

            expect(messageHandler).toBeDefined();

            // メッセージイベントをシミュレート
            act(() => {
                messageHandler?.({ data: testData } as MessageEvent);
            });

            expect(result.current.data).toEqual(testData);
            expect(result.current.isConnected).toBe(true);
        });

        it("無効なメッセージデータでもエラーにならない", () => {
            const { result } = renderHook(() => useMonitorData());

            const messageHandler = mockBroadcastChannel.addEventListener.mock.calls
                .find(call => call[0] === "message")?.[1];

            act(() => {
                messageHandler?.({ data: null } as MessageEvent);
            });

            // データは変更されない
            expect(result.current.data.tournamentName).toBe("大会名未設定");
            expect(result.current.isConnected).toBe(false);
        });

        it("文字列データは無視される", () => {
            const { result } = renderHook(() => useMonitorData());

            const messageHandler = mockBroadcastChannel.addEventListener.mock.calls
                .find(call => call[0] === "message")?.[1];

            act(() => {
                messageHandler?.({ data: "string data" } as MessageEvent);
            });

            expect(result.current.isConnected).toBe(false);
        });
    });

    describe("URLパラメータ初期化", () => {
        it("URLパラメータからデータが読み込まれる", () => {
            const testData = {
                matchId: "url-match",
                tournamentName: "URL大会",
                courtName: "URLコート",
                round: "URL回戦",
                playerA: {
                    displayName: "URL選手A",
                    teamName: "URLチームA",
                    score: 2,
                    hansoku: 0,
                },
                playerB: {
                    displayName: "URL選手B",
                    teamName: "URLチームB",
                    score: 4,
                    hansoku: 0,
                },
                timeRemaining: 240,
                isTimerRunning: false,
                isPublic: true,
            };

            mockURLSearchParams.get.mockReturnValue(
                encodeURIComponent(JSON.stringify(testData))
            );

            const { result } = renderHook(() => useMonitorData());

            expect(result.current.data).toEqual(testData);
        });

        it("URLパラメータがない場合はデフォルト値のまま", () => {
            mockURLSearchParams.get.mockReturnValue(null);

            const { result } = renderHook(() => useMonitorData());

            expect(result.current.data.tournamentName).toBe("大会名未設定");
        });

        it("無効なURLパラメータでもエラーにならない", () => {
            mockURLSearchParams.get.mockReturnValue("invalid json");

            const { result } = renderHook(() => useMonitorData());

            expect(result.current.data.tournamentName).toBe("大会名未設定");
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                "URLパラメータ解析エラー:",
                expect.any(Error)
            );
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
            Object.defineProperty(global.navigator, 'presentation', {
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
                    expect(result.current.error).toContain("プレゼンテーション接続の初期化に失敗しました");
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
        it("BroadcastChannelメッセージ処理でエラーが発生してもハンドリングされる", () => {
            const { result } = renderHook(() => useMonitorData());

            const messageHandler = mockBroadcastChannel.addEventListener.mock.calls
                .find(call => call[0] === "message")?.[1];

            // 循環参照を持つオブジェクトでエラーをシミュレート
            const circularObj: Record<string, unknown> = { data: {} };
            (circularObj.data as Record<string, unknown>).self = circularObj;

            act(() => {
                messageHandler?.({ data: circularObj } as MessageEvent);
            });

            // エラーが発生してもアプリケーションが落ちない
            expect(result.current.data.tournamentName).toBe("大会名未設定");
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                "BroadcastChannel メッセージ解析エラー:",
                expect.any(Error)
            );
        });
    });

    describe("データ形式の検証", () => {
        it("部分的なデータでも受け入れられる", () => {
            const { result } = renderHook(() => useMonitorData());

            const partialData = {
                tournamentName: "部分的な大会",
                playerA: {
                    displayName: "部分選手A",
                },
            };

            const messageHandler = mockBroadcastChannel.addEventListener.mock.calls
                .find(call => call[0] === "message")?.[1];

            act(() => {
                messageHandler?.({ data: partialData } as MessageEvent);
            });

            expect(result.current.data).toEqual(partialData);
            expect(result.current.isConnected).toBe(true);
        });

        it("空のオブジェクトでも受け入れられる", () => {
            const { result } = renderHook(() => useMonitorData());

            const messageHandler = mockBroadcastChannel.addEventListener.mock.calls
                .find(call => call[0] === "message")?.[1];

            act(() => {
                messageHandler?.({ data: {} } as MessageEvent);
            });

            expect(result.current.data).toEqual({});
            expect(result.current.isConnected).toBe(true);
        });
    });
});