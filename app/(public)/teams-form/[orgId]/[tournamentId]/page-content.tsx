"use client";

import { TeamRegistrationForm, TournamentInfoBanner } from "@/components/organisms";
import { useRegisterTeamWithParams } from "@/queries/use-teams";
import type { TeamFormData } from "@/types/team-form.schema";

interface TeamsFormPageContentProps {
    orgId: string;
    tournamentId: string;
}

export function TeamsFormPageContent({
    orgId,
    tournamentId,
}: TeamsFormPageContentProps) {
    const registerTeamMutation = useRegisterTeamWithParams(orgId, tournamentId);

    const handleSubmit = async (formData: TeamFormData) => {
        return await registerTeamMutation.mutateAsync(formData);
    };

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