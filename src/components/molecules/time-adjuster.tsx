"use client";

import * as React from "react";
import {
    splitSecondsToMinutesAndSeconds,
    combineMinutesAndSecondsToSeconds,
} from "@/lib/utils/time-utils";
import { useLongPress } from "@/hooks/useLongPress";

interface TimeAdjusterProps {
    /** 現在の時間（秒数） */
    value: number;
    /** 時間が変更された時のコールバック */
    onChange: (seconds: number) => void;
    /** 調整を無効にするかどうか */
    disabled?: boolean;
    /** 最大分数（デフォルト: 99） */
    maxMinutes?: number;
    /** 最大秒数（デフォルト: 59） */
    maxSeconds?: number;
    /** 表示サイズ */
    size?: "sm" | "md" | "lg";
    /** カスタムクラス名 */
    className?: string;
    /** 長押し開始遅延時間（ms、デフォルト: 500） */
    longPressDelay?: number;
    /** 長押し実行間隔（ms、デフォルト: 100） */
    longPressInterval?: number;
}

type TimeAdjustType =
    | "minutes-up"
    | "minutes-down"
    | "seconds-up"
    | "seconds-down";

/**
 * 時間調整コンポーネント
 * 分と秒を上下ボタンで調整できる共通UI
 */
export function TimeAdjuster({
    value,
    onChange,
    disabled = false,
    maxMinutes = 99,
    maxSeconds = 59,
    size = "md",
    className = "",
    longPressDelay = 500,
    longPressInterval = 100,
}: TimeAdjusterProps) {

    // サイズに応じたスタイルクラス
    const sizeClasses = {
        sm: {
            time: "text-xl",
            button: "text-xs",
            spacing: "space-x-1",
            height: "h-8",
        },
        md: {
            time: "text-3xl",
            button: "text-xs",
            spacing: "space-x-2",
            height: "h-12",
        },
        lg: {
            time: "text-4xl",
            button: "text-sm",
            spacing: "space-x-2",
            height: "h-16",
        },
    };

    const styles = sizeClasses[size];

    // 最新の値を参照するためのref
    const latestValueRef = React.useRef(value);
    React.useEffect(() => {
        latestValueRef.current = value;
    }, [value]);

    const adjustTime = React.useCallback(
        (type: TimeAdjustType) => {
            if (disabled) return;

            const { minutes, seconds } = splitSecondsToMinutesAndSeconds(latestValueRef.current);

            let newMinutes = minutes;
            let newSeconds = seconds;

            switch (type) {
                case "minutes-up":
                    newMinutes = Math.min(minutes + 1, maxMinutes);
                    break;
                case "minutes-down":
                    newMinutes = Math.max(minutes - 1, 0);
                    break;
                case "seconds-up":
                    // 59秒を超えたら0にループ
                    newSeconds = seconds >= maxSeconds ? 0 : seconds + 1;
                    break;
                case "seconds-down":
                    // 0秒未満になったら59にループ
                    newSeconds = seconds <= 0 ? maxSeconds : seconds - 1;
                    break;
            }

            const newTotalSeconds = combineMinutesAndSecondsToSeconds(
                newMinutes,
                newSeconds
            );

            onChange(newTotalSeconds);
        },
        [onChange, disabled, maxMinutes, maxSeconds] // value を依存配列から除去
    );

    // 各ボタンの長押しハンドラー（atomic思想に基づく分離）
    const minutesUpPress = useLongPress(
        () => adjustTime("minutes-up"),
        { delay: longPressDelay, interval: longPressInterval, disabled }
    );

    const minutesDownPress = useLongPress(
        () => adjustTime("minutes-down"),
        { delay: longPressDelay, interval: longPressInterval, disabled }
    );

    const secondsUpPress = useLongPress(
        () => adjustTime("seconds-up"),
        { delay: longPressDelay, interval: longPressInterval, disabled }
    );

    const secondsDownPress = useLongPress(
        () => adjustTime("seconds-down"),
        { delay: longPressDelay, interval: longPressInterval, disabled }
    );

    const { minutes, seconds } = splitSecondsToMinutesAndSeconds(value);

    return (
        <div className={`flex items-center justify-center ${styles.height} ${className}`}>
            <div className={`font-mono font-bold flex items-center justify-center ${styles.time} ${styles.spacing}`}>
                {/* 分の表示と調整 */}
                <div className="flex items-center">
                    <span className="min-w-[3ch] text-center">
                        {minutes.toString().padStart(2, "0")}
                    </span>
                    {!disabled && (
                        <div className="flex flex-col ml-1">
                            <button
                                className={`${styles.button} text-gray-500 hover:text-gray-700 disabled:text-gray-300 leading-none select-none transition-colors`}
                                {...minutesUpPress}
                                disabled={disabled}
                                type="button"
                            >
                                ▲
                            </button>
                            <button
                                className={`${styles.button} text-gray-500 hover:text-gray-700 disabled:text-gray-300 leading-none select-none transition-colors`}
                                {...minutesDownPress}
                                disabled={disabled}
                                type="button"
                            >
                                ▼
                            </button>
                        </div>
                    )}
                </div>

                <span className="text-gray-400">:</span>

                {/* 秒の表示と調整 */}
                <div className="flex items-center">
                    <span className="min-w-[3ch] text-center">
                        {seconds.toString().padStart(2, "0")}
                    </span>
                    {!disabled && (
                        <div className="flex flex-col ml-1">
                            <button
                                className={`${styles.button} text-gray-500 hover:text-gray-700 disabled:text-gray-300 leading-none select-none transition-colors`}
                                {...secondsUpPress}
                                disabled={disabled}
                                type="button"
                            >
                                ▲
                            </button>
                            <button
                                className={`${styles.button} text-gray-500 hover:text-gray-700 disabled:text-gray-300 leading-none select-none transition-colors`}
                                {...secondsDownPress}
                                disabled={disabled}
                                type="button"
                            >
                                ▼
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}