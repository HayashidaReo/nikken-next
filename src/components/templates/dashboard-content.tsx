import { MatchListTableMemo } from "@/components/organisms/match-list-table";
import { TeamMatchListTableMemo } from "@/components/organisms/team-match-list-table";
import { MatchGroupListTableMemo } from "@/components/organisms/match-group-list-table";
import { Button } from "@/components/atoms/button";
import { ArrowLeft } from "lucide-react";
import type { Match, MatchGroup, TeamMatch } from "@/types/match.schema";
import type { Team } from "@/types/team.schema";
import type { Court } from "@/types/tournament.schema";

interface DashboardContentProps {
    tournamentType: "individual" | "team";
    matchGroupId: string | null;
    matches: Match[];
    matchGroups: MatchGroup[];
    teamMatches: TeamMatch[];
    teams: Team[];
    tournamentName: string;
    courts: Court[];
    onBack: () => void;
}

export function DashboardContent({
    tournamentType,
    matchGroupId,
    matches,
    matchGroups,
    teamMatches,
    teams,
    tournamentName,
    courts,
    onBack,
}: DashboardContentProps) {
    if (tournamentType === "team") {
        if (matchGroupId) {
            const group = matchGroups.find((g) => g.matchGroupId === matchGroupId);
            const teamA = teams.find((t) => t.teamId === group?.teamAId)?.teamName || "";
            const teamB = teams.find((t) => t.teamId === group?.teamBId)?.teamName || "";
            const title = `${tournamentName} (${teamA} vs ${teamB})`;

            return (
                <>
                    <div className="mb-4">
                        <Button variant="outline" onClick={onBack}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            一覧に戻る
                        </Button>
                    </div>
                    <TeamMatchListTableMemo
                        matches={teamMatches}
                        tournamentName={title}
                    />
                </>
            );
        }

        return (
            <MatchGroupListTableMemo
                matchGroups={matchGroups}
                teams={teams}
                tournamentName={tournamentName}
                courts={courts}
            />
        );
    }

    return (
        <MatchListTableMemo
            matches={matches}
            tournamentName={tournamentName}
            courts={courts}
        />
    );
}
