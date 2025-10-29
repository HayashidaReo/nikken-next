"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { AuthGuardWrapper } from "@/components/templates/auth-guard-wrapper";
import { AuthenticatedHeader } from "@/components/organisms/authenticated-header";
import { TournamentList } from "@/components/organisms/tournament-list";
import { TournamentForm, TournamentFormPlaceholder } from "@/components/organisms/tournament-form";
import { useTournamentSettings } from "@/hooks/useTournamentSettings";
import type { TournamentWithId } from "@/types/tournament.schema";

export default function TournamentSettingsPage() {
  const {
    // 状態
    orgId,
    tournaments,
    isLoading,
    error,
    isCreatingOrg,
    selectedTournamentId,
    isAddingNew,
    formData,

    // アクション
    handleSelectTournament,
    handleStartNew,
    handleFormChange,
    handleSave,
    handleCreateOrganization,
  } = useTournamentSettings();

  // 選択されている大会
  const selectedTournament = selectedTournamentId
    ? tournaments.find((t: TournamentWithId) => t.tournamentId === selectedTournamentId)
    : null;

  // 組織IDが設定されていない場合
  if (!orgId) {
    return (
      <AuthGuardWrapper>
        <div className="min-h-screen bg-gray-50 py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <AuthenticatedHeader title="大会設定" />
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">
                大会を設定するには、まず組織を選択してください。
              </p>
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
          <div className="max-w-6xl mx-auto">
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
          <div className="max-w-6xl mx-auto">
            <AuthenticatedHeader title="大会設定" />
            <div className="mt-8 text-center">
              <p className="text-red-600 mb-4">{error?.message || String(error)}</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => window.location.reload()}>
                  再読み込み
                </Button>
                {String(error).includes("組織が見つかりません") && (
                  <Button
                    onClick={handleCreateOrganization}
                    disabled={isCreatingOrg}
                    variant="outline"
                  >
                    {isCreatingOrg ? "作成中..." : "🏢 組織を作成"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </AuthGuardWrapper>
    );
  }

  return (
    <AuthGuardWrapper>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
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
            subtitle="大会の編集・新規追加・削除を行う管理画面"
          />

          <div className="mt-8 flex gap-8">
            {/* 左側: 大会一覧エリア */}
            <TournamentList
              orgId={orgId}
              selectedTournamentId={selectedTournamentId}
              onTournamentSelect={handleSelectTournament}
              onNewTournament={handleStartNew}
              className="w-1/3"
            />

            {/* 右側: 大会詳細フォーム */}
            {(selectedTournament || isAddingNew) ? (
              <TournamentForm
                formData={formData}
                isAddingNew={isAddingNew}
                onFormChange={handleFormChange}
                onSave={handleSave}
                className="flex-1"
              />
            ) : (
              <TournamentFormPlaceholder className="flex-1" />
            )}
          </div>
        </div>
      </div>
    </AuthGuardWrapper>
  );
}