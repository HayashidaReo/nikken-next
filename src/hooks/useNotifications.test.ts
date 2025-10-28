/**
 * @jest-environment jsdom
 */

import { renderHook, act } from "@testing-library/react";
import { useNotifications } from "./useNotifications";

// タイマーのモック
jest.useFakeTimers();

describe("useNotifications", () => {
    afterEach(() => {
        jest.clearAllTimers();
    });

    describe("基本機能", () => {
        it("初期状態は空の配列", () => {
            const { result } = renderHook(() => useNotifications());

            expect(result.current.notifications).toEqual([]);
        });

        it("通知を追加できる", () => {
            const { result } = renderHook(() => useNotifications());

            act(() => {
                result.current.addNotification({
                    type: "success",
                    message: "テストメッセージ"
                });
            });

            expect(result.current.notifications).toHaveLength(1);
            expect(result.current.notifications[0]).toMatchObject({
                type: "success",
                message: "テストメッセージ",
                id: expect.any(String)
            });
        });

        it("複数の通知を追加できる", () => {
            const { result } = renderHook(() => useNotifications());

            act(() => {
                result.current.addNotification({ type: "success", message: "成功" });
                result.current.addNotification({ type: "error", message: "エラー" });
            });

            expect(result.current.notifications).toHaveLength(2);
            expect(result.current.notifications[0].message).toBe("成功");
            expect(result.current.notifications[1].message).toBe("エラー");
        });

        it("通知を削除できる", () => {
            const { result } = renderHook(() => useNotifications());

            let notificationId: string;

            act(() => {
                notificationId = result.current.addNotification({
                    type: "info",
                    message: "削除テスト"
                });
            });

            expect(result.current.notifications).toHaveLength(1);

            act(() => {
                result.current.removeNotification(notificationId);
            });

            expect(result.current.notifications).toHaveLength(0);
        });

        it("全ての通知をクリアできる", () => {
            const { result } = renderHook(() => useNotifications());

            act(() => {
                result.current.addNotification({ type: "success", message: "通知1" });
                result.current.addNotification({ type: "error", message: "通知2" });
                result.current.addNotification({ type: "warning", message: "通知3" });
            });

            expect(result.current.notifications).toHaveLength(3);

            act(() => {
                result.current.clearAll();
            });

            expect(result.current.notifications).toHaveLength(0);
        });
    });

    describe("自動削除機能", () => {
        it("デフォルト5秒後に自動削除される", () => {
            const { result } = renderHook(() => useNotifications());

            act(() => {
                result.current.addNotification({
                    type: "info",
                    message: "自動削除テスト"
                });
            });

            expect(result.current.notifications).toHaveLength(1);

            // 5秒後
            act(() => {
                jest.advanceTimersByTime(5000);
            });

            expect(result.current.notifications).toHaveLength(0);
        });

        it("カスタム時間で自動削除される", () => {
            const { result } = renderHook(() => useNotifications());

            act(() => {
                result.current.addNotification({
                    type: "warning",
                    message: "カスタム削除テスト",
                    duration: 3000
                });
            });

            expect(result.current.notifications).toHaveLength(1);

            // 3秒後
            act(() => {
                jest.advanceTimersByTime(3000);
            });

            expect(result.current.notifications).toHaveLength(0);
        });

        it("duration: 0で自動削除されない", () => {
            const { result } = renderHook(() => useNotifications());

            act(() => {
                result.current.addNotification({
                    type: "error",
                    message: "手動削除専用",
                    duration: 0
                });
            });

            expect(result.current.notifications).toHaveLength(1);

            // 10秒後でも削除されない
            act(() => {
                jest.advanceTimersByTime(10000);
            });

            expect(result.current.notifications).toHaveLength(1);
        });
    });

    describe("便利メソッド", () => {
        it("showSuccess で成功通知を追加", () => {
            const { result } = renderHook(() => useNotifications());

            act(() => {
                result.current.showSuccess("成功しました");
            });

            expect(result.current.notifications[0]).toMatchObject({
                type: "success",
                message: "成功しました"
            });
        });

        it("showError でエラー通知を追加", () => {
            const { result } = renderHook(() => useNotifications());

            act(() => {
                result.current.showError("エラーが発生しました");
            });

            expect(result.current.notifications[0]).toMatchObject({
                type: "error",
                message: "エラーが発生しました"
            });
        });

        it("showWarning で警告通知を追加", () => {
            const { result } = renderHook(() => useNotifications());

            act(() => {
                result.current.showWarning("注意してください");
            });

            expect(result.current.notifications[0]).toMatchObject({
                type: "warning",
                message: "注意してください"
            });
        });

        it("showInfo で情報通知を追加", () => {
            const { result } = renderHook(() => useNotifications());

            act(() => {
                result.current.showInfo("お知らせです");
            });

            expect(result.current.notifications[0]).toMatchObject({
                type: "info",
                message: "お知らせです"
            });
        });
    });

    describe("エラーハンドリング", () => {
        let consoleSpy: jest.SpyInstance;

        beforeEach(() => {
            consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        });

        afterEach(() => {
            consoleSpy.mockRestore();
        });

        it("Errorオブジェクトのメッセージを使用", () => {
            const { result } = renderHook(() => useNotifications());
            const testError = new Error("テストエラーメッセージ");

            act(() => {
                result.current.handleError(testError);
            });

            expect(result.current.notifications[0]).toMatchObject({
                type: "error",
                message: "テストエラーメッセージ"
            });

            expect(consoleSpy).toHaveBeenCalledWith("エラー", testError);
        });

        it("文字列エラーを汎用メッセージに変換", () => {
            const { result } = renderHook(() => useNotifications());

            act(() => {
                result.current.handleError("文字列エラー");
            });

            expect(result.current.notifications[0]).toMatchObject({
                type: "error",
                message: "予期しないエラーが発生しました"
            });
        });

        it("コンテキスト付きエラーメッセージ", () => {
            const { result } = renderHook(() => useNotifications());
            const testError = new Error("接続失敗");

            act(() => {
                result.current.handleError(testError, "データ取得");
            });

            expect(result.current.notifications[0]).toMatchObject({
                type: "error",
                message: "データ取得: 接続失敗"
            });

            expect(consoleSpy).toHaveBeenCalledWith("データ取得", testError);
        });

        it("null/undefined エラーを適切に処理", () => {
            const { result } = renderHook(() => useNotifications());

            act(() => {
                result.current.handleError(null);
            });

            expect(result.current.notifications[0]).toMatchObject({
                type: "error",
                message: "予期しないエラーが発生しました"
            });
        });
    });

    describe("通知ID生成", () => {
        it("ユニークなIDが生成される", () => {
            const { result } = renderHook(() => useNotifications());

            let id1: string;
            let id2: string;

            act(() => {
                id1 = result.current.addNotification({ type: "info", message: "テスト1" });
                id2 = result.current.addNotification({ type: "info", message: "テスト2" });
            });

            expect(id1!).not.toBe(id2!);
            expect(typeof id1!).toBe("string");
            expect(typeof id2!).toBe("string");
            expect(id1!).toMatch(/^notification-\d+-/);
            expect(id2!).toMatch(/^notification-\d+-/);
        });
    });

    describe("複雑なシナリオ", () => {
        it("複数通知の混在と部分削除", () => {
            const { result } = renderHook(() => useNotifications());

            let id1: string;
            let id2: string;
            let id3: string;

            act(() => {
                id1 = result.current.addNotification({
                    type: "success",
                    message: "通知1",
                    duration: 0
                });
                id2 = result.current.addNotification({
                    type: "error",
                    message: "通知2",
                    duration: 2000
                });
                id3 = result.current.addNotification({
                    type: "warning",
                    message: "通知3",
                    duration: 0
                });
            });

            expect(result.current.notifications).toHaveLength(3);

            // id2のみ自動削除
            act(() => {
                jest.advanceTimersByTime(2000);
            });

            expect(result.current.notifications).toHaveLength(2);
            expect(result.current.notifications.some(n => n.id === id1!)).toBe(true);
            expect(result.current.notifications.some(n => n.id === id2!)).toBe(false);
            expect(result.current.notifications.some(n => n.id === id3!)).toBe(true);

            // id1を手動削除
            act(() => {
                result.current.removeNotification(id1!);
            });

            expect(result.current.notifications).toHaveLength(1);
            expect(result.current.notifications[0].id).toBe(id3!);
        });
    });
});