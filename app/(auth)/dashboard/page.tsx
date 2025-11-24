"use client";

import { MainLayout } from "@/components/templates/main-layout";
import { LoadingIndicator } from "@/components/molecules/loading-indicator";
import { InfoDisplay } from "@/components/molecules/info-display";
import { Button } from "@/components/atoms/button";
import { DownloadCloud, UploadCloud, Trash2 } from "lucide-react";
import { DashboardContent } from "@/components/templates/dashboard-content";
import { useDashboard } from "@/hooks/useDashboard";

export default function DashboardPage() {
  const {
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
    courts,
    handleDownload,
    handleUpload,
    handleClearLocal,
    handleBack,
  } = useDashboard();

  return (
    <MainLayout activeTab="matches">
      <div className="space-y-6">
        {/* データ取得ボタン */}
        {!needsTournamentSelection && orgId && activeTournamentId && (
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={isDownloading || isUploading || isClearing}
            >
              <DownloadCloud className="w-4 h-4 mr-2" />
              {isDownloading ? "取得中..." : "データ取得"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleUpload}
              disabled={isUploading || isDownloading || isClearing}
            >
              <UploadCloud className="w-4 h-4 mr-2" />
              {isUploading ? "送信中..." : "Firestoreへ送信"}
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearLocal}
              disabled={isClearing || isDownloading || isUploading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isClearing ? "削除中..." : "ローカルデータ削除"}
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
        {!needsTournamentSelection && !isLoading && !hasError && !tournament && (
          <InfoDisplay
            variant="warning"
            title="大会情報が見つかりません"
            message="大会情報が見つかりません。管理者に問い合わせるか、大会を作成してください。"
          />
        )}

        {/* 正常時の表示 */}
        {!needsTournamentSelection && !isLoading && !hasError && tournament && (
          <DashboardContent
            tournamentType={tournament.tournamentType}
            matchGroupId={matchGroupId}
            matches={matches}
            matchGroups={matchGroups}
            teamMatches={teamMatches}
            teams={teams}
            tournamentName={tournament.tournamentName}
            courts={courts}
            onBack={handleBack}
          />
        )}
      </div>
    </MainLayout>
  );
}
