import * as React from "react";

interface UseLongPressOptions {
    /** 長押し開始までの遅延時間（ms） */
    delay?: number;
    /** 長押し中の実行間隔（ms） */
    interval?: number;
    /** 無効状態 */
    disabled?: boolean;
}

/**
 * 長押し機能を提供するカスタムフック
 * atomic思想に基づき、長押しロジックを分離
 */
export function useLongPress(
    callback: () => void,
    options: UseLongPressOptions = {}
) {
    const { delay = 500, interval = 100, disabled = false } = options;

    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

    const clear = React.useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const start = React.useCallback(() => {
        if (disabled) return;

        // 初回実行
        callback();

        // 長押し処理を開始
        timeoutRef.current = setTimeout(() => {
            intervalRef.current = setInterval(callback, interval);
        }, delay);
    }, [callback, delay, interval, disabled]);

    const stop = React.useCallback(() => {
        clear();
    }, [clear]);

    // クリーンアップ
    React.useEffect(() => {
        return clear;
    }, [clear]);

    return {
        onMouseDown: start,
        onMouseUp: stop,
        onMouseLeave: stop,
        onTouchStart: start,
        onTouchEnd: stop,
    };
}