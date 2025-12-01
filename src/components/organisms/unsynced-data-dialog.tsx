"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/atoms/button";
import { LocalMatch, LocalMatchGroup, LocalTeamMatch, LocalTeam, LocalTournament, db } from "@/lib/db";
import { CloudUpload, User, Phone, Mail, FileText, Calendar, MapPin, Trophy, LayoutGrid } from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils/utils";
import { useMasterData } from "@/components/providers/master-data-provider";
import { useLiveQuery } from "dexie-react-hooks";
import { MatchScoreDisplay } from "@/components/molecules/match-score-display";
import { SCORE_COLORS } from "@/lib/ui-constants";
import { WIN_REASON_LABELS, getTeamMatchRoundLabelById } from "@/lib/constants";
import type { HansokuLevel } from "@/lib/utils/penalty-utils";

interface UnsyncedData {
    matches: LocalMatch[];
    matchGroups: LocalMatchGroup[];
    teamMatches: LocalTeamMatch[];
    teams: LocalTeam[];
    tournaments: LocalTournament[];
}

interface UnsyncedDataDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    data: UnsyncedData;
}

interface TabButtonProps {
    value: "matches" | "groups" | "teams" | "tournaments";
    label: string;
    count: number;
    isActive: boolean;
    onClick: (value: "matches" | "groups" | "teams" | "tournaments") => void;
}

const TabButton = ({ value, label, count, isActive, onClick }: TabButtonProps) => (
    <button
        onClick={() => onClick(value)}
        className={cn(
            "flex-1 py-2 text-sm font-medium border-b-2 transition-colors",
            isActive
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
        )}
    >
        {label} ({count})
    </button>
);

const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800", className)}>
        {children}
    </span>
);

