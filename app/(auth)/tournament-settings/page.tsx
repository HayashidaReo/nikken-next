"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { TournamentSettingsForm } from "@/components/organisms/tournament-settings-form";
import { useToast } from "@/components/providers/notification-provider";
import { useTournament, useOrganizationId } from "@/hooks/useTournament";
import { AuthGuardWrapper } from "@/components/templates/auth-guard-wrapper";
import { AuthenticatedHeader } from "@/components/organisms/authenticated-header";

export default function TournamentSettingsPage() {
  const { showSuccess, showError } = useToast();
  const { orgId } = useOrganizationId();
  const {
    currentTournament,
    isLoading,
    error,
    fetchTournaments,
    updateTournament,
  } = useTournament();

  const [isNewTournament, setIsNewTournament] = React.useState(false);

  // 組織IDが設定されたら大会一覧を取得
  React.useEffect(() => {
    if (orgId) {
      fetchTournaments(orgId).catch((error) => {
        showError(error.message);
      });
    }
  }, [orgId, fetchTournaments, showError]);

  const handleSave = async (data: {
    tournamentName: string;
    tournamentDate: string;
    location: string;
    defaultMatchTime: number;
    courts: { courtId: string; courtName: string }[];
  }) => {
    if (!orgId) {
      showError("組織IDが設定されていません");
      return;
    }

    if (!currentTournament) {
      showError("大会が選択されていません");
      return;
    }

    try {
      await updateTournament(orgId, currentTournament.tournamentId, data);
      showSuccess("大会設定を更新しました");
      setIsNewTournament(false);
    } catch (error) {
      showError(error instanceof Error ? error.message : "大会の更新に失敗しました");
    }
  };

  // 組織IDが設定されていない場合の表示
  if (!orgId) {
    return (
      <AuthGuardWrapper>
        <div className="min-h-screen bg-gray-50 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <AuthenticatedHeader title="大会設定" />
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">
                大会を設定するには、まず組織を選択してください。
              </p>
              <Link href="/organization-management">
                <Button>組織管理に戻る</Button>
              </Link>
            </div>
          </div>
        </div>
      </AuthGuardWrapper>
    );
  }

  // ローディング表示
  if (isLoading) {
    return (
      <AuthGuardWrapper>
        <div className="min-h-screen bg-gray-50 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <AuthenticatedHeader title="大会設定" />
            <div className="mt-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">大会情報を読み込み中...</p>
            </div>
          </div>
        </div>
      </AuthGuardWrapper>
    );
  }

  // エラー表示
  if (error) {
    return (
      <AuthGuardWrapper>
        <div className="min-h-screen bg-gray-50 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <AuthenticatedHeader title="大会設定" />
            <div className="mt-8 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                再読み込み
              </Button>
            </div>
          </div>
        </div>
      </AuthGuardWrapper>
    );
  }

  return (
    <AuthGuardWrapper>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                ダッシュボードに戻る
              </Button>
            </Link>
          </div>

          <AuthenticatedHeader
            title="大会設定"
            subtitle={currentTournament ? `大会ID: ${currentTournament.tournamentId}` : "デフォルト大会を設定"}
          />

          <div className="mt-8">
            {currentTournament ? (
              <TournamentSettingsForm
                tournament={{
                  ...currentTournament,
                  createdAt: new Date(currentTournament.createdAt),
                  updatedAt: new Date(currentTournament.updatedAt),
                }}
                onSave={handleSave}
                isNewTournament={isNewTournament}
              />
            ) : (
              <div className="flex items-center justify-center h-64 bg-white rounded-lg border border-gray-200">
                <div className="text-center text-gray-500">
                  <p className="text-lg font-medium">大会情報が見つかりません</p>
                  <p className="text-sm">組織にデフォルト大会が作成されていない可能性があります</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuardWrapper>
  );
}
