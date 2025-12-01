import { useEffect, useRef, useCallback } from "react";
import { useMonitorStore } from "@/store/use-monitor-store";
import { DOUBLE_TAP_INTERVAL_MS, KEY_MAP } from "@/lib/constants/keyboard";

interface UseMonitorKeyboardShortcutsProps {
    onEnter?: () => void;
    specialWinConfirm?: { isOpen: boolean };
    handleSpecialWinExecute?: () => void;
    activeTournamentType?: string | null;
    showConfirmDialog?: boolean;
    handleConfirmMatchExecute?: () => void;
    viewMode?: string;
    handleConfirmMatchClick?: () => void;
    handleBackToDashboard?: () => void;
    teamMatchEnterHandler?: (
        showConfirmDialog: boolean,
        handleConfirmMatchClick: () => void,
        handleConfirmMatchExecute: () => void,
        handleNextMatchClick: () => void
    ) => void;
    handleNextMatchClick?: () => void;

}

export function useMonitorKeyboardShortcuts({
    onEnter,
    specialWinConfirm,
    handleSpecialWinExecute,
    activeTournamentType,
    showConfirmDialog,
    handleConfirmMatchExecute,
    viewMode,
    handleConfirmMatchClick,
    handleBackToDashboard,
    teamMatchEnterHandler,
    handleNextMatchClick,
}: UseMonitorKeyboardShortcutsProps = {}) {
    const {
        toggleTimer,
        toggleSelectedPlayer,
        incrementScoreForSelectedPlayer,
        incrementFoulForSelectedPlayer,
        togglePublic,
    } = useMonitorStore();

    const lastTapTimeRef = useRef<Record<string, number>>({});

    const handleEnterKey = useCallback(() => {
        // 1. Propsで渡されたonEnterがあればそれを優先（後方互換性のため）
        if (onEnter) {
            onEnter();
            return;
        }

        // 2. MonitorControlPage用のロジック
        // 必要なPropsが全て揃っている場合のみ実行
        if (
            specialWinConfirm &&
            handleSpecialWinExecute &&
            activeTournamentType !== undefined &&
            showConfirmDialog !== undefined &&
            handleConfirmMatchExecute &&
            viewMode &&
            handleConfirmMatchClick &&
            handleBackToDashboard &&
            teamMatchEnterHandler &&
            handleNextMatchClick
        ) {
            // 特別な決着（不戦勝・反則勝ち等）の確認ダイアログが開いている場合
            if (specialWinConfirm.isOpen) {
                handleSpecialWinExecute();
                return;
            }

            // 個人戦の場合のEnterキーハンドリング
            if (activeTournamentType === "individual") {
                // 試合終了確認ダイアログが開いている場合
                if (showConfirmDialog) {
                    handleConfirmMatchExecute();
                    return;
                }
                // スコアボード表示中 -> 試合終了確認へ
                if (viewMode === "scoreboard") {
                    handleConfirmMatchClick();
                    return;
                }
                // 試合結果表示中 -> 一覧へ戻る
                if (viewMode === "match_result") {
                    handleBackToDashboard();
                    return;
                }
                return;
            }

            // 団体戦の場合のEnterキーハンドリング（既存ロジック）
            teamMatchEnterHandler(
                showConfirmDialog,
                handleConfirmMatchClick,
                handleConfirmMatchExecute,
                handleNextMatchClick
            );
        }
    }, [
        onEnter,
        specialWinConfirm,
        handleSpecialWinExecute,
        activeTournamentType,
        showConfirmDialog,
        handleConfirmMatchExecute,
        viewMode,
        handleConfirmMatchClick,
        handleBackToDashboard,
        teamMatchEnterHandler,
        handleNextMatchClick,
    ]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement;
            if (
                target.isContentEditable ||
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.tagName === "SELECT"
            ) {
                return;
            }

            const key = event.key.toLowerCase();
            const action = KEY_MAP[key];
            if (!action) return;

            const now = Date.now();
            const lastTap = lastTapTimeRef.current[key] || 0;

            // Enterキーの処理（シングルタップ）
            if (action === "enter") {
                event.preventDefault();
                handleEnterKey();
                return;
            }

            // toggleA/toggleB は常にシングルタップで処理する（選択のトグルが即時に行われる）
            if (action === "toggleA") {
                toggleSelectedPlayer("playerA");
                lastTapTimeRef.current[key] = now;
                return;
            }
            if (action === "toggleB") {
                toggleSelectedPlayer("playerB");
                lastTapTimeRef.current[key] = now;
                return;
            }

            // ダブルタップ判定（timer / incScore / incFoul / togglePublic）
            if (now - lastTap < DOUBLE_TAP_INTERVAL_MS) {
                switch (action) {
                    case "toggleTimer": {
                        event.preventDefault();
                        const currentSelected = useMonitorStore.getState().selectedPlayer;
                        if (currentSelected) {
                            toggleSelectedPlayer("none");
                        }
                        toggleTimer();
                        break;
                    }
                    case "incScore":
                        incrementScoreForSelectedPlayer();
                        break;
                    case "incFoul":
                        incrementFoulForSelectedPlayer();
                        break;
                    case "togglePublic":
                        togglePublic();
                        break;
                    default:
                        break;
                }
                // アクション実行後はタップ時間をリセット
                lastTapTimeRef.current[key] = 0;
            } else {
                // まだシングルタップ（次が来るかもしれない）として記録
                // space (toggleTimer) の場合は1回目押下でもブラウザのデフォルト動作（スクロール）を抑制
                if (action === "toggleTimer") {
                    event.preventDefault();
                }
                lastTapTimeRef.current[key] = now;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [
        toggleTimer,
        toggleSelectedPlayer,
        incrementScoreForSelectedPlayer,
        incrementFoulForSelectedPlayer,
        togglePublic,
        handleEnterKey,
    ]);
}

