"use client";

import { useEffect, useRef } from "react";
import { notFound, useRouter } from "next/navigation";
import { TeamRegistrationForm, TournamentInfoBanner } from "@/components/organisms";
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
    const { data: tournament, isLoading, error } = useTournament(orgId, tournamentId);
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
                router.replace('/not-found');
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isLoading, error, tournament, router]);

    const handleSubmit = async (formData: TeamFormData) => {
        return await registerTeamMutation.mutateAsync(formData);
    };

    // ローディング中またはエラー時（404への遷移待ち）はローディングスピナーを表示
    if (isLoading || (!isLoading && error)) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-center items-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">
                            {isLoading ? "大会情報を読み込み中..." : "大会情報を確認中..."}
                        </p>
                    </div>
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