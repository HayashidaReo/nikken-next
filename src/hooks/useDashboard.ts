import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMatches } from "@/queries/use-matches";
import { useMatchGroups } from "@/queries/use-match-groups";
import { useTeamMatches } from "@/queries/use-team-matches";
import { useTeams } from "@/queries/use-teams";
import { useTournament } from "@/queries/use-tournaments";
import { useAuthStore } from "@/store/use-auth-store";
import { useActiveTournament } from "@/store/use-active-tournament-store";
import { syncService } from "@/services/sync-service";
import { useToast } from "@/components/providers/notification-provider";

export function useDashboard() {
    const { user } = useAuthStore();
    const { activeTournamentId, activeTournamentType } = useActiveTournament();
    const { showSuccess, showError } = useToast();
    const [isDownloading, setIsDownloading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const matchGroupId = searchParams.get("matchGroupId");

    const orgId = user?.uid ?? null;
    const needsTournamentSelection = !activeTournamentId;

    // 大会種別に応じてフックを条件付きで呼び出す
    // ローカルDBからデータを取得（useLiveQueryを使用）
    const { data: matches = [], isLoading: matchesLoading, error: matchesError } = useMatches(activeTournamentType === 'individual');
    const { data: tournament, isLoading: tournamentLoading, error: tournamentError } = useTournament(orgId, activeTournamentId);
    const { data: teams = [] } = useTeams();
    const { data: matchGroups = [] } = useMatchGroups();
    const { data: teamMatches = [] } = useTeamMatches(matchGroupId);

    // 大会種別に応じたローディング・エラー状態の判定
    // AuthLayoutで認証チェック済みのため、authLoadingは考慮不要
    const isLoading = tournamentLoading || (activeTournamentType === 'individual' ? matchesLoading : false);
    const hasError = tournamentError || (activeTournamentType === 'individual' ? matchesError : null);

    const handleDownload = async () => {
        if (!orgId || !activeTournamentId) return;

        if (!confirm("データを再取得しますか？\nローカルの未送信データは上書きされる可能性があります。")) return;

        setIsDownloading(true);
        try {
            await syncService.downloadTournamentData(orgId, activeTournamentId);
            showSuccess("データの取得が完了しました");
        } catch {
            showError("データの取得に失敗しました");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleUpload = async () => {
        if (!orgId || !activeTournamentId) return;

        if (!confirm("ローカルの結果をクラウドに送信しますか？")) return;

        setIsUploading(true);
        try {
            const uploadedCount = await syncService.uploadResults(orgId, activeTournamentId);
            if (uploadedCount > 0) {
                showSuccess(`${uploadedCount}件のデータをクラウドに送信しました`);
            } else {
                showSuccess("送信するデータはありませんでした");
            }
        } catch (error) {
            showError(error instanceof Error ? error.message : "データ送信に失敗しました");
        } finally {
            setIsUploading(false);
        }
    };

    const handleClearLocal = async () => {
        if (!confirm("ローカルDBの matches / matchGroups / teams / teamMatches をすべて削除します。よろしいですか？")) return;

        setIsClearing(true);
        try {
            await syncService.clearLocalData();
            showSuccess("ローカルDBを削除しました");
        } catch (error) {
            showError(error instanceof Error ? error.message : "ローカルDBの削除に失敗しました");
        } finally {
            setIsClearing(false);
        }
    };

    const handleBack = () => router.push("/dashboard");

    return {
        needsTournamentSelection,
        orgId,
        activeTournamentId,
        isDownloading,
        isUploading,
        isClearing,
        isLoading,
        hasError,
        matchGroupId,
        tournament,
        matches,
        matchGroups,
        teamMatches,
        teams,
        courts: tournament?.courts ?? [],
        handleDownload,
        handleUpload,
        handleClearLocal,
        handleBack,
    };
}
