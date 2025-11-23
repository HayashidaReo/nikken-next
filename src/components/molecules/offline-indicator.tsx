"use client";

import { useOnlineStatus } from "@/hooks/use-online-status";
import { WifiOff } from "lucide-react";

export function OfflineIndicator() {
    const isOnline = useOnlineStatus();

    if (isOnline) {
        return null;
    }

    return (
        <div className="fixed top-4 left-4 z-50 flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-2xl transform-gpu will-change-transform transition-transform">
            <WifiOff className="h-4 w-4" />
            <span>オフライン</span>
        </div>
    );
}
