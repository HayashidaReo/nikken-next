"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { MatchGroupSetupTable } from "@/components/organisms/match-group-setup-table";
import { TeamMatchSetupTable } from "@/components/organisms/team-match-setup-table";
import { Button } from "@/components/atoms/button";
import { ArrowLeft } from "lucide-react";
import { useMatchGroups, useCreateMatchGroup, useUpdateMatchGroup, useDeleteMatchGroup } from "@/queries/use-match-groups";
import { useTeamMatches, useCreateTeamMatch, useUpdateTeamMatch, useDeleteTeamMatch } from "@/queries/use-team-matches";
import { useToast } from "@/components/providers/notification-provider";
import type { MatchGroupCreate, TeamMatchCreate } from "@/types/match.schema";
import type { MatchGroupSetupData, TeamMatchSetupData } from "@/types/match-setup";
import { useMasterData } from "@/components/providers/master-data-provider";
import { useMatchGroupPersistence } from "@/hooks/useMatchGroupPersistence";

export function MatchGroupSetupManager() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const selectedMatchGroupId = searchParams.get("matchGroupId");
    const { showSuccess, showError } = useToast();
    const { teams } = useMasterData();

    // チーム対戦（MatchGroups）
    const { data: matchGroups = [] } = useMatchGroups();
    const createMatchGroup = useCreateMatchGroup();
    const updateMatchGroup = useUpdateMatchGroup();
    const deleteMatchGroup = useDeleteMatchGroup();

    // 個人試合（TeamMatches）
    const { data: teamMatches = [] } = useTeamMatches(selectedMatchGroupId);
    const createTeamMatch = useCreateTeamMatch();
    const updateTeamMatch = useUpdateTeamMatch();
    const deleteTeamMatch = useDeleteTeamMatch();
    const { syncMatchGroupsToCloud, syncTeamMatchesToCloud } = useMatchGroupPersistence();

    const handleBack = () => {
        const params = new URLSearchParams(searchParams);
        params.delete("matchGroupId");
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleSelect = (group: MatchGroupSetupData) => {
        const params = new URLSearchParams(searchParams);
        if (group.id) {
            params.set("matchGroupId", group.id);
            router.push(`${pathname}?${params.toString()}`);
        }
    };

    const handleSaveMatchGroups = async (data: MatchGroupSetupData[]): Promise<{ success: boolean; idMapping?: Record<string, string> }> => {
        // 既存のIDセット
        const currentIds = new Set(data.map(d => d.id).filter(id => !id.startsWith("group-")));

        const resolveRoundId = (row: MatchGroupSetupData) => row.roundId;

        try {
            // 削除
            const toDelete = matchGroups.filter(g => g.matchGroupId && !currentIds.has(g.matchGroupId));
            const deletePromises = toDelete.map(group => {
                if (group.matchGroupId) return deleteMatchGroup.mutateAsync(group.matchGroupId);
                return Promise.resolve();
            });
            await Promise.all(deletePromises);

            // 作成・更新
            const savedGroupIds: string[] = [];
            const idMapping: Record<string, string> = {};

            const savePromises = data.map(async (item) => {
                const roundId = resolveRoundId(item);
                if (!roundId) {
                    throw new Error("ラウンドが選択されていません");
                }

                if (item.id.startsWith("group-")) {
                    // 作成
                    const newGroup: MatchGroupCreate = {
                        courtId: item.courtId,
                        roundId,
                        teamAId: item.teamAId,
                        teamBId: item.teamBId,
                        sortOrder: item.sortOrder,
                        isCompleted: false,
                    };
                    const created = await createMatchGroup.mutateAsync(newGroup);
                    if (created.matchGroupId) {
                        savedGroupIds.push(created.matchGroupId);
                        idMapping[item.id] = created.matchGroupId;
                    }
                    return created;
                } else {
                    // 更新
                    // 変更があるかチェック
                    const original = matchGroups.find(g => g.matchGroupId === item.id);
                    if (original) {
                        const hasChanges =
                            original.courtId !== item.courtId ||
                            original.roundId !== roundId ||
                            original.teamAId !== item.teamAId ||
                            original.teamBId !== item.teamBId ||
                            original.sortOrder !== item.sortOrder;

                        if (!hasChanges) {
                            return Promise.resolve(0); // 変更なし
                        }
                    }

                    const patch: Partial<MatchGroupCreate> = {
                        courtId: item.courtId,
                        roundId,
                        teamAId: item.teamAId,
                        teamBId: item.teamBId,
                        sortOrder: item.sortOrder,
                    };
                    const updated = await updateMatchGroup.mutateAsync({ matchGroupId: item.id, patch });
                    if (updated > 0) savedGroupIds.push(item.id);
                    return updated;
                }
            });
            await Promise.all(savePromises);

            const deletedIds = toDelete.map(g => g.matchGroupId).filter((id): id is string => !!id);
            const allAffectedIds = [...savedGroupIds, ...deletedIds];

            if (allAffectedIds.length > 0) {
                showSuccess(`${allAffectedIds.length}件の変更を保存しました`);
                // バックグラウンド同期
                setTimeout(() => {
                    syncMatchGroupsToCloud(allAffectedIds, { showSuccessToast: true }).catch(err => {
                        console.error("Background sync failed:", err);
                    });
                }, 0);
            } else {
                showSuccess("変更はありませんでした");
            }
            return { success: true, idMapping };

        } catch (error) {
            showError(error instanceof Error ? error.message : "チーム対戦の保存に失敗しました");
            return { success: false };
        }
    };

    const handleSaveTeamMatches = async (data: TeamMatchSetupData[]) => {
        if (!selectedMatchGroupId) return;

        const selectedGroup = matchGroups.find(g => g.matchGroupId === selectedMatchGroupId);
        if (!selectedGroup) return;

        const teamA = teams.get(selectedGroup.teamAId);
        const teamB = teams.get(selectedGroup.teamBId);
        if (!teamA || !teamB) return;

        try {
            const currentIds = new Set(data.map(d => d.id).filter(id => !id.startsWith("match-")));

            const resolveRoundId = (row: TeamMatchSetupData) => row.roundId;

            // 削除
            const toDelete = teamMatches.filter(m => m.matchId && !currentIds.has(m.matchId));
            const deletePromises = toDelete.map(match => {
                if (match.matchId) return deleteTeamMatch.mutateAsync({ matchGroupId: selectedMatchGroupId, matchId: match.matchId });
                return Promise.resolve();
            });
            await Promise.all(deletePromises);

            // 作成・更新
            const savedMatchIds: string[] = [];
            const savePromises = data.map(async (item) => {
                const playerA = teamA.players.find(p => p.playerId === item.playerAId);
                const playerB = teamB.players.find(p => p.playerId === item.playerBId);

                if (!playerA || !playerB) return Promise.resolve(); // 無効なデータはスキップ

                const roundId = resolveRoundId(item);
                if (!roundId) {
                    throw new Error("ラウンドが選択されていません");
                }

                if (item.id.startsWith("match-")) {
                    // Create
                    const newMatch: TeamMatchCreate = {
                        matchGroupId: selectedMatchGroupId,
                        roundId,
                        sortOrder: item.sortOrder,
                        players: {
                            playerA: { ...playerA, teamId: teamA.teamId, score: 0, hansoku: 0 },
                            playerB: { ...playerB, teamId: teamB.teamId, score: 0, hansoku: 0 },
                        },
                        isCompleted: false,
                        winner: "none",
                        winReason: "none",
                    };
                    const created = await createTeamMatch.mutateAsync({ matchGroupId: selectedMatchGroupId, match: newMatch });
                    if (created.matchId) savedMatchIds.push(created.matchId);
                    return created;
                } else {
                    // 更新
                    const existingMatch = teamMatches.find(m => m.matchId === item.id);

                    if (existingMatch) {
                        const hasChanges =
                            existingMatch.roundId !== roundId ||
                            existingMatch.sortOrder !== item.sortOrder ||
                            existingMatch.players.playerA.playerId !== playerA.playerId ||
                            existingMatch.players.playerB.playerId !== playerB.playerId;

                        if (!hasChanges) {
                            return Promise.resolve(0);
                        }
                    }

                    // 更新時は既存の score / hansoku を保持する
                    const patch: Partial<TeamMatchCreate> = {
                        roundId,
                        sortOrder: item.sortOrder,
                        players: {
                            playerA: { ...playerA, teamId: teamA.teamId, score: existingMatch?.players.playerA.score ?? 0, hansoku: existingMatch?.players.playerA.hansoku ?? 0 },
                            playerB: { ...playerB, teamId: teamB.teamId, score: existingMatch?.players.playerB.score ?? 0, hansoku: existingMatch?.players.playerB.hansoku ?? 0 },
                        },
                    };
                    const updated = await updateTeamMatch.mutateAsync({ matchGroupId: selectedMatchGroupId, matchId: item.id, patch });
                    if (updated > 0) savedMatchIds.push(item.id);
                    return updated;
                }

            });
            await Promise.all(savePromises);

            const deletedIds = toDelete.map(m => m.matchId).filter((id): id is string => !!id);
            const allAffectedIds = [...savedMatchIds, ...deletedIds];

            if (allAffectedIds.length > 0) {
                showSuccess(`${allAffectedIds.length}件の変更を保存しました`);
                // バックグラウンド同期
                setTimeout(() => {
                    syncTeamMatchesToCloud(selectedMatchGroupId, allAffectedIds, { showSuccessToast: true }).catch(err => {
                        console.error("Background sync failed:", err);
                    });
                }, 0);
            } else {
                showSuccess("変更はありませんでした");
            }

        } catch (error) {
            showError(error instanceof Error ? error.message : "個人試合の保存に失敗しました");
        }
    };

    if (selectedMatchGroupId) {
        const selectedGroup = matchGroups.find(g => g.matchGroupId === selectedMatchGroupId);
        if (!selectedGroup) return <div>エラー: 対戦グループが見つかりません</div>;

        const teamA = teams.get(selectedGroup.teamAId);
        const teamB = teams.get(selectedGroup.teamBId);

        if (!teamA || !teamB) return <div>エラー: チームが見つかりません</div>;

        return (
            <div className="space-y-4">
                <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    チーム対戦一覧に戻る
                </Button>
                <TeamMatchSetupTable
                    key={teamMatches.map(m => m.matchId).join('-') + teamMatches.length}
                    teamA={teamA}
                    teamB={teamB}
                    matches={teamMatches}
                    onSave={handleSaveTeamMatches}
                    isSaving={createTeamMatch.isPending || updateTeamMatch.isPending || deleteTeamMatch.isPending}
                />
            </div>
        );
    }

    return (
        <MatchGroupSetupTable
            key={matchGroups.map(g => g.matchGroupId).join('-') + matchGroups.length}
            matchGroups={matchGroups}
            onSave={handleSaveMatchGroups}
            onSelect={handleSelect}
            isSaving={createMatchGroup.isPending || updateMatchGroup.isPending || deleteMatchGroup.isPending}
        />
    );
}