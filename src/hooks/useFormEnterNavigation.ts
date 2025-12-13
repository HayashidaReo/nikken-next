import { useCallback } from "react";

/**
 * フォーム内でのEnterキーナビゲーションを提供するフック
 */
export function useFormEnterNavigation() {
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLFormElement>) => {
        if (e.key !== "Enter") return;

        // IME変換中は無視
        if (e.nativeEvent.isComposing) return;

        // テキストエリアは改行を許可するため無視
        if (e.target instanceof HTMLTextAreaElement) return;

        // ボタンの場合はクリック動作を妨げないようにするが、
        // 送信ボタン以外でのEnterは次のフォーカス移動とするか、デフォルトの挙動（クリック）とするか。
        // 通常、フォーム内の入力フィールドでのEnterはSubmitになるが、それを防いで次のフィールドへ移動させる要件。
        // ボタン上のEnterはクリックとして扱いたい。
        if (e.target instanceof HTMLButtonElement) return;

        // Shift+Enterなどの修飾キーがある場合は無視
        if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;

        e.preventDefault();

        const form = e.currentTarget;
        // フォーカス可能な要素を取得（可視状態のもののみ）
        const focusableElements = Array.from(
            form.querySelectorAll<HTMLElement>(
                'input:not([type="hidden"]), select, textarea, button'
            )
        ).filter((el) => {
            // tabIndex="-1" は除外 (アイコンボタンなど)
            if (el.getAttribute("tabindex") === "-1") return false;

            // ボタンの場合、type="button" (クリアボタン等) は除外して、Submitボタンへスキップする
            if (el instanceof HTMLButtonElement && el.type === "button") return false;

            return (
                !el.hasAttribute("disabled") &&
                !el.getAttribute("aria-hidden") &&
                el.offsetParent !== null // 非表示要素を除外
            );
        });

        const currentElement = e.target as HTMLElement;
        const currentIndex = focusableElements.indexOf(currentElement);

        if (currentIndex > -1 && currentIndex < focusableElements.length - 1) {
            focusableElements[currentIndex + 1].focus();
        }
    }, []);

    return { handleKeyDown };
}
