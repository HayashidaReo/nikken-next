/**
 * @jest-environment jsdom
 */

import { renderHook, act } from "@testing-library/react";
import { useFormSubmit } from "./useFormSubmit";

// alertのモック
global.alert = jest.fn();

describe("useFormSubmit", () => {
    const mockAlert = global.alert as jest.MockedFunction<typeof alert>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("初期状態", () => {
        it("正しい初期値を持つ", () => {
            const { result } = renderHook(() => useFormSubmit());

            expect(result.current.isLoading).toBe(false);
            expect(result.current.error).toBeNull();
            expect(typeof result.current.handleSubmit).toBe("function");
            expect(typeof result.current.clearError).toBe("function");
        });
    });

    describe("成功時の処理", () => {
        it("正常に送信が完了する", async () => {
            const mockSubmitFn = jest.fn().mockResolvedValue(undefined);
            const mockOnSuccess = jest.fn();
            const testData = { name: "テスト", email: "test@example.com" };

            const { result } = renderHook(() => useFormSubmit());

            await act(async () => {
                await result.current.handleSubmit(mockSubmitFn, testData, {
                    onSuccess: mockOnSuccess,
                });
            });

            expect(mockSubmitFn).toHaveBeenCalledWith(testData);
            expect(mockOnSuccess).toHaveBeenCalled();
            expect(result.current.isLoading).toBe(false);
            expect(result.current.error).toBeNull();
        });

        it("onSuccessコールバックなしでも動作する", async () => {
            const mockSubmitFn = jest.fn().mockResolvedValue(undefined);
            const testData = { value: 123 };

            const { result } = renderHook(() => useFormSubmit());

            await act(async () => {
                await result.current.handleSubmit(mockSubmitFn, testData);
            });

            expect(mockSubmitFn).toHaveBeenCalledWith(testData);
            expect(result.current.isLoading).toBe(false);
            expect(result.current.error).toBeNull();
        });
    });

    describe("エラー時の処理", () => {
        it("Errorオブジェクトのエラーを正しく処理する", async () => {
            const errorMessage = "送信エラーが発生しました";
            const mockSubmitFn = jest.fn().mockRejectedValue(new Error(errorMessage));
            const mockOnError = jest.fn();
            const testData = { name: "テスト" };

            const { result } = renderHook(() => useFormSubmit());

            await act(async () => {
                await result.current.handleSubmit(mockSubmitFn, testData, {
                    onError: mockOnError,
                });
            });

            expect(result.current.error).toBe(errorMessage);
            expect(result.current.isLoading).toBe(false);
            expect(mockOnError).toHaveBeenCalledWith(expect.any(Error));
            expect(mockOnError).toHaveBeenCalledWith(
                expect.objectContaining({ message: errorMessage })
            );
        });

        it("非Errorオブジェクトのエラーをデフォルトメッセージで処理する", async () => {
            const mockSubmitFn = jest.fn().mockRejectedValue("文字列エラー");
            const mockOnError = jest.fn();
            const testData = { name: "テスト" };

            const { result } = renderHook(() => useFormSubmit());

            await act(async () => {
                await result.current.handleSubmit(mockSubmitFn, testData, {
                    onError: mockOnError,
                });
            });

            expect(result.current.error).toBe("送信に失敗しました");
            expect(mockOnError).toHaveBeenCalledWith(expect.any(Error));
            expect(mockOnError).toHaveBeenCalledWith(
                expect.objectContaining({ message: "送信に失敗しました" })
            );
        });

        it("showErrorAlertが有効な場合はアラートを表示する", async () => {
            const errorMessage = "アラート表示テスト";
            const mockSubmitFn = jest.fn().mockRejectedValue(new Error(errorMessage));
            const testData = { name: "テスト" };

            const { result } = renderHook(() => useFormSubmit());

            await act(async () => {
                await result.current.handleSubmit(mockSubmitFn, testData, {
                    showErrorAlert: true,
                });
            });

            expect(mockAlert).toHaveBeenCalledWith(errorMessage);
            expect(result.current.error).toBe(errorMessage);
        });

        it("showErrorAlertが無効な場合はアラートを表示しない", async () => {
            const errorMessage = "アラート非表示テスト";
            const mockSubmitFn = jest.fn().mockRejectedValue(new Error(errorMessage));
            const testData = { name: "テスト" };

            const { result } = renderHook(() => useFormSubmit());

            await act(async () => {
                await result.current.handleSubmit(mockSubmitFn, testData, {
                    showErrorAlert: false,
                });
            });

            expect(mockAlert).not.toHaveBeenCalled();
            expect(result.current.error).toBe(errorMessage);
        });

        it("onErrorコールバックなしでもエラーを処理する", async () => {
            const errorMessage = "コールバック無しエラー";
            const mockSubmitFn = jest.fn().mockRejectedValue(new Error(errorMessage));
            const testData = { name: "テスト" };

            const { result } = renderHook(() => useFormSubmit());

            await act(async () => {
                await result.current.handleSubmit(mockSubmitFn, testData);
            });

            expect(result.current.error).toBe(errorMessage);
            expect(result.current.isLoading).toBe(false);
        });
    });

    describe("ローディング状態の管理", () => {
        it("送信中はローディング状態になる", async () => {
            const mockSubmitFn = jest.fn().mockImplementation(
                () => new Promise(resolve => setTimeout(resolve, 100))
            );
            const testData = { name: "ローディングテスト" };

            const { result } = renderHook(() => useFormSubmit());

            let submitPromise: Promise<void>;
            act(() => {
                submitPromise = result.current.handleSubmit(mockSubmitFn, testData);
            });

            // 送信開始直後はローディング状態
            expect(result.current.isLoading).toBe(true);
            expect(result.current.error).toBeNull();

            await act(async () => {
                await submitPromise;
            });

            // 送信完了後はローディング解除
            expect(result.current.isLoading).toBe(false);
        });

        it("エラー発生時もローディング状態が解除される", async () => {
            const mockSubmitFn = jest.fn().mockImplementation(
                () => new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("テストエラー")), 100)
                )
            );
            const testData = { name: "エラーテスト" };

            const { result } = renderHook(() => useFormSubmit());

            let submitPromise: Promise<void>;
            act(() => {
                submitPromise = result.current.handleSubmit(mockSubmitFn, testData);
            });

            // エラー発生前はローディング状態
            expect(result.current.isLoading).toBe(true);

            await act(async () => {
                await submitPromise;
            });

            // エラー発生後もローディング解除
            expect(result.current.isLoading).toBe(false);
            expect(result.current.error).toBe("テストエラー");
        });

        it("送信開始時に既存のエラーがクリアされる", async () => {
            const mockSubmitFn = jest.fn().mockResolvedValue(undefined);
            const testData = { name: "エラークリアテスト" };

            const { result } = renderHook(() => useFormSubmit<typeof testData>());

            // 最初にエラーを発生させる
            const errorSubmitFn = jest.fn().mockRejectedValue(new Error("初回エラー"));
            await act(async () => {
                await result.current.handleSubmit(errorSubmitFn, testData);
            });

            expect(result.current.error).toBe("初回エラー");

            // 次の送信で成功させる
            await act(async () => {
                await result.current.handleSubmit(mockSubmitFn, testData);
            });

            expect(result.current.error).toBeNull();
        });
    });

    describe("clearError", () => {
        it("エラーをクリアできる", async () => {
            const mockSubmitFn = jest.fn().mockRejectedValue(new Error("クリア対象エラー"));
            const testData = { name: "テスト" };

            const { result } = renderHook(() => useFormSubmit());

            // エラーを発生させる
            await act(async () => {
                await result.current.handleSubmit(mockSubmitFn, testData);
            });

            expect(result.current.error).toBe("クリア対象エラー");

            // エラーをクリア
            act(() => {
                result.current.clearError();
            });

            expect(result.current.error).toBeNull();
        });

        it("エラーがない状態でclearErrorを呼んでも問題ない", () => {
            const { result } = renderHook(() => useFormSubmit());

            expect(result.current.error).toBeNull();

            act(() => {
                result.current.clearError();
            });

            expect(result.current.error).toBeNull();
        });
    });

    describe("型安全性", () => {
        it("ジェネリック型で型安全に動作する", async () => {
            interface FormData {
                name: string;
                age: number;
                email: string;
            }

            const mockSubmitFn = jest.fn<Promise<void>, [FormData]>().mockResolvedValue(undefined);
            const testData: FormData = {
                name: "テスト太郎",
                age: 25,
                email: "test@example.com",
            };

            const { result } = renderHook(() => useFormSubmit<FormData>());

            await act(async () => {
                await result.current.handleSubmit(mockSubmitFn, testData);
            });

            expect(mockSubmitFn).toHaveBeenCalledWith(testData);
        });
    });

    describe("複数回の送信", () => {
        it("連続して送信を実行できる", async () => {
            const mockSubmitFn = jest.fn().mockResolvedValue(undefined);
            const testData1 = { name: "テスト1" };
            const testData2 = { name: "テスト2" };

            const { result } = renderHook(() => useFormSubmit());

            // 1回目の送信
            await act(async () => {
                await result.current.handleSubmit(mockSubmitFn, testData1);
            });

            expect(mockSubmitFn).toHaveBeenCalledTimes(1);
            expect(mockSubmitFn).toHaveBeenCalledWith(testData1);

            // 2回目の送信
            await act(async () => {
                await result.current.handleSubmit(mockSubmitFn, testData2);
            });

            expect(mockSubmitFn).toHaveBeenCalledTimes(2);
            expect(mockSubmitFn).toHaveBeenLastCalledWith(testData2);
        });

        it("エラー後に再送信できる", async () => {
            const testData = { name: "再送信テスト" };

            const { result } = renderHook(() => useFormSubmit());

            // 1回目はエラー
            const errorSubmitFn = jest.fn().mockRejectedValue(new Error("送信失敗"));
            await act(async () => {
                await result.current.handleSubmit(errorSubmitFn, testData);
            });

            expect(result.current.error).toBe("送信失敗");

            // 2回目は成功
            const successSubmitFn = jest.fn().mockResolvedValue(undefined);
            await act(async () => {
                await result.current.handleSubmit(successSubmitFn, testData);
            });

            expect(result.current.error).toBeNull();
            expect(result.current.isLoading).toBe(false);
        });
    });

    describe("オプションの組み合わせ", () => {
        it("全てのオプションを組み合わせて使用できる", async () => {
            const errorMessage = "全オプションテストエラー";
            const mockSubmitFn = jest.fn().mockRejectedValue(new Error(errorMessage));
            const mockOnError = jest.fn();
            const testData = { name: "全オプションテスト" };

            const { result } = renderHook(() => useFormSubmit());

            await act(async () => {
                await result.current.handleSubmit(mockSubmitFn, testData, {
                    onSuccess: jest.fn(), // 呼ばれない
                    onError: mockOnError,
                    showErrorAlert: true,
                });
            });

            expect(result.current.error).toBe(errorMessage);
            expect(mockOnError).toHaveBeenCalledWith(expect.any(Error));
            expect(mockAlert).toHaveBeenCalledWith(errorMessage);
        });

        it("成功時にonErrorは呼ばれない", async () => {
            const mockSubmitFn = jest.fn().mockResolvedValue(undefined);
            const mockOnSuccess = jest.fn();
            const mockOnError = jest.fn();
            const testData = { name: "成功テスト" };

            const { result } = renderHook(() => useFormSubmit());

            await act(async () => {
                await result.current.handleSubmit(mockSubmitFn, testData, {
                    onSuccess: mockOnSuccess,
                    onError: mockOnError,
                    showErrorAlert: true,
                });
            });

            expect(mockOnSuccess).toHaveBeenCalled();
            expect(mockOnError).not.toHaveBeenCalled();
            expect(mockAlert).not.toHaveBeenCalled();
            expect(result.current.error).toBeNull();
        });
    });
});