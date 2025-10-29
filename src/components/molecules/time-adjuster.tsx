"use client";

import * as React from "react";
import {
  splitSecondsToMinutesAndSeconds,
  combineMinutesAndSecondsToSeconds,
} from "@/lib/utils/time-utils";

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
}: TimeAdjusterProps) {
  const pressTimer = React.useRef<NodeJS.Timeout | null>(null);
  const pressInterval = React.useRef<NodeJS.Timeout | null>(null);

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

  const adjustTime = React.useCallback(
    (type: TimeAdjustType) => {
      if (disabled) return;

      const { minutes, seconds } = splitSecondsToMinutesAndSeconds(value);

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
          newSeconds = Math.min(seconds + 1, maxSeconds);
          break;
        case "seconds-down":
          newSeconds = Math.max(seconds - 1, 0);
          break;
      }

      const newTotalSeconds = combineMinutesAndSecondsToSeconds(
        newMinutes,
        newSeconds
      );
      onChange(newTotalSeconds);
    },
    [value, onChange, disabled, maxMinutes, maxSeconds]
  );

  const handleMouseDown = React.useCallback(
    (type: TimeAdjustType) => {
      if (disabled) return;

      adjustTime(type);

      // 長押し処理
      pressTimer.current = setTimeout(() => {
        pressInterval.current = setInterval(() => {
          adjustTime(type);
        }, 100);
      }, 500);
    },
    [adjustTime, disabled]
  );

  const handleMouseUp = React.useCallback(() => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    if (pressInterval.current) clearInterval(pressInterval.current);
  }, []);

  // クリーンアップ
  React.useEffect(() => {
    return () => {
      if (pressTimer.current) clearTimeout(pressTimer.current);
      if (pressInterval.current) clearInterval(pressInterval.current);
    };
  }, []);

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
                onMouseDown={() => handleMouseDown("minutes-up")}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={() => handleMouseDown("minutes-up")}
                onTouchEnd={handleMouseUp}
                disabled={disabled}
                type="button"
              >
                ▲
              </button>
              <button
                className={`${styles.button} text-gray-500 hover:text-gray-700 disabled:text-gray-300 leading-none select-none transition-colors`}
                onMouseDown={() => handleMouseDown("minutes-down")}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={() => handleMouseDown("minutes-down")}
                onTouchEnd={handleMouseUp}
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
                onMouseDown={() => handleMouseDown("seconds-up")}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={() => handleMouseDown("seconds-up")}
                onTouchEnd={handleMouseUp}
                disabled={disabled}
                type="button"
              >
                ▲
              </button>
              <button
                className={`${styles.button} text-gray-500 hover:text-gray-700 disabled:text-gray-300 leading-none select-none transition-colors`}
                onMouseDown={() => handleMouseDown("seconds-down")}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={() => handleMouseDown("seconds-down")}
                onTouchEnd={handleMouseUp}
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