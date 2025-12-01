import { LocalMatchGroup, LocalTeamMatch } from "@/lib/db";
import { useMasterData } from "@/components/providers/master-data-provider";
import { Badge } from "./badge";
import { MatchItem } from "./match-item";

interface GroupItemProps {
    group: LocalMatchGroup;
    matches: LocalTeamMatch[];
    deleted?: boolean;
}

export const GroupItem = ({ group, matches, deleted }: GroupItemProps) => {
    const { getTeam, getRound, getCourt } = useMasterData();

    const getTeamName = (teamId: string) => {
        const team = getTeam(teamId);
        return team ? team.teamName : teamId;
    };

    const getCourtName = (courtId: string) => {
        const court = getCourt(courtId);
        return court ? court.courtName : courtId;
    };

    const getRoundName = (roundId: string) => {
        const round = getRound(roundId);
        return round ? round.roundName : roundId;
    };

    return (
        <div className="bg-white rounded border shadow-sm overflow-hidden">
            {/* Group Header */}
            <div className="p-2 flex justify-between items-center text-sm bg-gray-50">
                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                    <span className="font-bold truncate">
                        {getTeamName(group.teamAId)} <span className="text-gray-400 font-normal mx-1">vs</span> {getTeamName(group.teamBId)}
                    </span>
                    <div className="flex items-center gap-2 text-gray-600 text-xs whitespace-nowrap">
                        <span className="bg-white px-1.5 py-0.5 rounded border">{getRoundName(group.roundId)}</span>
                        <span className="bg-white px-1.5 py-0.5 rounded border">{getCourtName(group.courtId)}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 ml-2 shrink-0">
                    {deleted && <Badge>削除</Badge>}
                </div>
            </div>
            <div className="px-2 pb-1 text-[10px] text-gray-400 bg-gray-50 border-b">
                ID: {group.matchGroupId}
            </div>

            {/* Matches List */}
            {matches.length > 0 && (
                <div className="p-2 bg-gray-50 space-y-2">
                    {matches.map((tm) => (
                        <MatchItem key={tm.matchId} match={tm} showRound={false} />
                    ))}
                </div>
            )}
        </div>
    );
};
