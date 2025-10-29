import { renderHook, act } from "@testing-library/react";
import { useLongPress } from "./useLongPress";

// タイマー関数をモック
jest.useFakeTimers();

describe("useLongPress", () => {
    const mockCallback = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
        jest.useFakeTimers();
    });

    describe("基本的な動作", () => {
        it("正しいイベントハンドラが返される", () => {
            const { result } = renderHook(() => useLongPress(mockCallback));

            expect(result.current).toHaveProperty("onMouseDown");
            expect(result.current).toHaveProperty("onMouseUp");
            expect(result.current).toHaveProperty("onMouseLeave");
            expect(result.current).toHaveProperty("onTouchStart");
            expect(result.current).toHaveProperty("onTouchEnd");

            expect(typeof result.current.onMouseDown).toBe("function");
            expect(typeof result.current.onMouseUp).toBe("function");
            expect(typeof result.current.onMouseLeave).toBe("function");
            expect(typeof result.current.onTouchStart).toBe("function");
            expect(typeof result.current.onTouchEnd).toBe("function");
        });

        it("マウスダウンで即座にコールバックが実行される", () => {
            const { result } = renderHook(() => useLongPress(mockCallback));

            act(() => {
                result.current.onMouseDown();
            });

            expect(mockCallback).toHaveBeenCalledTimes(1);
        });

        it("タッチスタートで即座にコールバックが実行される", () => {
            const { result } = renderHook(() => useLongPress(mockCallback));

            act(() => {
                result.current.onTouchStart();
            });

            expect(mockCallback).toHaveBeenCalledTimes(1);
        });
    });

    describe("長押し動作", () => {
        it("デフォルトの遅延時間(500ms)後に長押し処理が開始される", () => {
            const { result } = renderHook(() => useLongPress(mockCallback));

            act(() => {
                result.current.onMouseDown();
            });

            expect(mockCallback).toHaveBeenCalledTimes(1);

            // 500ms経過
            act(() => {
                jest.advanceTimersByTime(500);
            });

            // さらに100ms経過（デフォルトのinterval）
            act(() => {
                jest.advanceTimersByTime(100);
            });

            expect(mockCallback).toHaveBeenCalledTimes(2);
        });

        it("カスタムの遅延時間が正しく動作する", () => {
            const { result } = renderHook(() =>
                useLongPress(mockCallback, { delay: 1000 })
            );

            act(() => {
                result.current.onMouseDown();
            });

            // 500ms経過（まだ長押し処理は開始されない）
            act(() => {
                jest.advanceTimersByTime(500);
            });

            expect(mockCallback).toHaveBeenCalledTimes(1);

            // さらに500ms経過（合計1000ms）
            act(() => {
                jest.advanceTimersByTime(500);
            });

            // さらに100ms経過
            act(() => {
                jest.advanceTimersByTime(100);
            });

            expect(mockCallback).toHaveBeenCalledTimes(2);
        });

        it("カスタムの実行間隔が正しく動作する", () => {
            const { result } = renderHook(() =>
                useLongPress(mockCallback, { delay: 500, interval: 50 })
            );

            act(() => {
                result.current.onMouseDown();
            });

            // 500ms経過（長押し処理開始）
            act(() => {
                jest.advanceTimersByTime(500);
            });

            // 50ms経過
            act(() => {
                jest.advanceTimersByTime(50);
            });

            expect(mockCallback).toHaveBeenCalledTimes(2);

            // さらに50ms経過
            act(() => {
                jest.advanceTimersByTime(50);
            });

            expect(mockCallback).toHaveBeenCalledTimes(3);
        });

        it("長押し中に複数回コールバックが実行される", () => {
            const { result } = renderHook(() => useLongPress(mockCallback));

            act(() => {
                result.current.onMouseDown();
            });

            // 500ms + 300ms経過（3回の100msインターバル）
            act(() => {
                jest.advanceTimersByTime(800);
            });

            expect(mockCallback).toHaveBeenCalledTimes(4); // 初回 + 3回のインターバル
        });
    });

    describe("停止動作", () => {
        it("マウスアップで長押し処理が停止される", () => {
            const { result } = renderHook(() => useLongPress(mockCallback));

            act(() => {
                result.current.onMouseDown();
            });

            // 300ms経過（遅延時間未満）
            act(() => {
                jest.advanceTimersByTime(300);
            });

            act(() => {
                result.current.onMouseUp();
            });

            // さらに300ms経過
            act(() => {
                jest.advanceTimersByTime(300);
            });

            // 長押し処理は開始されない
            expect(mockCallback).toHaveBeenCalledTimes(1);
        });

        it("マウスリーブで長押し処理が停止される", () => {
            const { result } = renderHook(() => useLongPress(mockCallback));

            act(() => {
                result.current.onMouseDown();
            });

            act(() => {
                result.current.onMouseLeave();
            });

            act(() => {
                jest.advanceTimersByTime(1000);
            });

            expect(mockCallback).toHaveBeenCalledTimes(1);
        });

        it("タッチエンドで長押し処理が停止される", () => {
            const { result } = renderHook(() => useLongPress(mockCallback));

            act(() => {
                result.current.onTouchStart();
            });

            act(() => {
                result.current.onTouchEnd();
            });

            act(() => {
                jest.advanceTimersByTime(1000);
            });

            expect(mockCallback).toHaveBeenCalledTimes(1);
        });

        it("長押し中に停止すると繰り返し処理が止まる", () => {
            const { result } = renderHook(() => useLongPress(mockCallback));

            act(() => {
                result.current.onMouseDown();
            });

            // 長押し処理開始
            act(() => {
                jest.advanceTimersByTime(600);
            });

            expect(mockCallback).toHaveBeenCalledTimes(2);

            // 停止
            act(() => {
                result.current.onMouseUp();
            });

            // さらに時間が経過しても追加実行されない
            act(() => {
                jest.advanceTimersByTime(1000);
            });

            expect(mockCallback).toHaveBeenCalledTimes(2);
        });
    });

    describe("disabled オプション", () => {
        it("disabled=trueの場合、コールバックが実行されない", () => {
            const { result } = renderHook(() =>
                useLongPress(mockCallback, { disabled: true })
            );

            act(() => {
                result.current.onMouseDown();
            });

            act(() => {
                jest.advanceTimersByTime(1000);
            });

            expect(mockCallback).not.toHaveBeenCalled();
        });

        it("動的にdisabledが変更される", () => {
            const { result, rerender } = renderHook(
                ({ disabled }) => useLongPress(mockCallback, { disabled }),
                { initialProps: { disabled: false } }
            );

            // 最初は有効
            act(() => {
                result.current.onMouseDown();
            });

            expect(mockCallback).toHaveBeenCalledTimes(1);

            act(() => {
                result.current.onMouseUp();
            });

            mockCallback.mockClear();

            // disabledに変更
            rerender({ disabled: true });

            act(() => {
                result.current.onMouseDown();
            });

            expect(mockCallback).not.toHaveBeenCalled();
        });
    });

    describe("コールバック更新", () => {
        it("コールバック関数が更新されても最新の関数が使用される", () => {
            const firstCallback = jest.fn();
            const secondCallback = jest.fn();

            const { result, rerender } = renderHook(
                ({ callback }) => useLongPress(callback),
                { initialProps: { callback: firstCallback } }
            );

            act(() => {
                result.current.onMouseDown();
            });

            expect(firstCallback).toHaveBeenCalledTimes(1);
            expect(secondCallback).not.toHaveBeenCalled();

            // コールバック更新
            rerender({ callback: secondCallback });

            // 長押し処理開始
            act(() => {
                jest.advanceTimersByTime(600);
            });

            expect(firstCallback).toHaveBeenCalledTimes(1);
            expect(secondCallback).toHaveBeenCalledTimes(1);
        });
    });

    describe("クリーンアップ", () => {
        it("コンポーネントアンマウント時にタイマーがクリアされる", () => {
            const { result, unmount } = renderHook(() => useLongPress(mockCallback));

            act(() => {
                result.current.onMouseDown();
            });

            // アンマウント
            unmount();

            // タイマーが動作しないことを確認
            act(() => {
                jest.advanceTimersByTime(1000);
            });

            expect(mockCallback).toHaveBeenCalledTimes(1); // 初回のみ
        });
    });

    describe("エッジケース", () => {
        it("短時間での連続操作が正しく処理される", () => {
            const { result } = renderHook(() => useLongPress(mockCallback));

            // 開始
            act(() => {
                result.current.onMouseDown();
            });

            // すぐに停止
            act(() => {
                result.current.onMouseUp();
            });

            // 再度開始
            act(() => {
                result.current.onMouseDown();
            });

            expect(mockCallback).toHaveBeenCalledTimes(2);

            // 長押し処理確認
            act(() => {
                jest.advanceTimersByTime(600);
            });

            expect(mockCallback).toHaveBeenCalledTimes(3);
        });

        it("ゼロまたは負の値のオプションでもエラーにならない", () => {
            const { result } = renderHook(() =>
                useLongPress(mockCallback, { delay: 0, interval: 0 })
            );

            expect(() => {
                act(() => {
                    result.current.onMouseDown();
                });
            }).not.toThrow();

            expect(mockCallback).toHaveBeenCalled();
        });
    });
});