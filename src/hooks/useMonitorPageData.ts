import { useMatchDataWithPriority } from "./useMatchDataWithPriority";
import { useTeamMatches } from "@/queries/use-team-matches";
import { useTeams } from "@/queries/use-teams";
import { useTournament } from "@/queries/use-tournaments";
import { useMonitorStore, type ViewMode } from "@/store/use-monitor-store";

interface UseMonitorPageDataProps {
    matchId: string;
    orgId: string | null;
    activeTournamentId: string | null;
    initialViewMode?: ViewMode;
}

/**
 * MonitorControlPage用のデータフェッチロジックをまとめたフック
 * TanStack Queryを使用した各種データ取得を集約
 */
export function useMonitorPageData({ matchId, orgId, activeTournamentId, initialViewMode }: UseMonitorPageDataProps) {
    // マッチデータ取得（ストア優先）
    const { isLoading, hasError, matchFound } = useMatchDataWithPriority(matchId, initialViewMode);

    // 団体戦用データ
    const matchGroupId = useMonitorStore((s) => s.matchGroupId);
    const { data: teamMatches } = useTeamMatches(matchGroupId || null);
    const { data: teams } = useTeams();
    const { data: tournament } = useTournament(orgId, activeTournamentId);

    return {
        // ローディング・エラー状態
        isLoading,
        hasError,
        matchFound,
        // データ
        matchGroupId,
        teamMatches,
        teams,
        tournament,
    };
}
