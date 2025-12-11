"use client";

import { useEffect, useState } from "react";
import { MONITOR_CONSTANTS } from "@/lib/constants";
import { cn } from "@/lib/utils/utils";

interface MonitorScaleLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
}

export function MonitorScaleLayout({
    children,
    className,
    ...props
}: MonitorScaleLayoutProps) {
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const handleResize = () => {
            const BASE_WIDTH = MONITOR_CONSTANTS.BASE_WIDTH;
            const BASE_HEIGHT = MONITOR_CONSTANTS.BASE_HEIGHT;

            const scaleX = window.innerWidth / BASE_WIDTH;
            const scaleY = window.innerHeight / BASE_HEIGHT;

            // 画面に収まるように小さい方の倍率を採用（contain）
            setScale(Math.min(scaleX, scaleY));
        };

        // 初期化とイベントリスナー設定
        handleResize();
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div
            className={cn(
                "w-screen h-screen bg-black text-white relative overflow-hidden flex items-center justify-center",
                className
            )}
            {...props}
        >
            <div
                style={{
                    width: MONITOR_CONSTANTS.BASE_WIDTH,
                    height: MONITOR_CONSTANTS.BASE_HEIGHT,
                    transform: `scale(${scale})`,
                    transformOrigin: "center",
                }}
                className="bg-black flex-shrink-0 flex items-center justify-center"
            >
                {children}
            </div>
        </div>
    );
}
