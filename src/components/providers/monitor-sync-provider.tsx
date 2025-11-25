"use client";

import { useMonitorSync } from "@/hooks/useMonitorSync";

export function MonitorSyncProvider({ children }: { children: React.ReactNode }) {
    useMonitorSync();
    return <>{children}</>;
}
