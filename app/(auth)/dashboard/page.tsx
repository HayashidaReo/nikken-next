"use client";

import { MainLayout } from "@/components/templates/main-layout";
import { AuthGuardWrapper } from "@/components/templates/auth-guard-wrapper";
import { AuthenticatedHeader } from "@/components/organisms/authenticated-header";
import { MatchListTable } from "@/components/organisms/match-list-table";
import { mockMatches, mockTournament } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <AuthGuardWrapper>
      <MainLayout
        activeTab="matches"
        tournamentName={mockTournament.tournamentName}
      >
        <div className="space-y-6">
          <AuthenticatedHeader
            title="試合一覧"
          />

          <MatchListTable
            matches={mockMatches}
            tournamentName={mockTournament.tournamentName}
          />
        </div>
      </MainLayout>
    </AuthGuardWrapper>
  );
}
