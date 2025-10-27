import { MainLayout } from "@/components/templates/main-layout";
import { MatchSetupTable } from "@/components/organisms/match-setup-simple-table";
import { mockTeams, mockMatches, mockTournament } from "@/lib/mock-data";

export default function MatchSetupPage() {
  const handleSave = (matches: { id: string; courtId: string; round: string; playerATeamId: string; playerAId: string; playerBTeamId: string; playerBId: string; }[]) => {
    console.log("試合の組み合わせを保存:", matches);
    alert("組み合わせを保存しました");
  };

  return (
    <MainLayout 
      activeTab="match-setup" 
      tournamentName={mockTournament.tournamentName}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">試合の組み合わせ設定</h1>
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