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

            // ダブルタップ判定
            if (now - lastTap < DOUBLE_TAP_INTERVAL_MS) {
                // ダブルタップ時のアクション（timer / incScore / incFoul）
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
                // シングルタップ時のアクション（toggleA / toggleB）
                switch (action) {
                    case "toggleA":
                        toggleSelectedPlayer("playerA");
                        break;
                    case "toggleB":
                        toggleSelectedPlayer("playerB");
                        break;
                    default:
                        break;
                }
                // 今回のタップ時間を記録
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
