import { memo } from "react";
import { useRouter } from "next/navigation";
import { TableRow, TableCell } from "@/components/atoms/table";
import { findCourtName } from "@/lib/utils/court-utils";
import PlayerCell from "@/components/molecules/player-cell";
import MatchTable from "@/components/organisms/match-table";
import { Button } from "@/components/atoms/button";
import { ArrowRight } from "lucide-react";
import type { MatchGroup } from "@/types/match.schema";
import type { Team } from "@/types/team.schema";

interface MatchGroupListTableProps {
    matchGroups: MatchGroup[];
    teams: Team[];
    tournamentName: string;
    courts?: Array<{ courtId: string; courtName: string }>;
    className?: string;
}

export function MatchGroupListTable({ matchGroups, teams, tournamentName, courts, className }: MatchGroupListTableProps) {
    const router = useRouter();

    const getTeamName = (teamId: string) => {
        return teams.find(t => t.teamId === teamId)?.teamName || "不明なチーム";
    };

    return (
        <MatchTable
            title={tournamentName}
            columns={[
                { key: "court", label: "コート名", width: 150 },
                { key: "round", label: "回戦", width: 100 },
                { key: "teamA", label: "チームA", width: 200 },
                { key: "vs", label: "", width: 50, className: "text-center" },
                { key: "teamB", label: "チームB", width: 200 },
                { key: "action", label: "詳細", width: 100, className: "text-center" },
            ]}
            className={className}
        >
            {matchGroups.map((group) => {
                const courtName = findCourtName(group.courtId, courts);
                const teamAName = getTeamName(group.teamAId);
                const teamBName = getTeamName(group.teamBId);

                return (
                    <TableRow key={group.matchGroupId}>
                        <PlayerCell text={courtName} title={courtName} />
                        <PlayerCell text={group.round} title={group.round} />
                        <PlayerCell text={teamAName} title={teamAName} />
                        <TableCell className="p-0 text-center">
                            <div className="flex items-center justify-center h-full text-gray-400 font-bold">vs</div>
                        </TableCell>
                        <PlayerCell text={teamBName} title={teamBName} />
                        <TableCell className="p-2 text-center">
                            <div className="flex items-center justify-center">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.push(`?matchGroupId=${group.matchGroupId}`)}
                                >
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                );
            })}
        </MatchTable>
    );
}

export const MatchGroupListTableMemo = memo(MatchGroupListTable);
