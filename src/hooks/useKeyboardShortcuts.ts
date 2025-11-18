import { useEffect, useRef } from "react";
import { useMonitorStore } from "@/store/use-monitor-store";
import { DOUBLE_TAP_INTERVAL_MS, KEY_MAP } from "@/lib/constants/keyboard";

export const useKeyboardShortcuts = () => {
    const {
        toggleTimer,
        toggleSelectedPlayer,
        incrementScoreForSelectedPlayer,
        incrementFoulForSelectedPlayer,
    } = useMonitorStore();

    const lastTapTimeRef = useRef<Record<string, number>>({});

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

            // ダブルタップ判定（timer / incScore / incFoul）
            if (now - lastTap < DOUBLE_TAP_INTERVAL_MS) {
                switch (action) {
                    case "toggleTimer":
                        event.preventDefault();
                        toggleTimer();
                        break;
                    case "incScore":
                        incrementScoreForSelectedPlayer();
                        break;
                    case "incFoul":
                        incrementFoulForSelectedPlayer();
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
    ]);
};
