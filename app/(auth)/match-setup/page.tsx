"use client";

import { MainLayout } from "@/components/templates/main-layout";
import { MatchSetupTable } from "@/components/organisms/match-setup-table";
import { mockTeams, mockMatches, mockTournament } from "@/lib/mock-data";
import { useToast } from "@/components/providers/notification-provider";

export default function MatchSetupPage() {
  const { showSuccess } = useToast();

  const handleSave = (
    matches: {
      id: string;
      courtId: string;
      round: string;
      playerATeamId: string;
      playerAId: string;
      playerBTeamId: string;
      playerBId: string;
    }[]
  ) => {
    showSuccess(`${matches.length}件の試合を設定しました`);
  };

  return (
    <MainLayout activeTab="match-setup">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            試合の組み合わせ設定
          </h1>
        </div>

        <MatchSetupTable
          teams={mockTeams}
          courts={mockTournament.courts}
          matches={mockMatches}
          onSave={handleSave}
        />
      </div>
    </MainLayout>
  );
}
