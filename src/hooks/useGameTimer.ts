import { useEffect, useRef } from "react";
import { useMonitorStore } from "@/store/use-monitor-store";

export function useGameTimer() {
    const isTimerRunning = useMonitorStore((state) => state.isTimerRunning);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isTimerRunning) {
            timerIntervalRef.current = setInterval(() => {
                const state = useMonitorStore.getState();
                const currentTime = state.timeRemaining;
                const mode = state.timerMode;

                if (mode === "countdown") {
                    // カウントダウンモード: 時間を減らす
                    if (currentTime > 0) {
                        state.setTimeRemaining(currentTime - 1);
                    } else {
                        state.stopTimer();
                    }
                } else {
                    // ストップウォッチモード: 時間を増やす
                    state.setTimeRemaining(currentTime + 1);
                }
            }, 1000);
        } else if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }

        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, [isTimerRunning]);
}
