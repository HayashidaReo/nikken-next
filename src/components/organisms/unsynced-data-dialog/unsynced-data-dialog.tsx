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
import { CloudUpload } from "lucide-react";
import { useState, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { TabButton } from "./tab-button";
import { MatchItem } from "./match-item";
import { TeamItem } from "./team-item";
import { TournamentItem } from "./tournament-item";
import { GroupItem } from "./group-item";

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

export function UnsyncedDataDialog({ isOpen, onClose, onConfirm, data }: UnsyncedDataDialogProps) {
    const { matches, matchGroups, teamMatches, teams, tournaments } = data;
    const totalCount = matches.length + matchGroups.length + teamMatches.length + teams.length + tournaments.length;
    const [activeTab, setActiveTab] = useState<"matches" | "groups" | "teams" | "tournaments">("matches");

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
                                        <GroupItem key={group.matchGroupId} group={group} matches={matches} deleted={deleted} />
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
