/**
 * @jest-environment jsdom
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { useAsync } from "./useAsync";

describe("useAsync", () => {
    describe("基本機能", () => {
        it("成功時にデータが設定される", async () => {
            const mockAsyncFn = jest.fn().mockResolvedValue("success data");

            const { result } = renderHook(() =>
                useAsync(mockAsyncFn, [], { immediate: false })
            );

            expect(result.current.loading).toBe(false);
            expect(result.current.data).toBeUndefined();
            expect(result.current.error).toBeNull();

            await act(async () => {
                await result.current.execute();
            });

            expect(result.current.loading).toBe(false);
            expect(result.current.data).toBe("success data");
            expect(result.current.error).toBeNull();
            expect(mockAsyncFn).toHaveBeenCalledTimes(1);
        });

        it("エラー時にエラー状態が設定される", async () => {
            const mockError = new Error("Test error");
            const mockAsyncFn = jest.fn().mockRejectedValue(mockError);

            const { result } = renderHook(() =>
                useAsync(mockAsyncFn, [], { immediate: false })
            );

            await act(async () => {
                try {
                    await result.current.execute();
                } catch {
                    // エラーは期待されている
                }
            });

            expect(result.current.loading).toBe(false);
            expect(result.current.data).toBeUndefined();
            expect(result.current.error).toBe(mockError);
        });

        it("文字列エラーがErrorオブジェクトに変換される", async () => {
            const mockAsyncFn = jest.fn().mockRejectedValue("string error");

            const { result } = renderHook(() =>
                useAsync(mockAsyncFn, [], { immediate: false })
            );

            await act(async () => {
                try {
                    await result.current.execute();
                } catch {
                    // エラーは期待されている
                }
            });

            expect(result.current.error).toBeInstanceOf(Error);
            expect(result.current.error?.message).toBe("予期しないエラーが発生しました");
        });

        it("ローディング状態が正しく管理される", async () => {
            const mockAsyncFn = jest.fn().mockResolvedValue("resolved data");

            const { result } = renderHook(() =>
                useAsync(mockAsyncFn, [], { immediate: false })
            );

            expect(result.current.loading).toBe(false);

            // execute実行
            await act(async () => {
                await result.current.execute();
            });

            expect(result.current.loading).toBe(false);
            expect(result.current.data).toBe("resolved data");
        });
    });

    describe("オプション機能", () => {
        it("initialDataが設定される", () => {
            const mockAsyncFn = jest.fn().mockResolvedValue("new data");

            const { result } = renderHook(() =>
                useAsync(mockAsyncFn, [], {
                    immediate: false,
                    initialData: "initial data"
                })
            );

            expect(result.current.data).toBe("initial data");
        });

        it("immediate: trueで自動実行される", async () => {
            const mockAsyncFn = jest.fn().mockResolvedValue("auto data");

            const { result } = renderHook(() =>
                useAsync(mockAsyncFn, [], { immediate: true })
            );

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.data).toBe("auto data");
            expect(mockAsyncFn).toHaveBeenCalledTimes(1);
        });

        it("immediate: falseで自動実行されない", () => {
            const mockAsyncFn = jest.fn().mockResolvedValue("no auto data");

            const { result } = renderHook(() =>
                useAsync(mockAsyncFn, [], { immediate: false })
            );

            expect(result.current.data).toBeUndefined();
            expect(mockAsyncFn).not.toHaveBeenCalled();
        });

        it("onSuccessコールバックが呼ばれる", async () => {
            const mockAsyncFn = jest.fn().mockResolvedValue("callback data");
            const onSuccess = jest.fn();

            const { result } = renderHook(() =>
                useAsync(mockAsyncFn, [], {
                    immediate: false,
                    onSuccess
                })
            );

            await act(async () => {
                await result.current.execute();
            });

            expect(onSuccess).toHaveBeenCalledWith("callback data");
            expect(onSuccess).toHaveBeenCalledTimes(1);
        });

        it("onErrorコールバックが呼ばれる", async () => {
            const mockError = new Error("Callback error");
            const mockAsyncFn = jest.fn().mockRejectedValue(mockError);
            const onError = jest.fn();

            const { result } = renderHook(() =>
                useAsync(mockAsyncFn, [], {
                    immediate: false,
                    onError
                })
            );

            await act(async () => {
                try {
                    await result.current.execute();
                } catch {
                    // エラーは期待されている
                }
            });

            expect(onError).toHaveBeenCalledWith(mockError);
            expect(onError).toHaveBeenCalledTimes(1);
        });
    });

    describe("retryとreset", () => {
        it("retryで再実行できる", async () => {
            const mockAsyncFn = jest.fn()
                .mockRejectedValueOnce(new Error("First call fails"))
                .mockResolvedValueOnce("Second call succeeds");

            const { result } = renderHook(() =>
                useAsync(mockAsyncFn, [], { immediate: false })
            );

            // 最初の実行は失敗
            await act(async () => {
                try {
                    await result.current.execute();
                } catch {
                    // エラーは期待されている
                }
            });

            expect(result.current.error).toBeInstanceOf(Error);
            expect(result.current.data).toBeUndefined();

            // retry で再実行し、今度は成功
            await act(async () => {
                await result.current.retry();
            });

            expect(result.current.error).toBeNull();
            expect(result.current.data).toBe("Second call succeeds");
            expect(mockAsyncFn).toHaveBeenCalledTimes(2);
        });

        it("resetで状態がクリアされる", async () => {
            const mockAsyncFn = jest.fn().mockResolvedValue("data to reset");

            const { result } = renderHook(() =>
                useAsync(mockAsyncFn, [], {
                    immediate: false,
                    initialData: "initial"
                })
            );

            // データを設定
            await act(async () => {
                await result.current.execute();
            });

            expect(result.current.data).toBe("data to reset");

            // reset
            act(() => {
                result.current.reset();
            });

            expect(result.current.data).toBe("initial");
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBeNull();
        });
    });

    describe("依存配列", () => {
        it("依存配列が変更されると再実行される", async () => {
            const mockAsyncFn = jest.fn().mockResolvedValue("dependency data");
            let dependency = 1;

            const { result, rerender } = renderHook(
                ({ dep }) => useAsync(mockAsyncFn, [dep], { immediate: true }),
                { initialProps: { dep: dependency } }
            );

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(mockAsyncFn).toHaveBeenCalledTimes(1);

            // 依存配列を変更
            dependency = 2;
            rerender({ dep: dependency });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(mockAsyncFn).toHaveBeenCalledTimes(2);
        });

        it("依存配列が同じ値なら再実行されない", async () => {
            const mockAsyncFn = jest.fn().mockResolvedValue("same dependency");
            const dependency = 1;

            const { result, rerender } = renderHook(
                ({ dep }) => useAsync(mockAsyncFn, [dep], { immediate: true }),
                { initialProps: { dep: dependency } }
            );

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(mockAsyncFn).toHaveBeenCalledTimes(1);

            // 同じ依存配列で再レンダリング
            rerender({ dep: dependency });

            // 少し待って再実行されていないことを確認
            await new Promise(resolve => setTimeout(resolve, 100));

            expect(mockAsyncFn).toHaveBeenCalledTimes(1);
        });
    });
});