"use client";

import { useEffect, useRef } from "react";
import { useMonitorStore } from "@/store/use-monitor-store";
import type { MonitorState } from "@/store/use-monitor-store";

import { STORAGE_KEYS } from "@/lib/constants";

type PersistedState = Pick<
    MonitorState,
    | "playerA"
    | "playerB"
    | "timeRemaining"
    | "timerMode"
    | "isPublic"
>;

/**
 * 手動モニター操作画面の状態をLocalStorageに永続化するフック
 * @param onInitialize 初期化処理を実行するコールバック関数
 */
export function useManualMonitorPersistence(onInitialize: () => void) {
    const {
        setPlayerScore,
        setPlayerHansoku,
        setPlayerName,
        setTeamName,
        setTimeRemaining,
        setTimerMode,
        setPublic,
    } = useMonitorStore();

    const isInitialized = useRef(false);

    // 初期化：LocalStorageからデータを読み込む
    useEffect(() => {
        if (isInitialized.current) return;

        // 1. まずデフォルトの初期化を実行
        onInitialize();

        try {
            const savedData = localStorage.getItem(STORAGE_KEYS.MANUAL_MONITOR_STATE);
            if (savedData) {
                const parsed: PersistedState = JSON.parse(savedData);

                // 2. 保存されたデータがあれば上書き

                // 選手情報
                setPlayerName("A", parsed.playerA.displayName);
                setTeamName("A", parsed.playerA.teamName);
                setPlayerScore("A", parsed.playerA.score);
                setPlayerHansoku("A", parsed.playerA.hansoku);

                setPlayerName("B", parsed.playerB.displayName);
                setTeamName("B", parsed.playerB.teamName);
                setPlayerScore("B", parsed.playerB.score);
                setPlayerHansoku("B", parsed.playerB.hansoku);

                // タイマー
                setTimeRemaining(parsed.timeRemaining);
                setTimerMode(parsed.timerMode);

                // 公開設定
                setPublic(parsed.isPublic);
            }
        } catch (err) {
            console.error("Failed to load manual monitor state:", err);
        } finally {
            isInitialized.current = true;
        }
    }, [
        onInitialize, // 依存配列に追加
        setPlayerName,
        setTeamName,
        setPlayerScore,
        setPlayerHansoku,
        setTimeRemaining,
        setTimerMode,
        setPublic,
    ]);
}
