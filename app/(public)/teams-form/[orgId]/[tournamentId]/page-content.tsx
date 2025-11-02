"use client";

import { PlayerRegistrationForm, TournamentInfoBanner } from "@/components/organisms";
import { useRegisterTeamWithParams } from "@/queries/use-teams";
import type { PlayerRegistrationData } from "@/types/player-registration.schema";

interface TeamsFormPageContentProps {
    orgId: string;
    tournamentId: string;
}

export function TeamsFormPageContent({
    orgId,
    tournamentId,
}: TeamsFormPageContentProps) {
    const registerTeamMutation = useRegisterTeamWithParams(orgId, tournamentId);

    const handleSubmit = async (formData: PlayerRegistrationData) => {
        return await registerTeamMutation.mutateAsync(formData);
    };

    return (
        <>
            {/* 大会情報バナー */}
            <TournamentInfoBanner orgId={orgId} tournamentId={tournamentId} />

            {/* 選手登録フォーム */}
            <PlayerRegistrationForm
                onSubmit={handleSubmit}
                orgId={orgId}
                tournamentId={tournamentId}
            />
        </>
    );
}