"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ConnectionStatus } from "@/components/organisms/connection-status";
import { useMonitorStore } from "@/store/use-monitor-store";
import { ArrowLeft, Monitor, Unplug, Save } from "lucide-react";
import { Button } from "@/components/atoms/button";
import SwitchLabel from "@/components/molecules/switch-label";
import { ScoreboardOperator } from "@/components/organisms/scoreboard-operator";
import { usePresentation } from "@/hooks/usePresentation";
import { useToast } from "@/components/providers/notification-provider";
import { useMatch } from "@/queries/use-matches";
import { useTournament } from "@/queries/use-tournaments";
import { useAuthContext } from "@/hooks/useAuthContext";
import { LoadingIndicator } from "@/components/molecules/loading-indicator";
import { InfoDisplay } from "@/components/molecules/info-display";
import { FallbackMonitorDialog } from "@/components/molecules";
import { useState } from "react";

export default function MonitorControlPage() {
  const params = useParams();
  const matchId = params.matchId as string;
  const { initializeMatch, saveMatchResult, isSaving } = useMonitorStore();
  // ストアに保存されているデータ（遷移元で initializeMatch が呼ばれた場合）
  const storeMatchId = useMonitorStore((s) => s.matchId);
  const storeTournamentName = useMonitorStore((s) => s.tournamentName);
  const presentationConnected = useMonitorStore((s) => s.presentationConnected);
  const isPublic = useMonitorStore((s) => s.isPublic);
  const togglePublic = useMonitorStore((s) => s.togglePublic);

  const { orgId, activeTournamentId, isLoading: authLoading } = useAuthContext();

  const { showSuccess, showError, showInfo } = useToast();
  const {
    isSupported: isPresentationSupported,
    isAvailable: isPresentationAvailable,
    isConnected: isPresentationConnected,
    stopPresentation,
    startPresentation,
  } = usePresentation(`${window.location.origin}/monitor-display`);

  const handleMonitorAction = async () => {
    try {
      if (isPresentationConnected) {
        await stopPresentation();
        showInfo("プレゼンテーション接続を停止しました");
        return;
      }

      // First, get a presentation token
      const tokenResponse = await fetch("/api/presentation-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId,
          orgId: orgId || "",
          tournamentId: activeTournamentId || "",
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error("Failed to obtain presentation token");
      }

      const { token } = await tokenResponse.json();
      const monitorUrl = `${window.location.origin}/monitor-display?pt=${encodeURIComponent(token)}`;

      if (isPresentationSupported && isPresentationAvailable && startPresentation) {
        try {
          // registerGlobal=true でストアに接続を保存する
          await startPresentation(monitorUrl, true);
          showSuccess("モニター表示を開始しました");
          return;
        } catch (err) {
          console.warn("Presentation API start failed via hook, falling back to window.open:", err);
          // fall through to fallback dialog
        }
      }

      // Presentation API が利用できないか start に失敗した場合はフォールバックダイアログを表示
      setShowFallbackDialog(true);
    } catch (err) {
      console.error(err);
      showError("モニター表示の開始に失敗しました。もう一度お試しください。");
    }
  };

  const [showFallbackDialog, setShowFallbackDialog] = useState(false);

  const handleFallbackConfirm = () => {
    setShowFallbackDialog(false);
    // We need to request the token again before opening; call same token endpoint
    (async () => {
      try {
        const tokenResponse = await fetch("/api/presentation-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ matchId, orgId: orgId || "", tournamentId: activeTournamentId || "" }),
        });
        if (!tokenResponse.ok) {
          throw new Error("Failed to obtain presentation token");
        }
        const { token } = await tokenResponse.json();
        const url = `${window.location.origin}/monitor-display?pt=${encodeURIComponent(token)}`;
        window.open(url, "_blank", "width=1920,height=1080");
        showInfo("新しいタブでモニター表示を開始しました。データは自動的に同期されます。");
      } catch (e) {
        console.error(e);
        showError("モニター表示の開始に失敗しました。もう一度お試しください。");
      }
    })();
  };

  const handleFallbackCancel = () => {
    setShowFallbackDialog(false);
  };

  const handleSave = async () => {
    try {
      await saveMatchResult(orgId || "", activeTournamentId || "");
      showSuccess("試合結果を保存しました");
    } catch (err) {
      console.error(err);
      showError("試合結果の保存に失敗しました");
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

          <div className="flex items-center gap-4">
            <SwitchLabel
              id="public-toggle-header"
              checked={isPublic}
              onChange={(v) => {
                if (v !== isPublic) togglePublic();
              }}
              onLabel={"公開中"}
              offLabel={"非公開"}
              className="flex items-center gap-3"
            />

            <div className="flex items-center gap-3">
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

              <Button onClick={handleSave} size="sm" disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "保存中..." : "保存"}
              </Button>
            </div>
          </div>
        </div>

        <ScoreboardOperator
          organizationId={orgId || ""}
          tournamentId={activeTournamentId || ""}
        />
        <FallbackMonitorDialog
          isOpen={showFallbackDialog}
          onConfirm={handleFallbackConfirm}
          onCancel={handleFallbackCancel}
        />
      </div>
    </div>
  );
}
