"use client";

import { useAuthStore } from "@/store/use-auth-store";
import { useActiveTournament } from "@/store/use-active-tournament-store";
import { useTeams } from "@/queries/use-teams";
import { useTournament } from "@/queries/use-tournaments";
import { MasterDataProvider } from "@/components/providers/master-data-provider";

export function MasterDataWrapper({ children }: { children: React.ReactNode }) {
    const { user } = useAuthStore();
    const { activeTournamentId } = useActiveTournament();
    const orgId = user?.uid ?? null;

    const { data: teams = [] } = useTeams();
    const { data: tournament } = useTournament(orgId, activeTournamentId);

    const courts = tournament?.courts ?? [];
    const rounds = tournament?.rounds ?? [];

    return (
        <MasterDataProvider teams={teams} courts={courts} rounds={rounds}>
            {children}
        </MasterDataProvider>
    );
}
