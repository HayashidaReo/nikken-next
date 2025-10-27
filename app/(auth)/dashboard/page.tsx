import { MainLayout } from "@/components/templates/main-layout";
import { MatchListTable } from "@/components/organisms/match-list-table";
import { mockMatches, mockTournament } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <MainLayout 
      activeTab="matches" 
      tournamentName={mockTournament.tournamentName}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">試合一覧</h1>
        </div>
        
        <MatchListTable 
          matches={mockMatches}
          tournamentName={mockTournament.tournamentName}
        />
      </div>
    </MainLayout>
  );
}