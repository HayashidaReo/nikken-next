import { useCallback } from "react";

interface UseTeamFormKeyboardProps {
    fieldsLength: number;
    addPlayer: () => void;
}

export function useTeamFormKeyboard({ fieldsLength, addPlayer }: UseTeamFormKeyboardProps) {
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLFormElement>) => {
        if (e.key !== "Enter") return;

        // IME変換中の場合は処理をスキップ（日本語入力など）
        if (e.nativeEvent.isComposing) return;

        // textareaの場合は処理をスキップ（複数行入力のため）
        if (e.target instanceof HTMLTextAreaElement) return;

        // フォーム送信（Ctrl+Enterなど）やボタンへのフォーカス時は除外
        if (e.ctrlKey || e.metaKey || e.target instanceof HTMLButtonElement) return;

        e.preventDefault();

        const target = e.target as HTMLElement;
        const form = e.currentTarget;
        const focusableElements = Array.from(
            form.querySelectorAll<HTMLElement>(
                'input:not([type="hidden"]), select, textarea, button:not([type="submit"]), div[role="combobox"]'
            )
        ).filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null); // 表示されている要素のみ

        const currentIndex = focusableElements.indexOf(target);

        // 通常のナビゲーション: 次の要素へフォーカス移動
        if (currentIndex > -1 && currentIndex < focusableElements.length - 1) {
            focusableElements[currentIndex + 1].focus();
        }
    }, [fieldsLength, addPlayer]);

    return { handleKeyDown };
}
