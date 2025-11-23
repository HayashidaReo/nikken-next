"use client";

import { useMemo } from "react";
import { MainLayout } from "@/components/templates/main-layout";
import { MatchListTableMemo } from "@/components/organisms/match-list-table";
import { useMatches } from "@/queries/use-matches";
import { useTournament } from "@/queries/use-tournaments";
import { useAuthContext } from "@/hooks/useAuthContext";
import { LoadingIndicator } from "@/components/molecules/loading-indicator";
import { InfoDisplay } from "@/components/molecules/info-display";
import { Button } from "@/components/atoms/button";
import { DownloadCloud } from "lucide-react";
import { syncService } from "@/services/sync-service";
import { useState } from "react";
import { useToast } from "@/components/providers/notification-provider";

export default function DashboardPage() {
  const { needsTournamentSelection, activeTournamentId, orgId, isLoading: authLoading } = useAuthContext();
  const { showSuccess, showError } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  // ローカルDBからデータを取得（useLiveQueryを使用）
  const { data: matches = [], isLoading: matchesLoading, error: matchesError } = useMatches();
  const { data: tournament, isLoading: tournamentLoading, error: tournamentError } = useTournament(orgId, activeTournamentId);

  // matches リストをメモ化して不要な再レンダリングを防止
  const memoizedMatches = useMemo(() => matches, [matches]);

  // tournament データをメモ化
  const memoizedTournament = useMemo(() => tournament, [tournament]);
  const memoizedCourts = useMemo(() => tournament?.courts ?? [], [tournament?.courts]);

  const isLoading = authLoading || matchesLoading || tournamentLoading;
  const hasError = matchesError || tournamentError;

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

  return (
    <MainLayout activeTab="matches">
      <div className="space-y-6">
        {/* データ取得ボタン */}
        {!needsTournamentSelection && orgId && activeTournamentId && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              <DownloadCloud className="w-4 h-4 mr-2" />
              {isDownloading ? "取得中..." : "データ取得"}
            </Button>
          </div>
        )}

        {/* 大会が選択されていない場合 */}
        {needsTournamentSelection && (
          <InfoDisplay
            variant="warning"
            title="大会が選択されていません"
            message="ヘッダーの大会ドロップダウンから操作したい大会を選択してください。"
          />
        )}

        {/* ローディング状態 */}
        {!needsTournamentSelection && isLoading && (
          <LoadingIndicator message="試合データを読み込み中..." size="lg" />
        )}

        {/* エラー状態 */}
        {!needsTournamentSelection && !isLoading && hasError && (
          <InfoDisplay
            variant="destructive"
            title="データの取得に失敗しました"
            message={hasError instanceof Error ? hasError.message : "データの取得に失敗しました"}
          />
        )}

        {/* 大会情報が取得できない場合 */}
        {!needsTournamentSelection && !isLoading && !hasError && !memoizedTournament && (
          <InfoDisplay
            variant="warning"
            title="大会情報が見つかりません"
            message="大会情報が見つかりません。管理者に問い合わせるか、大会を作成してください。"
          />
        )}

        {/* 正常時の表示 */}
        {!needsTournamentSelection && !isLoading && !hasError && memoizedTournament && (
          <MatchListTableMemo
            matches={memoizedMatches}
            tournamentName={memoizedTournament.tournamentName}
            courts={memoizedCourts}
          />
        )}
      </div>
    </MainLayout>
  );
}
