import { MatchListTableMemo } from "@/components/organisms/match-list-table";
import { TeamMatchListTableMemo } from "@/components/organisms/team-match-list-table";
import { MatchGroupListTableMemo } from "@/components/organisms/match-group-list-table";
import { MonitorControlButton } from "@/components/molecules/monitor-control-button";
import { Button } from "@/components/atoms/button";
import { ArrowLeft } from "lucide-react";
import type { Match, MatchGroup, TeamMatch } from "@/types/match.schema";
import type { Team } from "@/types/team.schema";
import type { Court, Round } from "@/types/tournament.schema";
import { MasterDataProvider } from "@/components/providers/master-data-provider";
import { SCORE_COLORS } from "@/lib/ui-constants";
import { cn } from "@/lib/utils/utils";
import { calculateTeamMatchWins } from "@/domains/match/team-match-logic";

interface DashboardContentProps {
    tournamentType: "individual" | "team";
    matchGroupId: string | null;
    matches: Match[];
    matchGroups: MatchGroup[];
    teamMatches: TeamMatch[];
    teams: Team[];
    tournamentName: string;
    courts: Court[];
    rounds?: Round[];
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
    rounds,
    onBack,
}: DashboardContentProps) {
    const content = (() => {
        if (tournamentType === "team") {
            if (matchGroupId) {
                const group = matchGroups.find((g) => g.matchGroupId === matchGroupId);
                const teamA = teams.find((t) => t.teamId === group?.teamAId)?.teamName || "";
                const teamB = teams.find((t) => t.teamId === group?.teamBId)?.teamName || "";

                // 勝利数の集計
                const { winsA, winsB } = calculateTeamMatchWins(teamMatches);

                // 色の決定ロジック
                const getTeamColor = (myWins: number, opponentWins: number) => {
                    if (myWins > opponentWins) return SCORE_COLORS.win;
                    if (myWins < opponentWins) return SCORE_COLORS.loss;
                    return SCORE_COLORS.draw;
                };

                const colorA = getTeamColor(winsA, winsB);
                const colorB = getTeamColor(winsB, winsA);

                const courtName = courts.find(c => c.courtId === group?.courtId)?.courtName || "";

                const titleContent = (
                    <div className="flex flex-col gap-2 w-full relative">
                        <div className="flex items-center justify-center gap-4 text-2xl font-bold mt-2">
                            {/* Team A (Right Aligned) */}
                            <div className={cn("flex-1 text-right", colorA)}>
                                {teamA}
                            </div>

                            {/* Score & VS (Center) */}
                            <div className="flex items-center gap-4 px-4 shrink-0">
                                <span className={cn("text-4xl font-black", colorA)}>
                                    {winsA}
                                </span>
                                <span className="text-gray-400 text-sm italic font-normal">VS</span>
                                <span className={cn("text-4xl font-black", colorB)}>
                                    {winsB}
                                </span>
                            </div>

                            {/* Team B (Left Aligned) */}
                            <div className={cn("flex-1 text-left", colorB)}>
                                {teamB}
                            </div>
                        </div>

                        {/* Monitor Control Button (Absolute Right) */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2">
                            <MonitorControlButton matchGroupId={matchGroupId} />
                        </div>
                    </div>
                );

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
                            tournamentName={titleContent}
                            rawTournamentName={tournamentName}
                            courtName={courtName}
                        />
                    </>
                );
            }

            return (
                <MatchGroupListTableMemo
                    matchGroups={matchGroups}
                    tournamentName={tournamentName}
                />
            );
        }

        return (
            <MatchListTableMemo
                matches={matches}
                tournamentName={tournamentName}
            />
        );
    })();

    return (
        <MasterDataProvider teams={teams} courts={courts} rounds={rounds}>
            {content}
        </MasterDataProvider>
    );
}
