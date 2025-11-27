import { useState, useCallback } from "react";
import { useMonitorStore } from "@/store/use-monitor-store";
import { useSaveIndividualMatchResult, useSaveTeamMatchResult } from "@/queries/use-match-result";
import { useToast } from "@/components/providers/notification-provider";
import { determineWinner, Winner } from "@/domains/match/match-logic";
import type { TeamMatch } from "@/types/match.schema";
import type { Team } from "@/types/team.schema";
import { createPlayerDirectory, resolveMatchPlayer } from "@/lib/utils/player-directory";

interface UseMatchActionProps {
    orgId: string | null;
    activeTournamentId: string | null;
    activeTournamentType: string | null | undefined;
    needsRepMatch: boolean;
    handleNextMatch: () => void;
    handleCreateRepMatch: (playerAId: string, playerBId: string) => Promise<void>;
    teamMatches?: TeamMatch[];
    teams?: Team[];
}

export function useMatchAction({
    orgId,
    activeTournamentId,
    activeTournamentType,
    needsRepMatch,
    handleNextMatch,
    handleCreateRepMatch,
    teamMatches,
    teams,
}: UseMatchActionProps) {
    const { showError } = useToast();
    const saveIndividualMatchResultMutation = useSaveIndividualMatchResult();
    const saveTeamMatchResultMutation = useSaveTeamMatchResult();

    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showRepMatchDialog, setShowRepMatchDialog] = useState(false);

    const setMatchResult = useMonitorStore((s) => s.setMatchResult);
    const setViewMode = useMonitorStore((s) => s.setViewMode);
    const setGroupMatches = useMonitorStore((s) => s.setGroupMatches);

    const handleSave = useCallback(async () => {
        try {
            const store = useMonitorStore.getState();
            const matchId = store.matchId;
            if (!matchId) {
                throw new Error('Match ID is missing');
            }
            const snapshot = store.getMonitorSnapshot();
            const request = {
                matchId,
                organizationId: orgId || "",
                tournamentId: activeTournamentId || "",
                players: {
                    playerA: { score: snapshot.playerA.score, hansoku: snapshot.playerA.hansoku },
                    playerB: { score: snapshot.playerB.score, hansoku: snapshot.playerB.hansoku },
                },
            };

            // 大会種別に応じて保存先を切り替え
            if (activeTournamentType === "team") {
                await saveTeamMatchResultMutation.mutateAsync(request);
            } else if (activeTournamentType === "individual") {
                await saveIndividualMatchResultMutation.mutateAsync(request);
            } else {
                // 種別が不明な場合はフォールバック（両方試行）
                try {
                    await saveIndividualMatchResultMutation.mutateAsync(request);
                } catch {
                    await saveTeamMatchResultMutation.mutateAsync(request);
                }
            }
        } catch (err) {
            console.error(err);
            showError("試合結果の保存に失敗しました");
        }
    }, [orgId, activeTournamentId, activeTournamentType, saveTeamMatchResultMutation, saveIndividualMatchResultMutation, showError]);

    const handleConfirmMatchClick = useCallback(() => {
        setShowConfirmDialog(true);
    }, []);

    const handleConfirmMatchExecute = useCallback(async () => {
        setShowConfirmDialog(false);
        // 1. 保存
        await handleSave();

        // 2. 結果表示モードへ
        const snapshot = useMonitorStore.getState().getMonitorSnapshot();
        const winner: Winner = determineWinner(snapshot.playerA.score, snapshot.playerB.score, true);

        // 常に試合結果を表示する
        setMatchResult({
            playerA: snapshot.playerA,
            playerB: snapshot.playerB,
            winner,
        });

        // 団体戦の場合、グループ内の全試合を取得
        if (activeTournamentType === "team" && teamMatches && teams) {
            const store = useMonitorStore.getState();
            const currentMatchGroupId = store.matchGroupId;

            if (currentMatchGroupId) {
                const playerDirectory = createPlayerDirectory(teams);

                const groupMatches = teamMatches
                    .filter((m) => m.matchGroupId === currentMatchGroupId)
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((m) => {
                        const pA = resolveMatchPlayer(m.players.playerA, playerDirectory);
                        const pB = resolveMatchPlayer(m.players.playerB, playerDirectory);
                        let matchWinner: "playerA" | "playerB" | "draw" | "none" = "none";
                        if (m.isCompleted) {
                            if (pA.score > pB.score) matchWinner = "playerA";
                            else if (pB.score > pA.score) matchWinner = "playerB";
                            else matchWinner = "draw";
                        }
                        return {
                            matchId: m.matchId || "",
                            sortOrder: m.sortOrder,
                            roundId: m.roundId,
                            playerA: {
                                displayName: pA.displayName,
                                teamName: pA.teamName,
                                score: pA.score,
                                hansoku: pA.hansoku,
                            },
                            playerB: {
                                displayName: pB.displayName,
                                teamName: pB.teamName,
                                score: pB.score,
                                hansoku: pB.hansoku,
                            },
                            isCompleted: m.isCompleted,
                            winner: matchWinner,
                        };
                    });

                setGroupMatches(groupMatches);
            }
        }

        setViewMode("match_result");
    }, [handleSave, setMatchResult, setViewMode, setGroupMatches, activeTournamentType, teamMatches, teams]);

    const isSaving = saveIndividualMatchResultMutation.isPending || saveTeamMatchResultMutation.isPending;

    // 代表戦ダイアログのハンドラー
    const handleNextMatchClick = useCallback(() => {
        if (needsRepMatch) {
            // 代表戦が必要な場合はダイアログを表示
            setShowRepMatchDialog(true);
        } else {
            // 通常の次の試合へ
            handleNextMatch();
        }
    }, [needsRepMatch, handleNextMatch]);

    const handleRepMatchConfirm = useCallback((playerAId: string, playerBId: string) => {
        setShowRepMatchDialog(false);
        handleCreateRepMatch(playerAId, playerBId);
    }, [handleCreateRepMatch]);

    const handleRepMatchCancel = useCallback(() => {
        setShowRepMatchDialog(false);
    }, []);

    return {
        handleSave,
        handleConfirmMatchClick,
        handleConfirmMatchExecute,
        handleNextMatchClick,
        handleRepMatchConfirm,
        handleRepMatchCancel,
        showConfirmDialog,
        setShowConfirmDialog,
        showRepMatchDialog,
        setShowRepMatchDialog,
        isSaving,
    };
}
