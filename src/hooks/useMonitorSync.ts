import { useEffect } from "react";
import { useMonitorStore } from "@/store/use-monitor-store";
import { useMonitorSender } from "@/hooks/useMonitorSender";

export function useMonitorSync() {
    const { sendMessage } = useMonitorSender();

    const matchId = useMonitorStore((s) => s.matchId);
    const tournamentName = useMonitorStore((s) => s.tournamentName);
    const courtName = useMonitorStore((s) => s.courtName);
    const roundName = useMonitorStore((s) => s.roundName);
    const playerA = useMonitorStore((s) => s.playerA);
    const playerB = useMonitorStore((s) => s.playerB);
    const timeRemaining = useMonitorStore((s) => s.timeRemaining);
    const isTimerRunning = useMonitorStore((s) => s.isTimerRunning);
    const timerMode = useMonitorStore((s) => s.timerMode);
    const isPublic = useMonitorStore((s) => s.isPublic);
    const viewMode = useMonitorStore((s) => s.viewMode);
    const matchResult = useMonitorStore((s) => s.matchResult);
    const teamMatchResults = useMonitorStore((s) => s.teamMatchResults);

    useEffect(() => {
        // データを送信
        const monitorData = useMonitorStore.getState().getMonitorSnapshot();
        sendMessage("data", monitorData);
    }, [
        matchId,
        tournamentName,
        courtName,
        roundName,
        playerA,
        playerB,
        timeRemaining,
        isTimerRunning,
        timerMode,
        isPublic,
        viewMode,
        matchResult,
        teamMatchResults,
        sendMessage,
    ]);
}
