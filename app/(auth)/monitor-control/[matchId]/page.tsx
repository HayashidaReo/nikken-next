"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ConnectionStatus } from "@/components/organisms/connection-status";
import { useMonitorStore } from "@/store/use-monitor-store";
import { ArrowLeft, Monitor, Unplug } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { ScoreboardOperator } from "@/components/organisms/scoreboard-operator";
import { usePresentation } from "@/hooks/usePresentation";
import { useToast } from "@/components/providers/notification-provider";
import { useMatch } from "@/queries/use-matches";
import { useTournament } from "@/queries/use-tournaments";
import { useAuthContext } from "@/hooks/useAuthContext";
import { LoadingIndicator } from "@/components/molecules/loading-indicator";
import { InfoDisplay } from "@/components/molecules/info-display";

export default function MonitorControlPage() {
  const params = useParams();
  const matchId = params.matchId as string;
  const { initializeMatch } = useMonitorStore();
  // ストアに保存されているデータ（遷移元で initializeMatch が呼ばれた場合）
  const storeMatchId = useMonitorStore((s) => s.matchId);
  const storeTournamentName = useMonitorStore((s) => s.tournamentName);
  const presentationConnected = useMonitorStore((s) => s.presentationConnected);

  const { orgId, activeTournamentId, isLoading: authLoading } = useAuthContext();

  const { showSuccess, showError, showInfo } = useToast();
  const {
    isSupported: isPresentationSupported,
    isAvailable: isPresentationAvailable,
    isConnected: isPresentationConnected,
    startPresentation,
    stopPresentation,
  } = usePresentation(`${window.location.origin}/monitor-display`);

  const handleMonitorAction = async () => {
    try {
      if (isPresentationConnected) {
        await stopPresentation();
        showInfo("プレゼンテーション接続を停止しました");
        return;
      }

      if (isPresentationSupported && isPresentationAvailable) {
        await startPresentation();
        showSuccess("モニター表示を開始しました");
        return;
      }

      // フォールバック: 新しいタブで開く
      const monitorUrl = `${window.location.origin}/monitor-display`;
      window.open(monitorUrl, "_blank", "width=1920,height=1080");
      showInfo("新しいタブでモニター表示を開始しました。データは自動的に同期されます。");
    } catch (err) {
      console.error(err);
      showError("モニター表示の開始に失敗しました。もう一度お試しください。");
    }
  };

  // ストア優先: ストアに現在の matchId のデータがあれば Firebase クエリは無効化する
  const hasStoreData = Boolean(storeMatchId && storeMatchId === matchId && storeTournamentName);

  // Firebase からデータを取得（ただしストアにあればクエリは無効化）
  const { data: match, isLoading: matchLoading, error: matchError } = useMatch(hasStoreData ? null : matchId);
  const { data: tournament, isLoading: tournamentLoading, error: tournamentError } = useTournament(
    hasStoreData ? null : orgId,
    hasStoreData ? null : activeTournamentId
  );

  // ストア優先のため、ストアデータがある場合は fetch 側の loading/error を無視する
  const isLoading = authLoading || (!hasStoreData && (matchLoading || tournamentLoading));
  const hasError = !hasStoreData && (matchError || tournamentError);

  useEffect(() => {
    // ストアに既にデータがある場合は初期化不要
    if (hasStoreData) return;

    // Firebase から取得したデータで初期化（フォールバック）
    if (match && tournament) {
      const court = tournament.courts.find(
        (c: { courtId: string; courtName: string }) => c.courtId === match.courtId
      );
      const courtName = court ? court.courtName : match.courtId;

      initializeMatch(match, tournament.tournamentName, courtName);
    }
  }, [hasStoreData, match, tournament, initializeMatch]);

  // ローディング状態
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  試合一覧に戻る
                </Button>
              </Link>

              <div className="ml-2">
                <ConnectionStatus isConnected={presentationConnected} error={null} />
              </div>
            </div>

            <div>
              <Button onClick={handleMonitorAction} variant={presentationConnected ? "destructive" : "outline"}>
                {presentationConnected ? (
                  <>
                    <Unplug className="w-4 h-4 mr-2" />
                    接続を解除
                  </>
                ) : (
                  <>
                    <Monitor className="w-4 h-4 mr-2" />
                    表示用モニターを開く
                  </>
                )}
              </Button>
            </div>
          </div>
          <div className="flex justify-center items-center py-16">
            <div className="w-full">
              <LoadingIndicator message="試合データを読み込み中..." size="lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // エラー状態
  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  試合一覧に戻る
                </Button>
              </Link>

              <div className="ml-2">
                <ConnectionStatus isConnected={presentationConnected} error={null} />
              </div>
            </div>

            <div>
              <Button onClick={handleMonitorAction} variant={presentationConnected ? "destructive" : "outline"}>
                {presentationConnected ? (
                  <>
                    <Unplug className="w-4 h-4 mr-2" />
                    接続を解除
                  </>
                ) : (
                  <>
                    <Monitor className="w-4 h-4 mr-2" />
                    表示用モニターを開く
                  </>
                )}
              </Button>
            </div>
          </div>
          <div className="flex justify-center items-center py-16 w-full">
            <InfoDisplay
              variant="destructive"
              title="データの取得に失敗しました"
              message={hasError instanceof Error ? hasError.message : "データの取得に失敗しました"}
            />
          </div>
        </div>
      </div>
    );
  }

  // 試合が見つからない場合（ストアにもデータが無い場合のみ表示）
  if (!hasStoreData && !match) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  試合一覧に戻る
                </Button>
              </Link>

              <div className="ml-2">
                <ConnectionStatus isConnected={presentationConnected} error={null} />
              </div>
            </div>

            <div>
              <Button onClick={handleMonitorAction} variant={presentationConnected ? "destructive" : "outline"}>
                {presentationConnected ? (
                  <>
                    <Unplug className="w-4 h-4 mr-2" />
                    接続を解除
                  </>
                ) : (
                  <>
                    <Monitor className="w-4 h-4 mr-2" />
                    表示用モニターを開く
                  </>
                )}
              </Button>
            </div>
          </div>
          <div className="flex justify-center items-center py-16 w-full">
            <InfoDisplay
              variant="warning"
              title="指定された試合が見つかりません"
              message="指定された試合が見つかりませんでした。URL を確認するか、一覧に戻ってください。"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                試合一覧に戻る
              </Button>
            </Link>

            <div className="ml-2">
              <ConnectionStatus isConnected={presentationConnected} error={null} />
            </div>
          </div>

          <div>
            <Button onClick={handleMonitorAction} variant={presentationConnected ? "destructive" : "outline"}>
              {presentationConnected ? (
                <>
                  <Unplug className="w-4 h-4 mr-2" />
                  接続を解除
                </>
              ) : (
                <>
                  <Monitor className="w-4 h-4 mr-2" />
                  表示用モニターを開く
                </>
              )}
            </Button>
          </div>
        </div>

        <ScoreboardOperator
          organizationId={orgId || ""}
          tournamentId={activeTournamentId || ""}
        />
      </div>
    </div>
  );
}
