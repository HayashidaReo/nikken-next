"use client";

import * as React from "react";
import { Label } from "@/components/atoms/label";
import {
  Card,
  CardContent,
} from "@/components/atoms/card";
import { TimeAdjuster } from "./time-adjuster";interface TimePickerProps {
    value: number; // 秒数
    onChange: (seconds: number) => void;
    label?: string;
    className?: string;
}

type TimeAdjustType =
    | "minutes-up"
    | "minutes-down"
    | "seconds-up"
    | "seconds-down";

export function TimePicker({ value, onChange, label, className }: TimePickerProps) {
    const pressTimer = React.useRef<NodeJS.Timeout | null>(null);
    const pressInterval = React.useRef<NodeJS.Timeout | null>(null);

    const adjustTime = React.useCallback((type: TimeAdjustType) => {
        const { minutes, seconds } = splitSecondsToMinutesAndSeconds(value);

        let newMinutes = minutes;
        let newSeconds = seconds;

        switch (type) {
            case "minutes-up":
                newMinutes = Math.min(minutes + 1, 99);
                break;
            case "minutes-down":
                newMinutes = Math.max(minutes - 1, 0);
                break;
            case "seconds-up":
                newSeconds = Math.min(seconds + 1, 59);
                break;
            case "seconds-down":
                newSeconds = Math.max(seconds - 1, 0);
                break;
        }

        const newTotalSeconds = combineMinutesAndSecondsToSeconds(newMinutes, newSeconds);
        onChange(newTotalSeconds);
    }, [value, onChange]);

    const handleMouseDown = React.useCallback((type: TimeAdjustType) => {
        adjustTime(type);

        // 長押し処理
        pressTimer.current = setTimeout(() => {
            pressInterval.current = setInterval(() => {
                adjustTime(type);
            }, 100);
        }, 500);
    }, [adjustTime]);

    const handleMouseUp = React.useCallback(() => {
        if (pressTimer.current) clearTimeout(pressTimer.current);
        if (pressInterval.current) clearInterval(pressInterval.current);
    }, []);

    React.useEffect(() => {
        return () => {
            if (pressTimer.current) clearTimeout(pressTimer.current);
            if (pressInterval.current) clearInterval(pressInterval.current);
        };
    }, [pressTimer, pressInterval]);

    const { minutes, seconds } = splitSecondsToMinutesAndSeconds(value);

    return (
        <div className={className}>
            {label && <Label className="mb-2 block">{label}</Label>}
            <Card>
                <CardContent className="pt-4">
                    <div className="flex items-center justify-center">
                        <div className="text-center">
                            {/* 固定高さタイマー表示 */}
                            <div className="mb-4 h-12 flex items-center justify-center">
                                <div className="text-3xl font-mono font-bold flex items-center justify-center space-x-2">
                                    {/* 分の表示と調整 */}
                                    <div className="flex items-center">
                                        <span className="min-w-[3ch] text-center">
                                            {minutes.toString().padStart(2, "0")}
                                        </span>
                                        <div className="flex flex-col ml-1">
                                            <button
                                                className="text-xs text-gray-500 hover:text-gray-700 leading-none select-none"
                                                onMouseDown={() => handleMouseDown("minutes-up")}
                                                onMouseUp={handleMouseUp}
                                                onMouseLeave={handleMouseUp}
                                                onTouchStart={() => handleMouseDown("minutes-up")}
                                                onTouchEnd={handleMouseUp}
                                            >
                                                ▲
                                            </button>
                                            <button
                                                className="text-xs text-gray-500 hover:text-gray-700 leading-none select-none"
                                                onMouseDown={() => handleMouseDown("minutes-down")}
                                                onMouseUp={handleMouseUp}
                                                onMouseLeave={handleMouseUp}
                                                onTouchStart={() => handleMouseDown("minutes-down")}
                                                onTouchEnd={handleMouseUp}
                                            >
                                                ▼
                                            </button>
                                        </div>
                                    </div>

                                    <span className="text-gray-400">:</span>

                                    {/* 秒の表示と調整 */}
                                    <div className="flex items-center">
                                        <span className="min-w-[3ch] text-center">
                                            {seconds.toString().padStart(2, "0")}
                                        </span>
                                        <div className="flex flex-col ml-1">
                                            <button
                                                className="text-xs text-gray-500 hover:text-gray-700 leading-none select-none"
                                                onMouseDown={() => handleMouseDown("seconds-up")}
                                                onMouseUp={handleMouseUp}
                                                onMouseLeave={handleMouseUp}
                                                onTouchStart={() => handleMouseDown("seconds-up")}
                                                onTouchEnd={handleMouseUp}
                                            >
                                                ▲
                                            </button>
                                            <button
                                                className="text-xs text-gray-500 hover:text-gray-700 leading-none select-none"
                                                onMouseDown={() => handleMouseDown("seconds-down")}
                                                onMouseUp={handleMouseUp}
                                                onMouseLeave={handleMouseUp}
                                                onTouchStart={() => handleMouseDown("seconds-down")}
                                                onTouchEnd={handleMouseUp}
                                            >
                                                ▼
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-gray-500">
                                ▲▼ ボタンで時間を調整
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}