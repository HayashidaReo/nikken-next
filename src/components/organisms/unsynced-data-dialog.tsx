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
import { LocalMatch, LocalMatchGroup, LocalTeamMatch, LocalTeam, db } from "@/lib/db";
import { CloudUpload } from "lucide-react";
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
}

interface UnsyncedDataDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    data: UnsyncedData;
}

interface TabButtonProps {
    value: "matches" | "groups" | "teams";
    label: string;
    count: number;
    isActive: boolean;
    onClick: (value: "matches" | "groups" | "teams") => void;
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
    const { matches, matchGroups, teamMatches, teams } = data;
    const totalCount = matches.length + matchGroups.length + teamMatches.length + teams.length;
    const [activeTab, setActiveTab] = useState<"matches" | "groups" | "teams">("matches");
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
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col w-full">
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
                                    {groupedData.map(({ group, matches, isGroupUnsynced, deleted }) => (
                                        <div key={group.matchGroupId} className="bg-white rounded border shadow-sm overflow-hidden">
                                            {/* Group Header */}
                                            <div className={cn(
                                                "p-2 border-b flex justify-between items-center text-sm",
                                                isGroupUnsynced ? "bg-blue-50" : "bg-gray-50"
                                            )}>
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
                                                    {isGroupUnsynced && <Badge className="bg-blue-100 text-blue-800">変更あり</Badge>}
                                                    {deleted && <Badge>削除</Badge>}
                                                </div>
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
                                        <div key={t.teamId} className="bg-white p-3 rounded border text-sm shadow-sm">
                                            <div className="font-bold mb-1 flex justify-between">
                                                <span>{t.teamName}</span>
                                                {t._deleted && <Badge>削除対象</Badge>}
                                            </div>
                                            <div className="mt-1 text-gray-600">
                                                <span className="text-xs text-gray-400 block">Players</span>
                                                {t.players.map(p => p.displayName).join(", ")}
                                            </div>
                                        </div>
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
