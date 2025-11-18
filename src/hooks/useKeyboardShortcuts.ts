import { useEffect, useRef } from "react";
import { useMonitorStore } from "@/store/use-monitor-store";

const DOUBLE_TAP_INTERVAL = 300; // 300ms以内をダブルタップと判定

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
            const now = Date.now();
            const lastTap = lastTapTimeRef.current[key] || 0;

            // ダブルタップ判定
            if (now - lastTap < DOUBLE_TAP_INTERVAL) {
                // ダブルタップ時のアクション
                switch (key) {
                    case " ":
                        event.preventDefault();
                        toggleTimer();
                        break;
                    case "s":
                        incrementScoreForSelectedPlayer();
                        break;
                    case "z":
                        incrementFoulForSelectedPlayer();
                        break;
                    default:
                        break;
                }
                // アクション実行後はタップ時間をリセット
                lastTapTimeRef.current[key] = 0;
            } else {
                // シングルタップ時のアクション
                switch (key) {
                    case "a":
                        toggleSelectedPlayer("playerA");
                        break;
                    case "b":
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
