"use client";

import { useEffect, useRef } from "react";
import { useMonitorStore } from "@/store/use-monitor-store";
import type { MonitorState } from "@/store/use-monitor-store";
import { STORAGE_KEYS } from "@/lib/constants";
import { useMonitorSync } from "@/hooks/useMonitorSync";

type PersistedState = Pick<
    MonitorState,
    | "playerA"
    | "playerB"
    | "timeRemaining"
    | "timerMode"
    | "isPublic"
>;

/**
 * 手動モニター操作画面の状態管理フック
 * 
 * @description
 * 以下の機能を提供します：
 * 1. 初回マウント時のデータ初期化
 * 2. LocalStorageからの状態復元（永続化データの読み込み）
 * 3. 状態変更時の自動同期（Presentation API / BroadcastChannel）
 * 4. 状態変更時のLocalStorageへの自動保存
 * 
 * @param onInitialize 初期化処理を実行するコールバック関数
 */
export function useManualMonitorState(onInitialize: () => void) {
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

    // 1. & 2. 初期化と復元
    useEffect(() => {
        if (isInitialized.current) return;

        // まずデフォルトの初期化を実行
        onInitialize();

        try {
            const savedData = localStorage.getItem(STORAGE_KEYS.MANUAL_MONITOR_STATE);
            if (savedData) {
                const parsed: PersistedState = JSON.parse(savedData);

                // 保存されたデータがあれば上書き
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
        onInitialize,
        setPlayerName,
        setTeamName,
        setPlayerScore,
        setPlayerHansoku,
        setTimeRemaining,
        setTimerMode,
        setPublic,
    ]);

    // 3. & 4. 同期と保存
    // useManualMonitorState の内部で呼び出すことで、初期化・復元後のデータを保存対象とする
    useMonitorSync({ persistKey: STORAGE_KEYS.MANUAL_MONITOR_STATE });
}
