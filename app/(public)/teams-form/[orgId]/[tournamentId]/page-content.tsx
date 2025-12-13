"use client";

import { useEffect, useRef } from "react";
import { notFound, useRouter } from "next/navigation";
import { LoadingIndicator } from "@/components/molecules/loading-indicator";
import {
  TeamRegistrationForm,
  TournamentInfoBanner,
} from "@/components/organisms";
import { InfoDisplay } from "@/components/molecules/info-display";
import { useRegisterTeamWithParams } from "@/queries/use-teams";
import { useTournament } from "@/queries/use-tournaments";
import type { TeamFormData } from "@/types/team-form.schema";

interface TeamsFormPageContentProps {
  orgId: string;
  tournamentId: string;
}

export function TeamsFormPageContent({
  orgId,
  tournamentId,
}: TeamsFormPageContentProps) {
  // 大会データを取得して存在チェック
  const {
    data: tournament,
    isLoading,
    error,
  } = useTournament(orgId, tournamentId);
  const registerTeamMutation = useRegisterTeamWithParams(orgId, tournamentId);
  const hasNotifiedRef = useRef(false);
  const router = useRouter();

  // パラメータの基本的な検証
  if (!orgId || !tournamentId) {
    notFound();
  }

  // 404エラーの処理
  useEffect(() => {
    if (!isLoading && error && !hasNotifiedRef.current) {
      hasNotifiedRef.current = true;
      const timer = setTimeout(() => {
        // 元のURLをセッションストレージに保存
        const originalUrl = `/teams-form/${orgId}/${tournamentId}`;
        sessionStorage.setItem("originalUrl", originalUrl);
        router.replace("/not-found");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading, error, tournament, router, orgId, tournamentId]);

  const handleSubmit = async (formData: TeamFormData) => {
    await registerTeamMutation.mutateAsync(formData);
  };

  // ローディング中またはエラー時（404への遷移待ち）はローディングスピナーを表示
  if (isLoading || (!isLoading && error)) {
    return (
      <div className="max-w-4xl mx-auto">
        <LoadingIndicator
          message={
            isLoading ? "大会情報を読み込み中..." : "大会情報を確認中..."
          }
          size="xl"
          className="min-h-[400px]"
        />
      </div>
    );
  }

  // フォーム公開期間外チェック
  if (tournament && !tournament.isTeamFormOpen) {
    return (
      <div className="max-w-4xl mx-auto mt-8 px-4">
        <InfoDisplay
          variant="warning"
          title="受付していません"
          message="現在、この大会のチーム登録フォームは公開されていません。\n大会主催者にお問い合わせください。"
        />
        <div className="mt-8">
          <TournamentInfoBanner orgId={orgId} tournamentId={tournamentId} />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 大会情報バナー */}
      <TournamentInfoBanner orgId={orgId} tournamentId={tournamentId} />

      {/* チーム登録フォーム */}
      <TeamRegistrationForm
        onSubmit={handleSubmit}
        orgId={orgId}
        tournamentId={tournamentId}
      />
    </>
  );
}
