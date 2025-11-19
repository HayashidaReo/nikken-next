"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ConnectionStatus } from "@/components/organisms/connection-status";
import { useMonitorStore } from "@/store/use-monitor-store";
import { ArrowLeft, Monitor, Unplug, Save } from "lucide-react";
import { Button } from "@/components/atoms/button";
import SwitchLabel from "@/components/molecules/switch-label";
import { ScoreboardOperator } from "@/components/organisms/scoreboard-operator";
import { useToast } from "@/components/providers/notification-provider";
import { useAuthContext } from "@/hooks/useAuthContext";
import { LoadingIndicator } from "@/components/molecules/loading-indicator";
import { InfoDisplay } from "@/components/molecules/info-display";
import { FallbackMonitorDialog } from "@/components/molecules";
import { useMatchDataWithPriority } from "@/hooks/useMatchDataWithPriority";
import { useMonitorController } from "@/hooks/useMonitorController";

export default function MonitorControlPage() {
  const params = useParams();
  const matchId = params.matchId as string;
  const { saveMatchResult, isSaving } = useMonitorStore();

  const presentationConnected = useMonitorStore((s) => s.presentationConnected);
  const fallbackOpen = useMonitorStore((s) => s.fallbackOpen);
  const monitorStatusMode = presentationConnected ? "presentation" : fallbackOpen ? "fallback" : "disconnected";
  const isPublic = useMonitorStore((s) => s.isPublic);
  const togglePublic = useMonitorStore((s) => s.togglePublic);

  const { orgId, activeTournamentId } = useAuthContext();
  const { showSuccess, showError } = useToast();

  // データ取得ロジック（ストア優先）
  const { isLoading, hasError, matchFound } = useMatchDataWithPriority(matchId);

  // モニター制御ロジック
  const {
    isPresentationConnected,
    handleMonitorAction,
    showFallbackDialog,
    handleFallbackConfirm,
    handleFallbackCancel,
  } = useMonitorController({
    matchId,
    orgId: orgId || "",
    tournamentId: activeTournamentId || "",
  });

  const handleSave = async () => {
    try {
      await saveMatchResult(orgId || "", activeTournamentId || "");
      showSuccess("試合結果を保存しました");
    } catch (err) {
      console.error(err);
      showError("試合結果の保存に失敗しました");
    }
  };

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
                <ConnectionStatus mode={monitorStatusMode} error={null} />
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
                <ConnectionStatus mode={monitorStatusMode} error={null} />
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

  // 試合が見つからない場合
  if (!matchFound) {
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
                <ConnectionStatus mode={monitorStatusMode} error={null} />
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
              <ConnectionStatus mode={monitorStatusMode} error={null} />
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
              <Button onClick={handleMonitorAction} variant={isPresentationConnected ? "destructive" : "outline"}>
                {isPresentationConnected ? (
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
