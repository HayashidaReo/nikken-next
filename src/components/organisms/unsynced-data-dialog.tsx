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
import { LocalMatch, LocalMatchGroup, LocalTeamMatch, LocalTeam } from "@/lib/db";
import { CloudUpload } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils/utils";

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

import { useMasterData } from "@/components/providers/master-data-provider";

interface TabButtonProps {
    value: "matches" | "groups" | "teamMatches" | "teams";
    label: string;
    count: number;
    isActive: boolean;
    onClick: (value: "matches" | "groups" | "teamMatches" | "teams") => void;
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
    const [activeTab, setActiveTab] = useState<"matches" | "groups" | "teamMatches" | "teams">("matches");
    const { getTeam, getCourt, getRound } = useMasterData();

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
                        <TabButton value="groups" label="団体戦" count={matchGroups.length} isActive={activeTab === "groups"} onClick={setActiveTab} />
                        <TabButton value="teamMatches" label="団体試合" count={teamMatches.length} isActive={activeTab === "teamMatches"} onClick={setActiveTab} />
                        <TabButton value="teams" label="チーム" count={teams.length} isActive={activeTab === "teams"} onClick={setActiveTab} />
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 bg-slate-50 border rounded-md">
                        {activeTab === "matches" && (
                            matches.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">データはありません</div>
                            ) : (
                                <div className="space-y-2">
                                    {matches.map((m) => (
                                        <div key={m.matchId} className="bg-white p-3 rounded border text-sm shadow-sm">
                                            <div className="font-bold mb-1 flex justify-between">
                                                <span>{getRoundName(m.roundId)} - {getCourtName(m.courtId)}</span>
                                                {m._deleted && <Badge>削除対象</Badge>}
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-gray-600">
                                                <div>
                                                    <span className="text-xs text-gray-400 block">Player A</span>
                                                    {getPlayerName(m.players.playerA.teamId, m.players.playerA.playerId)}
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-400 block">Player B</span>
                                                    {getPlayerName(m.players.playerB.teamId, m.players.playerB.playerId)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}

                        {activeTab === "groups" && (
                            matchGroups.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">データはありません</div>
                            ) : (
                                <div className="space-y-2">
                                    {matchGroups.map((g) => (
                                        <div key={g.matchGroupId} className="bg-white p-3 rounded border text-sm shadow-sm">
                                            <div className="font-bold mb-1 flex justify-between">
                                                <span>{getRoundName(g.roundId)} - {getCourtName(g.courtId)}</span>
                                                {g._deleted && <Badge>削除対象</Badge>}
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-gray-600">
                                                <div>
                                                    <span className="text-xs text-gray-400 block">Team A</span>
                                                    {getTeamName(g.teamAId)}
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-400 block">Team B</span>
                                                    {getTeamName(g.teamBId)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}

                        {activeTab === "teamMatches" && (
                            teamMatches.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">データはありません</div>
                            ) : (
                                <div className="space-y-2">
                                    {teamMatches.map((tm) => (
                                        <div key={tm.matchId} className="bg-white p-3 rounded border text-sm shadow-sm">
                                            <div className="font-bold mb-1 flex justify-between">
                                                <span>{getRoundName(tm.roundId)} (第{tm.sortOrder}試合)</span>
                                                {tm._deleted && <Badge>削除対象</Badge>}
                                            </div>
                                            <div className="text-xs text-gray-400 mb-1">Group ID: {tm.matchGroupId}</div>
                                            <div className="grid grid-cols-2 gap-4 text-gray-600">
                                                <div>
                                                    <span className="text-xs text-gray-400 block">Player A</span>
                                                    {getPlayerName(tm.players.playerA.teamId, tm.players.playerA.playerId)}
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-400 block">Player B</span>
                                                    {getPlayerName(tm.players.playerB.teamId, tm.players.playerB.playerId)}
                                                </div>
                                            </div>
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
