"use client";

import React, { useMemo } from "react";
import { MatchGroup } from "@/types/match.schema";
import { Tournament } from "@/types/tournament.schema";
import { Team } from "@/types/team.schema";
import { cn } from "@/lib/utils";

interface BracketViewProps {
    tournament: Tournament;
    matchGroups: MatchGroup[];
    teams: Team[];
}

/**
 * トーナメント表を表示するコンポーネント
 * 
 * note: この実装は、matchGroupsとroundsを用いて簡易的なトーナメントツリーを描画します。
 * 厳密なツリー構造（誰がどこに勝ち上がるか）の定義データがないため、
 * roundIdごとにグループ化し、単純にリスト表示する形式を採用します。
 * 将来的には、matchGroup同士の親子関係（nextMatchIdなど）を持つことで、
 * 線で繋がった完全なツリーを描画できます。
 */
export const BracketView: React.FC<BracketViewProps> = ({ tournament, matchGroups, teams }) => {
    // ラウンドごとに試合をグループ化
    const roundsMap = useMemo(() => {
        const map = new Map<string, MatchGroup[]>();
        // sortOrderでソート済み前提だが、念のため
        const sortedGroups = [...matchGroups].sort((a, b) => a.sortOrder - b.sortOrder);

        sortedGroups.forEach(group => {
            if (!map.has(group.roundId)) {
                map.set(group.roundId, []);
            }
            map.get(group.roundId)?.push(group);
        });
        return map;
    }, [matchGroups]);

    // 大会のrounds定義順に表示するためのリストを作成
    const roundColumns = useMemo(() => {
        return tournament.rounds.map(round => ({
            ...round,
            matches: roundsMap.get(round.roundId) || []
        })).filter(r => r.matches.length > 0); // 試合のあるラウンドのみ表示
    }, [tournament.rounds, roundsMap]);

    return (
        <div className="w-full overflow-x-auto p-4 bg-slate-50 min-h-screen">
            <div className="flex gap-8 min-w-max">
                {roundColumns.map((round) => (
                    <div key={round.roundId} className="flex flex-col gap-4 w-72">
                        <div className="text-center font-bold text-lg text-slate-700 py-2 border-b-2 border-slate-200 mb-4">
                            {round.roundName}
                        </div>
                        <div className="flex flex-col justify-around h-full gap-8 py-4">
                            {round.matches.map((match) => (
                                <MatchCard
                                    key={match.matchGroupId ?? match.sortOrder}
                                    match={match}
                                    teams={teams}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

interface MatchCardProps {
    match: MatchGroup;
    teams: Team[];
}

const MatchCard: React.FC<MatchCardProps> = ({ match, teams }) => {
    // チーム名解決
    const getTeamName = (teamId: string) => {
        return teams.find(t => t.teamId === teamId)?.teamName || "未定";
    };

    // 勝者のチームIDを特定
    const winnerId = match.winnerTeam === "teamA" ? match.teamAId :
        match.winnerTeam === "teamB" ? match.teamBId : null;

    return (
        <div className="shadow-sm border border-slate-200 bg-white rounded-md overflow-hidden">
            <div className="flex flex-col">
                <TeamRow
                    name={getTeamName(match.teamAId)}
                    isWinner={match.winnerTeam === "teamA"}
                    isLoser={match.isCompleted && match.winnerTeam !== "teamA" && match.winnerTeam !== undefined}
                />
                <div className="h-[1px] bg-slate-100 w-full" />
                <TeamRow
                    name={getTeamName(match.teamBId)}
                    isWinner={match.winnerTeam === "teamB"}
                    isLoser={match.isCompleted && match.winnerTeam !== "teamB" && match.winnerTeam !== undefined}
                />
            </div>
        </div>
    );
};

const TeamRow = ({ name, isWinner, isLoser }: { name: string, isWinner: boolean, isLoser: boolean }) => {
    return (
        <div className={cn(
            "flex justify-between items-center px-4 py-3",
            isWinner && "bg-blue-50 font-bold text-blue-900",
            isLoser && "text-slate-400"
        )}>
            <span className="truncate text-sm">{name}</span>
            {isWinner && <span className="text-blue-600 text-xs ml-2 font-bold">WIN</span>}
        </div>
    );
};
