"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { ScoreboardOperator } from "@/components/organisms/scoreboard-operator";
import { useMonitorStore } from "@/store/use-monitor-store";
import { useMatch } from "@/queries/use-matches";
import { useTournament } from "@/queries/use-tournaments";
import { useAuthContext } from "@/hooks/useAuthContext";

export default function MonitorControlPage() {
  const params = useParams();
  const matchId = params.matchId as string;
  const { initializeMatch } = useMonitorStore();
  // ストアに保存されているデータ（遷移元で initializeMatch が呼ばれた場合）
  const storeMatchId = useMonitorStore((s) => s.matchId);
  const storeTournamentName = useMonitorStore((s) => s.tournamentName);

  const { orgId, activeTournamentId, isLoading: authLoading } = useAuthContext();

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
          <div className="mb-6">
            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                試合一覧に戻る
              </Button>
            </Link>
          </div>
          <div className="flex justify-center items-center py-16">
            <div className="text-gray-600">試合データを読み込み中...</div>
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
          <div className="mb-6">
            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                試合一覧に戻る
              </Button>
            </Link>
          </div>
          <div className="flex justify-center items-center py-16">
            <div className="text-red-600">
              エラーが発生しました: {hasError instanceof Error ? hasError.message : "データの取得に失敗しました"}
            </div>
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
          <div className="mb-6">
            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                試合一覧に戻る
              </Button>
            </Link>
          </div>
          <div className="flex justify-center items-center py-16">
            <div className="text-amber-600">
              指定された試合が見つかりません。
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              試合一覧に戻る
            </Button>
          </Link>
        </div>

        <ScoreboardOperator />
      </div>
    </div>
  );
}
