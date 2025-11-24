import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { MatchGroupSetupTable } from "@/components/organisms/match-group-setup-table";
import { TeamMatchSetupTable } from "@/components/organisms/team-match-setup-table";
import { Button } from "@/components/atoms/button";
import { ArrowLeft } from "lucide-react";
import { useMatchGroups, useCreateMatchGroup, useUpdateMatchGroup, useDeleteMatchGroup } from "@/queries/use-match-groups";
import { useTeamMatches, useCreateTeamMatch, useUpdateTeamMatch, useDeleteTeamMatch } from "@/queries/use-team-matches";
import { useToast } from "@/components/providers/notification-provider";
import type { Tournament } from "@/types/tournament.schema";
import type { Team } from "@/types/team.schema";
import type { MatchGroupCreate, TeamMatchCreate } from "@/types/match.schema";
import type { MatchGroupSetupData, TeamMatchSetupData } from "@/types/match-setup";

interface MatchGroupSetupManagerProps {
    tournament: Tournament;
    teams: Team[];
}

export function MatchGroupSetupManager({ tournament, teams }: MatchGroupSetupManagerProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const selectedMatchGroupId = searchParams.get("matchGroupId");
    const { showSuccess, showError } = useToast();

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

    const handleSaveMatchGroups = async (data: MatchGroupSetupData[]) => {
        // 既存のIDセット
        const currentIds = new Set(data.map(d => d.id).filter(id => !id.startsWith("group-")));

        try {
            // 削除
            const toDelete = matchGroups.filter(g => g.matchGroupId && !currentIds.has(g.matchGroupId));
            for (const group of toDelete) {
                if (group.matchGroupId) await deleteMatchGroup.mutateAsync(group.matchGroupId);
            }

            // 作成・更新
            for (const item of data) {
                if (item.id.startsWith("group-")) {
                    // 作成
                    const newGroup: MatchGroupCreate = {
                        courtId: item.courtId,
                        round: item.round,
                        teamAId: item.teamAId,
                        teamBId: item.teamBId,
                        sortOrder: item.sortOrder,
                    };
                    await createMatchGroup.mutateAsync(newGroup);
                } else {
                    // 更新
                    const patch: Partial<MatchGroupCreate> = {
                        courtId: item.courtId,
                        round: item.round,
                        teamAId: item.teamAId,
                        teamBId: item.teamBId,
                        sortOrder: item.sortOrder,
                    };
                    await updateMatchGroup.mutateAsync({ matchGroupId: item.id, patch });
                }
            }
            showSuccess("チーム対戦を保存しました");
        } catch (error) {
            showError(error instanceof Error ? error.message : "チーム対戦の保存に失敗しました");
        }
    };

    const handleSaveTeamMatches = async (data: TeamMatchSetupData[]) => {
        if (!selectedMatchGroupId) return;

        const selectedGroup = matchGroups.find(g => g.matchGroupId === selectedMatchGroupId);
        if (!selectedGroup) return;

        const teamA = teams.find(t => t.teamId === selectedGroup.teamAId);
        const teamB = teams.find(t => t.teamId === selectedGroup.teamBId);
        if (!teamA || !teamB) return;

        try {
            const currentIds = new Set(data.map(d => d.id).filter(id => !id.startsWith("match-")));

            // 削除
            const toDelete = teamMatches.filter(m => m.matchId && !currentIds.has(m.matchId));
            for (const match of toDelete) {
                if (match.matchId) await deleteTeamMatch.mutateAsync({ matchGroupId: selectedMatchGroupId, matchId: match.matchId });
            }

            // 作成・更新
            for (const item of data) {
                const playerA = teamA.players.find(p => p.playerId === item.playerAId);
                const playerB = teamB.players.find(p => p.playerId === item.playerBId);

                if (!playerA || !playerB) continue; // 無効なデータはスキップ

                if (item.id.startsWith("match-")) {
                    // Create
                    const newMatch: TeamMatchCreate = {
                        matchGroupId: selectedMatchGroupId,
                        round: item.round,
                        sortOrder: item.sortOrder,
                        players: {
                            playerA: { ...playerA, teamId: teamA.teamId, teamName: teamA.teamName, score: 0, hansoku: 0 },
                            playerB: { ...playerB, teamId: teamB.teamId, teamName: teamB.teamName, score: 0, hansoku: 0 },
                        },
                        isCompleted: false,
                    };
                    await createTeamMatch.mutateAsync({ matchGroupId: selectedMatchGroupId, match: newMatch });
                } else {
                    // 更新
                    // 更新時は既存の score / hansoku を保持する
                    const existingMatch = teamMatches.find(m => m.matchId === item.id);
                    const patch: Partial<TeamMatchCreate> = {
                        round: item.round,
                        sortOrder: item.sortOrder,
                        players: {
                            playerA: { ...playerA, teamId: teamA.teamId, teamName: teamA.teamName, score: existingMatch?.players.playerA.score ?? 0, hansoku: existingMatch?.players.playerA.hansoku ?? 0 },
                            playerB: { ...playerB, teamId: teamB.teamId, teamName: teamB.teamName, score: existingMatch?.players.playerB.score ?? 0, hansoku: existingMatch?.players.playerB.hansoku ?? 0 },
                        },
                    };
                    await updateTeamMatch.mutateAsync({ matchGroupId: selectedMatchGroupId, matchId: item.id, patch });
                }
            }
            showSuccess("個人試合を保存しました");
        } catch (error) {
            showError(error instanceof Error ? error.message : "個人試合の保存に失敗しました");
        }
    };

    if (selectedMatchGroupId) {
        const selectedGroup = matchGroups.find(g => g.matchGroupId === selectedMatchGroupId);
        if (!selectedGroup) return <div>Error: Group not found</div>;

        const teamA = teams.find(t => t.teamId === selectedGroup.teamAId);
        const teamB = teams.find(t => t.teamId === selectedGroup.teamBId);

        if (!teamA || !teamB) return <div>Error: Teams not found</div>;

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
            teams={teams}
            courts={tournament.courts}
            matchGroups={matchGroups}
            onSave={handleSaveMatchGroups}
            onSelect={handleSelect}
            isSaving={createMatchGroup.isPending || updateMatchGroup.isPending || deleteMatchGroup.isPending}
        />
    );
}