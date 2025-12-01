import { useState, useCallback, useMemo, useEffect } from "react";
import { useMonitorStore } from "@/store/use-monitor-store";
import { createPlayerDirectory } from "@/lib/utils/player-directory";
import { createMonitorGroupMatches } from "@/lib/utils/team-match-utils";
import type { Team } from "@/types/team.schema";
import type { TeamMatch } from "@/types/team-match.schema";

interface UseMonitorPageUiProps {
    handleMonitorAction: () => void;
    isPresentationConnected: boolean;
    teamMatches: TeamMatch[] | undefined;
    teams: Team[] | undefined;
}

/**
 * MonitorControlPage用のUI状態ロジックをまとめたフック
 * モニター接続ダイアログ、チーム順序計算などを管理
 */
export function useMonitorPageUi({
    handleMonitorAction,
    isPresentationConnected,
    teamMatches,
    teams,
}: UseMonitorPageUiProps) {
    // モニター切断確認ダイアログ
    const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

    const handleMonitorClick = useCallback(() => {
        if (isPresentationConnected) {
            setShowDisconnectConfirm(true);
        } else {
            handleMonitorAction();
        }
    }, [isPresentationConnected, handleMonitorAction]);

    const handleDisconnectConfirm = useCallback(() => {
        setShowDisconnectConfirm(false);
        handleMonitorAction();
    }, [handleMonitorAction]);

    // 団体戦の場合、グループ試合データをストアに設定
    useEffect(() => {
        if (teamMatches && teamMatches.length > 0 && teams && teams.length > 0) {
            const playerDirectory = createPlayerDirectory(teams);
            const matchGroupId = teamMatches[0].matchGroupId;
            const groupMatches = createMonitorGroupMatches(teamMatches, matchGroupId, playerDirectory);
            useMonitorStore.getState().setGroupMatches(groupMatches);
        }
    }, [teamMatches, teams]);

    // teamMatchesから正しいチーム順序を取得
    const orderedTeams = useMemo(() => {
        if (!teamMatches || teamMatches.length === 0 || !teams) return null;

        const firstMatch = teamMatches[0];
        const teamAId = firstMatch.players.playerA.teamId;
        const teamBId = firstMatch.players.playerB.teamId;

        const teamA = teams.find(t => t.teamId === teamAId);
        const teamB = teams.find(t => t.teamId === teamBId);

        if (!teamA || !teamB) return null;

        return { teamA, teamB };
    }, [teamMatches, teams]);

    // モニター状態
    const presentationConnected = useMonitorStore((s) => s.presentationConnected);
    const fallbackOpen = useMonitorStore((s) => s.fallbackOpen);
    const monitorStatusMode: "presentation" | "fallback" | "disconnected" = presentationConnected
        ? "presentation"
        : fallbackOpen
            ? "fallback"
            : "disconnected";
    const isPublic = useMonitorStore((s) => s.isPublic);
    const togglePublic = useMonitorStore((s) => s.togglePublic);
    const viewMode = useMonitorStore((s) => s.viewMode);

    return {
        // ダイアログ状態
        showDisconnectConfirm,
        setShowDisconnectConfirm,
        handleMonitorClick,
        handleDisconnectConfirm,
        // チームデータ
        orderedTeams,
        // モニター状態
        monitorStatusMode,
        isPublic,
        togglePublic,
        viewMode,
    };
}
