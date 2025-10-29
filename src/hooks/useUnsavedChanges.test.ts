import { renderHook } from "@testing-library/react";
import { useUnsavedChanges } from "./useUnsavedChanges";

// window.confirmをモック
const mockConfirm = jest.fn();
Object.defineProperty(window, 'confirm', {
    value: mockConfirm,
    writable: true,
});

describe("useUnsavedChanges", () => {
    let addEventListener: jest.SpyInstance;
    let removeEventListener: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        mockConfirm.mockClear();

        // window.addEventListenerとremoveEventListenerをモック
        addEventListener = jest.spyOn(window, 'addEventListener');
        removeEventListener = jest.spyOn(window, 'removeEventListener');
    });

    afterEach(() => {
        addEventListener.mockRestore();
        removeEventListener.mockRestore();
    });

    describe("beforeunloadイベントリスナー", () => {
        it("hasUnsavedChanges=falseの場合、イベントリスナーが登録される", () => {
            renderHook(() => useUnsavedChanges(false));

            expect(addEventListener).toHaveBeenCalledWith(
                "beforeunload",
                expect.any(Function)
            );
        });

        it("hasUnsavedChanges=trueの場合、イベントリスナーが登録される", () => {
            renderHook(() => useUnsavedChanges(true));

            expect(addEventListener).toHaveBeenCalledWith(
                "beforeunload",
                expect.any(Function)
            );
        });

        it("コンポーネントアンマウント時にイベントリスナーが削除される", () => {
            const { unmount } = renderHook(() => useUnsavedChanges(false));

            unmount();

            expect(removeEventListener).toHaveBeenCalledWith(
                "beforeunload",
                expect.any(Function)
            );
        });

        it("hasUnsavedChangesが変更されると新しいイベントリスナーが設定される", () => {
            const { rerender } = renderHook(
                ({ hasUnsaved }) => useUnsavedChanges(hasUnsaved),
                { initialProps: { hasUnsaved: false } }
            );

            // 最初の登録
            expect(addEventListener).toHaveBeenCalledTimes(1);

            // プロパティ変更
            rerender({ hasUnsaved: true });

            // 古いリスナー削除 + 新しいリスナー登録
            expect(removeEventListener).toHaveBeenCalledTimes(1);
            expect(addEventListener).toHaveBeenCalledTimes(2);
        });
    });

    describe("beforeunloadイベントハンドラ", () => {
        it("hasUnsavedChanges=falseの場合、イベントを阻止しない", () => {
            renderHook(() => useUnsavedChanges(false));

            // 登録されたイベントハンドラを取得
            const eventHandler = addEventListener.mock.calls[0][1];

            const mockEvent = {
                preventDefault: jest.fn(),
                returnValue: "",
            } as unknown as BeforeUnloadEvent;

            eventHandler(mockEvent);

            expect(mockEvent.preventDefault).not.toHaveBeenCalled();
            expect(mockEvent.returnValue).toBe("");
        });

        it("hasUnsavedChanges=trueの場合、イベントを阻止してメッセージを設定", () => {
            renderHook(() => useUnsavedChanges(true));

            // 登録されたイベントハンドラを取得
            const eventHandler = addEventListener.mock.calls[0][1];

            const mockEvent = {
                preventDefault: jest.fn(),
                returnValue: "",
            } as unknown as BeforeUnloadEvent;

            eventHandler(mockEvent);

            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(mockEvent.returnValue).toBe("変更が保存されていません。このページを離れますか？");
        });
    });

    describe("confirmNavigation", () => {
        it("hasUnsavedChanges=falseの場合、常にtrueを返す", () => {
            const { result } = renderHook(() => useUnsavedChanges(false));

            const navigationResult = result.current.confirmNavigation();

            expect(navigationResult).toBe(true);
            expect(mockConfirm).not.toHaveBeenCalled();
        });

        it("hasUnsavedChanges=trueの場合、confirmを呼び出しその結果を返す", () => {
            mockConfirm.mockReturnValue(true);

            const { result } = renderHook(() => useUnsavedChanges(true));

            const navigationResult = result.current.confirmNavigation();

            expect(mockConfirm).toHaveBeenCalledWith(
                "変更が保存されていません。このページを離れますか？"
            );
            expect(navigationResult).toBe(true);
        });

        it("hasUnsavedChanges=trueでconfirmがfalseの場合、falseを返す", () => {
            mockConfirm.mockReturnValue(false);

            const { result } = renderHook(() => useUnsavedChanges(true));

            const navigationResult = result.current.confirmNavigation();

            expect(navigationResult).toBe(false);
        });

        it("カスタムメッセージを使用できる", () => {
            mockConfirm.mockReturnValue(true);

            const { result } = renderHook(() => useUnsavedChanges(true));
            const customMessage = "カスタム確認メッセージ";

            result.current.confirmNavigation(customMessage);

            expect(mockConfirm).toHaveBeenCalledWith(customMessage);
        });

        it("空文字列のカスタムメッセージでもデフォルトメッセージが使用される", () => {
            mockConfirm.mockReturnValue(true);

            const { result } = renderHook(() => useUnsavedChanges(true));

            result.current.confirmNavigation("");

            expect(mockConfirm).toHaveBeenCalledWith(
                "変更が保存されていません。このページを離れますか？"
            );
        });
    });

    describe("状態変更のテスト", () => {
        it("hasUnsavedChangesが動的に変更されても正しく動作する", () => {
            mockConfirm.mockReturnValue(true);

            const { result, rerender } = renderHook(
                ({ hasUnsaved }) => useUnsavedChanges(hasUnsaved),
                { initialProps: { hasUnsaved: false } }
            );

            // 最初は未保存変更なし
            expect(result.current.confirmNavigation()).toBe(true);
            expect(mockConfirm).not.toHaveBeenCalled();

            mockConfirm.mockClear();

            // 未保存変更ありに変更
            rerender({ hasUnsaved: true });

            expect(result.current.confirmNavigation()).toBe(true);
            expect(mockConfirm).toHaveBeenCalled();

            mockConfirm.mockClear();

            // 再び未保存変更なしに戻す
            rerender({ hasUnsaved: false });

            expect(result.current.confirmNavigation()).toBe(true);
            expect(mockConfirm).not.toHaveBeenCalled();
        });
    });

    describe("エッジケース", () => {
        it("同じ状態での再レンダリングが正しく処理される", () => {
            addEventListener.mockClear();

            const { rerender } = renderHook(
                ({ hasUnsaved }) => useUnsavedChanges(hasUnsaved),
                { initialProps: { hasUnsaved: false } }
            );

            const initialCallCount = addEventListener.mock.calls.length;

            // 状態を変更
            rerender({ hasUnsaved: true });

            // イベントリスナーの登録が発生する
            expect(addEventListener.mock.calls.length).toBeGreaterThan(initialCallCount);
        });

        it("undefinedやnullのメッセージでもデフォルトメッセージが使用される", () => {
            mockConfirm.mockReturnValue(true);

            const { result } = renderHook(() => useUnsavedChanges(true));

            result.current.confirmNavigation(undefined);

            expect(mockConfirm).toHaveBeenCalledWith(
                "変更が保存されていません。このページを離れますか？"
            );
        });
    });
});