export function UnsyncedDataDialog({ isOpen, onClose, onConfirm, data }: UnsyncedDataDialogProps) {
    const { matches, matchGroups, teamMatches, teams, tournaments } = data;
    const totalCount = matches.length + matchGroups.length + teamMatches.length + teams.length + tournaments.length;
    const [activeTab, setActiveTab] = useState<"matches" | "groups" | "teams" | "tournaments">("matches");
    const { getTeam, getCourt, getRound } = useMasterData();

    // 関連するグループIDを収集
    const relatedGroupIds = useMemo(() => {
        const ids = new Set<string>();
        matchGroups.forEach(g => g.matchGroupId && ids.add(g.matchGroupId));
        teamMatches.forEach(m => m.matchGroupId && ids.add(m.matchGroupId));
        return Array.from(ids);
    }, [matchGroups, teamMatches]);

    // 関連するグループ情報を取得
    const relatedGroups = useLiveQuery(async () => {
        if (relatedGroupIds.length === 0) return [];
        return await db.matchGroups.where('matchGroupId').anyOf(relatedGroupIds).toArray();
    }, [relatedGroupIds]);

    // グループごとにデータをまとめる
    const groupedData = useMemo(() => {
        if (!relatedGroups) return [];

        return relatedGroups.map(group => {
            const groupMatches = teamMatches.filter(m => m.matchGroupId === group.matchGroupId).sort((a, b) => a.sortOrder - b.sortOrder);
            const isGroupUnsynced = matchGroups.some(g => g.matchGroupId === group.matchGroupId);
            const deleted = matchGroups.find(g => g.matchGroupId === group.matchGroupId)?._deleted;
            return {
                group,
                matches: groupMatches,
                isGroupUnsynced,
                deleted
            };
        }).filter(item => item.matches.length > 0 || item.isGroupUnsynced);
    }, [relatedGroups, teamMatches, matchGroups]);

    const handleConfirm = async () => {
        await onConfirm();
        onClose();
    };

    const getPlayerName = (teamId: string, playerId: string) => {
        const team = getTeam(teamId);
        if (!team) return playerId;
        const player = team.players.find(p => p.playerId === playerId);
        return player ? player.displayName : playerId;
    };

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

    const getPlayerTextColor = (playerScore: number, opponentScore: number, isCompleted: boolean, winner: "playerA" | "playerB" | "draw" | "none" | null | undefined, isPlayerA: boolean) => {
        if (!isCompleted) return SCORE_COLORS.unplayed;

        if (winner) {
            if (winner === "draw") return SCORE_COLORS.draw;
            if (isPlayerA && winner === "playerA") return SCORE_COLORS.win;
            if (!isPlayerA && winner === "playerB") return SCORE_COLORS.win;
            return SCORE_COLORS.loss;
        }

        if (playerScore === 0 && opponentScore === 0) {
            return SCORE_COLORS.draw;
        }
        if (playerScore > opponentScore) return SCORE_COLORS.win;
        if (playerScore === opponentScore) return SCORE_COLORS.draw;
        return SCORE_COLORS.loss;
    };

    const MatchItem = ({ match, showRound = true }: { match: LocalMatch | LocalTeamMatch, showRound?: boolean }) => {
        const playerAName = getPlayerName(match.players.playerA.teamId, match.players.playerA.playerId);
        const playerBName = getPlayerName(match.players.playerB.teamId, match.players.playerB.playerId);
        const playerAColor = getPlayerTextColor(match.players.playerA.score, match.players.playerB.score, match.isCompleted, match.winner, true);
        const playerBColor = getPlayerTextColor(match.players.playerB.score, match.players.playerA.score, match.isCompleted, match.winner, false);
        const winReason = match.winReason && match.winReason !== "none" ? WIN_REASON_LABELS[match.winReason] : "";


        return (
            <div className="bg-white p-2 rounded border shadow-sm">
                {/* Header: Round | Result | Status */}
                <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="font-bold text-gray-700">
                        {showRound ? `${getRoundName(match.roundId)} - ` : ""}
                        {'courtId' in match ? getCourtName(match.courtId) : (getTeamMatchRoundLabelById(match.roundId) || `第${match.sortOrder}試合`)}
                    </span>
                    <div className="flex items-center gap-2">
                        {winReason && <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{winReason}</span>}
                        {match._deleted && <Badge>削除対象</Badge>}
                    </div>
                </div>

                {/* Body: Player A [Score] Player B */}
                <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
                    <div className={cn("text-base font-bold text-right truncate leading-tight", playerAColor)}>
                        {playerAName}
                    </div>

                    <MatchScoreDisplay
                        playerAScore={match.players.playerA.score}
                        playerBScore={match.players.playerB.score}
                        playerAColor={playerAColor}
                        playerBColor={playerBColor}
                        playerADisplayName={playerAName}
                        playerBDisplayName={playerBName}
                        playerAHansoku={match.players.playerA.hansoku as HansokuLevel}
                        playerBHansoku={match.players.playerB.hansoku as HansokuLevel}
                        isCompleted={match.isCompleted}
                        className="scale-90" // Slightly compact the score component
                    />

                    <div className={cn("text-base font-bold text-left truncate leading-tight", playerBColor)}>
                        {playerBName}
                    </div>
                </div>
                <div className="text-[10px] text-gray-400 text-left mt-1">
                    ID: {match.matchId}
                </div>
            </div>
        );
    };

    const TeamItem = ({ team }: { team: LocalTeam }) => {
        return (
            <div className="bg-white p-3 rounded border shadow-sm space-y-3">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-lg text-gray-800">{team.teamName}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            {team.isApproved ? (
                                <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded border border-green-200">承認済み</span>
                            ) : (
                                <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded border border-yellow-200">未承認</span>
                            )}
                        </div>
                    </div>
                    {team._deleted && <Badge>削除対象</Badge>}
                </div>

                {/* Representative Info */}
                {(team.representativeName || team.representativePhone || team.representativeEmail) && (
                    <div className="bg-gray-50 p-2 rounded text-sm space-y-1">
                        <div className="font-medium text-gray-700 mb-1">代表者情報</div>
                        {team.representativeName && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <User className="w-3 h-3" />
                                <span>{team.representativeName}</span>
                            </div>
                        )}
                        {team.representativePhone && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <Phone className="w-3 h-3" />
                                <span>{team.representativePhone}</span>
                            </div>
                        )}
                        {team.representativeEmail && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <Mail className="w-3 h-3" />
                                <span>{team.representativeEmail}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Players */}
                <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">登録選手 ({team.players.length}名)</div>
                    <div className="flex flex-wrap gap-1.5">
                        {team.players.map((player) => (
                            <span key={player.playerId} className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded border border-blue-100">
                                {player.displayName || `${player.lastName} ${player.firstName}`}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Remarks */}
                {team.remarks && (
                    <div className="flex items-start gap-2 text-sm text-gray-600 bg-yellow-50 p-2 rounded border border-yellow-100">
                        <FileText className="w-4 h-4 mt-0.5 text-yellow-600 shrink-0" />
                        <p className="whitespace-pre-wrap">{team.remarks}</p>
                    </div>
                )}

                <div className="text-[10px] text-gray-400 text-right mt-1">
                    ID: {team.teamId}
                </div>
            </div>
        );
    };

    const TournamentItem = ({ tournament }: { tournament: LocalTournament }) => {
        return (
            <div className="bg-white p-4 rounded-lg border shadow-sm space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-xl text-gray-800">{tournament.tournamentName}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                            <span className={cn(
                                "px-2 py-0.5 rounded-full border text-xs font-medium",
                                tournament.tournamentType === 'team'
                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                    : "bg-green-50 text-green-700 border-green-200"
                            )}>
                                {tournament.tournamentType === 'team' ? '団体戦' : '個人戦'}
                            </span>
                            {tournament.tournamentDetail && (
                                <span className="text-gray-400 border-l pl-2 ml-1 truncate max-w-[200px]">
                                    {tournament.tournamentDetail}
                                </span>
                            )}
                        </div>
                    </div>
                    {tournament._deleted && <Badge>削除対象</Badge>}
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Date */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{new Date(tournament.tournamentDate).toLocaleDateString()}</span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{tournament.location || "未設定"}</span>
                    </div>
                </div>

                {/* Details (Rounds & Courts) */}
                <div className="space-y-2">
                    {/* Rounds */}
                    <div className="flex items-start gap-2">
                        <div className="mt-1 bg-orange-50 p-1 rounded text-orange-600">
                            <Trophy className="w-3 h-3" />
                        </div>
                        <div className="flex-1">
                            <div className="text-xs text-gray-500 mb-1">ラウンド ({tournament.rounds.length})</div>
                            <div className="flex flex-wrap gap-1.5">
                                {tournament.rounds.map((round) => (
                                    <span key={round.roundId} className="inline-flex items-center px-2 py-0.5 bg-orange-50 text-orange-700 text-xs rounded border border-orange-100">
                                        {round.roundName}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Courts */}
                    <div className="flex items-start gap-2">
                        <div className="mt-1 bg-indigo-50 p-1 rounded text-indigo-600">
                            <LayoutGrid className="w-3 h-3" />
                        </div>
                        <div className="flex-1">
                            <div className="text-xs text-gray-500 mb-1">コート ({tournament.courts.length})</div>
                            <div className="flex flex-wrap gap-1.5">
                                {tournament.courts.map((court) => (
                                    <span key={court.courtId} className="inline-flex items-center px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded border border-indigo-100">
                                        {court.courtName}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer ID */}
                <div className="pt-2 border-t border-gray-100 flex justify-end">
                    <code className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                        ID: {tournament.tournamentId}
                    </code>
                </div>
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[90vw] max-w-[95vw] h-[90vh] flex flex-col w-full">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CloudUpload className="w-5 h-5" />
                        送信データの確認
                    </DialogTitle>
                    <DialogDescription>
                        以下の {totalCount} 件のデータをクラウドに送信します。よろしいですか？
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden min-h-[400px] flex flex-col">
                    <div className="flex border-b border-gray-200 mb-2">
                        <TabButton value="matches" label="個人戦" count={matches.length} isActive={activeTab === "matches"} onClick={setActiveTab} />
                        <TabButton value="groups" label="団体戦" count={matchGroups.length + teamMatches.length} isActive={activeTab === "groups"} onClick={setActiveTab} />
                        <TabButton value="teams" label="チーム" count={teams.length} isActive={activeTab === "teams"} onClick={setActiveTab} />
                        <TabButton value="tournaments" label="大会" count={tournaments.length} isActive={activeTab === "tournaments"} onClick={setActiveTab} />
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 bg-slate-50 border rounded-md">
                        {activeTab === "matches" && (
                            matches.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">データはありません</div>
                            ) : (
                                <div className="space-y-2">
                                    {matches.map((m) => (
                                        <MatchItem key={m.matchId} match={m} />
                                    ))}
                                </div>
                            )
                        )}

                        {activeTab === "groups" && (
                            groupedData.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">データはありません</div>
                            ) : (
                                <div className="space-y-4">
                                    {groupedData.map(({ group, matches, deleted }) => (
                                        <div key={group.matchGroupId} className="bg-white rounded border shadow-sm overflow-hidden">
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
                                    ))}
                                </div>
                            )
                        )}

                        {activeTab === "teams" && (
                            teams.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">データはありません</div>
                            ) : (
                                <div className="space-y-2">
                                    {teams.map((t) => (
                                        <TeamItem key={t.teamId} team={t} />
                                    ))}
                                </div>
                            )
                        )}

                        {activeTab === "tournaments" && (
                            tournaments.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">データはありません</div>
                            ) : (
                                <div className="space-y-2">
                                    {tournaments.map((t) => (
                                        <TournamentItem key={t.tournamentId} tournament={t} />
                                    ))}
                                </div>
                            )
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        キャンセル
                    </Button>
                    <Button onClick={handleConfirm}>
                        送信する
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
