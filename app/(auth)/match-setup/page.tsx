"use client";

import { useState, useEffect, useMemo } from "react";
import { MainLayout } from "@/components/templates/main-layout";
import { MatchSetupTable } from "@/components/organisms/match-setup-table";
import { Button } from "@/components/atoms/button";
import { useTeams } from "@/queries/use-teams";
import {
  useMatches,
  useMatchesRealtime,
  useCreateMatches,
  useUpdateMatch,
  useDeleteMatches
} from "@/queries/use-matches";
import { useTournament } from "@/queries/use-tournaments";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useToast } from "@/components/providers/notification-provider";
import { LoadingIndicator } from "@/components/molecules/loading-indicator";
import { InfoDisplay } from "@/components/molecules/info-display";
import { ConcurrentEditDialog } from "@/components/molecules/concurrent-edit-dialog";
import type { MatchCreate, Match } from "@/types/match.schema";
import {
  detectMatchConflicts,
  findPlayerInfo,
  convertDetectedChangesToConflicts,
  type MatchSetupData,
  type ConflictDetails,
  type DetectedChanges,
} from "@/lib/utils/match-conflict-detection";

export default function MatchSetupPage() {
  const { showSuccess, showError } = useToast();
  const { needsTournamentSelection, activeTournamentId, orgId, isLoading: authLoading } = useAuthContext();

  // データ取得
  const { data: teams = [], isLoading: teamsLoading, error: teamsError } = useTeams();
  const { data: matches = [], isLoading: matchesLoading, error: matchesError } = useMatches();
  const { data: tournament, isLoading: tournamentLoading, error: tournamentError } = useTournament(orgId, activeTournamentId);

  // リアルタイム購読（serverState） - 他端末の変更を常に監視
  const { data: realtimeMatches = [] } = useMatchesRealtime();

  // ページを開いた時点の初期状態を保持（競合検出の基準点）
  const [initialMatches, setInitialMatches] = useState<Match[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // realtimeMatches が最初に取得されたタイミングで初期状態を保存
  // （matches ではなく realtimeMatches を使うことで、より正確な初期状態を取得）
  useEffect(() => {
    if (realtimeMatches.length > 0 && !isInitialized) {
      setInitialMatches([...realtimeMatches]);
      setIsInitialized(true);
    }
  }, [realtimeMatches, isInitialized]);

  // 却下された変更を記憶（matchId -> フィールド名 -> 却下時のサーバー値）
  // 同じ値で再度通知されないようにするため
  const [rejectedChanges, setRejectedChanges] = useState<Record<string, Record<string, string>>>({});

  // リアルタイムで検出された他端末の変更（赤枠表示用）
  const [detectedChanges, setDetectedChanges] = useState<DetectedChanges>({});

  // 自分の保存直後は差分検出をスキップするためのフラグ
  const [justSaved, setJustSaved] = useState(false);

  // 保存後の initialMatches 更新ロジック
  // 自分の保存内容が「他端末の変更」として誤検知されないようにする
  useEffect(() => {
    if (!justSaved || realtimeMatches.length === 0) return;

    // realtimeMatches が更新されたら即座に initialMatches を同期
    // これにより、次回の差分検出では自分の変更が検出されない
    setInitialMatches([...realtimeMatches]);

    // フラグ解除は少し遅らせる（確実に同期が完了してから）
    const timer = setTimeout(() => {
      setJustSaved(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [justSaved, realtimeMatches]);

  // リアルタイム監視: 他端末の変更を検出して赤枠表示
  // initialMatches（基準点）と realtimeMatches（最新）を比較
  useEffect(() => {
    if (initialMatches.length === 0 || realtimeMatches.length === 0) return;
    if (justSaved) return;

    const changes: DetectedChanges = {};

    realtimeMatches.forEach(serverMatch => {
      const matchId = serverMatch.matchId;
      if (!matchId) return;

      const initialMatch = initialMatches.find(m => m.matchId === matchId);
      if (!initialMatch) return;

      const rejected = rejectedChanges[matchId] || {};
      const matchChanges: Record<string, { initial: string; server: string }> = {};

      // 各フィールドが変更されているかチェック（却下済みは除外）
      if (serverMatch.courtId !== initialMatch.courtId && rejected.courtId !== serverMatch.courtId) {
        matchChanges.courtId = { initial: initialMatch.courtId, server: serverMatch.courtId };
      }

      // round のチェック
      if (serverMatch.round !== initialMatch.round && rejected.round !== serverMatch.round) {
        matchChanges.round = { initial: initialMatch.round, server: serverMatch.round };
      }

      // 選手A のチェック
      const initialPlayerAId = initialMatch.players.playerA.playerId;
      const serverPlayerAId = serverMatch.players.playerA.playerId;
      if (serverPlayerAId !== initialPlayerAId && rejected.playerA !== serverPlayerAId) {
        matchChanges.playerA = {
          initial: initialMatch.players.playerA.displayName,
          server: serverMatch.players.playerA.displayName,
        };
      }

      // 選手B のチェック
      const initialPlayerBId = initialMatch.players.playerB.playerId;
      const serverPlayerBId = serverMatch.players.playerB.playerId;
      if (serverPlayerBId !== initialPlayerBId && rejected.playerB !== serverPlayerBId) {
        matchChanges.playerB = {
          initial: initialMatch.players.playerB.displayName,
          server: serverMatch.players.playerB.displayName,
        };
      }

      if (Object.keys(matchChanges).length > 0) {
        changes[matchId] = matchChanges;
      }
    });

    setDetectedChanges(changes);
  }, [initialMatches, realtimeMatches, rejectedChanges, justSaved]);

  const createMatchesMutation = useCreateMatches();
  const updateMatchMutation = useUpdateMatch();
  const deleteMatchesMutation = useDeleteMatches();

  // 競合ダイアログの状態
  const [conflictDialog, setConflictDialog] = useState<{
    open: boolean;
    conflicts: ConflictDetails[];
    pendingSaveData: MatchSetupData[] | null;
  }>({
    open: false,
    conflicts: [],
    pendingSaveData: null,
  });

  // 更新確認ダイアログの開閉状態
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

  const handleSave = async (matchSetupData: MatchSetupData[]) => {
    // 保存開始時点でフラグを立て、差分検出を一時停止
    setJustSaved(true);
    setDetectedChanges({});

    // 3点比較で競合を検出（初期状態 vs ユーザー編集 vs サーバー最新）
    const conflicts = detectMatchConflicts(
      matchSetupData,
      initialMatches,
      realtimeMatches,
      teams,
      rejectedChanges
    );

    if (conflicts.length > 0) {
      setConflictDialog({
        open: true,
        conflicts,
        pendingSaveData: matchSetupData,
      });
      return;
    }

    await executeSave(matchSetupData);
  };

  const executeSave = async (matchSetupData: MatchSetupData[]) => {
    try {
      const existingMatchIds = new Set(
        realtimeMatches.map(m => m.matchId).filter((id): id is string => Boolean(id))
      );
      const setupMatchIds = new Set(
        matchSetupData.map(d => d.id).filter(id => id && !id.startsWith("match-"))
      );

      // 削除対象の試合
      const matchesToDelete = Array.from(existingMatchIds).filter(id => !setupMatchIds.has(id));
      if (matchesToDelete.length > 0) {
        await deleteMatchesMutation.mutateAsync(matchesToDelete);
      }

      // 更新対象と新規作成対象に分類
      const matchesToUpdate: Array<{ matchId: string; data: MatchSetupData }> = [];
      const matchesToCreate: MatchSetupData[] = [];

      matchSetupData.forEach(setupData => {
        if (setupData.id && !setupData.id.startsWith("match-") && existingMatchIds.has(setupData.id)) {
          matchesToUpdate.push({ matchId: setupData.id, data: setupData });
        } else {
          matchesToCreate.push(setupData);
        }
      });

      // 既存試合を更新
      // 重要: score/hansoku は他端末で更新されている可能性があるため、
      // リアルタイムの最新値を使用する（Transaction で自動マージ）
      for (const { matchId, data: setupData } of matchesToUpdate) {
        const latestMatch = realtimeMatches.find(m => m.matchId === matchId);
        if (!latestMatch) continue;
        const playerA = findPlayerInfo(setupData.playerATeamId, setupData.playerAId, teams);
        const playerB = findPlayerInfo(setupData.playerBTeamId, setupData.playerBId, teams);

        if (!playerA) {
          throw new Error(`選手A (${setupData.playerAId}) の情報が見つかりません`);
        }
        if (!playerB) {
          throw new Error(`選手B (${setupData.playerBId}) の情報が見つかりません`);
        }

        // Transaction ベースの更新で、最新の score/hansoku を保持
        await updateMatchMutation.mutateAsync({
          matchId,
          patch: {
            courtId: setupData.courtId,
            round: setupData.round,
            players: {
              playerA: {
                displayName: playerA.displayName,
                playerId: playerA.playerId,
                teamId: playerA.teamId,
                teamName: playerA.teamName,
                score: latestMatch.players.playerA.score,
                hansoku: latestMatch.players.playerA.hansoku,
              },
              playerB: {
                displayName: playerB.displayName,
                playerId: playerB.playerId,
                teamId: playerB.teamId,
                teamName: playerB.teamName,
                score: latestMatch.players.playerB.score,
                hansoku: latestMatch.players.playerB.hansoku,
              },
            },
          },
        });
      }

      // 新規試合を作成
      if (matchesToCreate.length > 0) {
        const newMatches: MatchCreate[] = matchesToCreate.map(setupData => {
          const playerA = findPlayerInfo(setupData.playerATeamId, setupData.playerAId, teams);
          const playerB = findPlayerInfo(setupData.playerBTeamId, setupData.playerBId, teams);

          if (!playerA) {
            throw new Error(`選手A (${setupData.playerAId}) の情報が見つかりません`);
          }
          if (!playerB) {
            throw new Error(`選手B (${setupData.playerBId}) の情報が見つかりません`);
          }

          return {
            courtId: setupData.courtId,
            round: setupData.round,
            players: {
              playerA: {
                displayName: playerA.displayName,
                playerId: playerA.playerId,
                teamId: playerA.teamId,
                teamName: playerA.teamName,
                score: 0,
                hansoku: 0,
              },
              playerB: {
                displayName: playerB.displayName,
                playerId: playerB.playerId,
                teamId: playerB.teamId,
                teamName: playerB.teamName,
                score: 0,
                hansoku: 0,
              },
            },
          };
        });

        await createMatchesMutation.mutateAsync(newMatches);
      }

      const totalCount = matchesToUpdate.length + matchesToCreate.length;
      showSuccess(`${totalCount}件の試合を設定しました`);

      setConflictDialog({ open: false, conflicts: [], pendingSaveData: null });
    } catch (error) {
      console.error("試合設定の保存に失敗:", error);
      showError(
        error instanceof Error
          ? `保存に失敗しました: ${error.message}`
          : "試合設定の保存に失敗しました"
      );
    }
  };

  const handleConflictConfirm = async () => {
    if (!conflictDialog.pendingSaveData) return;
    await executeSave(conflictDialog.pendingSaveData);
  };

  const handleConflictCancel = () => {
    setJustSaved(false);
    setConflictDialog({ open: false, conflicts: [], pendingSaveData: null });
  };
  const handleUpdateClick = () => {
    setUpdateDialogOpen(true);
  };

  const handleFieldMerge = () => {
    // 他端末の変更を受け入れる
    // initialMatches を更新することで、テーブルの表示も自動的に更新される
    setInitialMatches(prev => {
      return prev.map(match => {
        const matchId = match.matchId;
        if (!matchId) return match;

        const changes = detectedChanges[matchId];
        if (!changes) return match;

        const serverMatch = realtimeMatches.find(m => m.matchId === matchId);
        if (!serverMatch) return match;

        let updatedMatch = { ...match };

        // 変更されたフィールドをサーバーの値で上書き
        if (changes.courtId) {
          updatedMatch.courtId = serverMatch.courtId;
        }
        if (changes.round) {
          updatedMatch.round = serverMatch.round;
        }
        if (changes.playerA) {
          updatedMatch = {
            ...updatedMatch,
            players: {
              ...updatedMatch.players,
              playerA: serverMatch.players.playerA,
            },
          };
        }
        if (changes.playerB) {
          updatedMatch = {
            ...updatedMatch,
            players: {
              ...updatedMatch.players,
              playerB: serverMatch.players.playerB,
            },
          };
        }

        return updatedMatch;
      });
    });

    setDetectedChanges({});
    setUpdateDialogOpen(false);
  };

  const handleFieldReject = () => {
    // 他端末の変更を却下する
    // rejectedChanges に記録することで、同じ値での再通知を防ぐ
    const newRejectedChanges: Record<string, Record<string, string>> = { ...rejectedChanges };

    Object.entries(detectedChanges).forEach(([matchId, changes]) => {
      if (!newRejectedChanges[matchId]) {
        newRejectedChanges[matchId] = {};
      }

      Object.entries(changes).forEach(([fieldName, change]) => {
        newRejectedChanges[matchId][fieldName] = change.server;
      });
    });

    setRejectedChanges(newRejectedChanges);

    setDetectedChanges({});
    setUpdateDialogOpen(false);
  };

  const isLoading = authLoading || teamsLoading || matchesLoading || tournamentLoading;
  const isSaving = createMatchesMutation.isPending || updateMatchMutation.isPending || deleteMatchesMutation.isPending;
  const hasError = teamsError || matchesError || tournamentError;

  // 差分があるかチェック
  const hasDetectedChanges = Object.keys(detectedChanges).length > 0;

  // マージ済みの matches を作成（initialMatches をベースに）
  const mergedMatches = useMemo(() => {
    // 初回ロード時は matches を使用
    if (initialMatches.length === 0) return matches;

    // initialMatches が設定されている場合は、それが最新のマージ済み状態
    // （保存後やマージ後に更新される）
    return initialMatches;
  }, [initialMatches, matches]);

  // detectedChanges を conflicts 形式に変換（更新ダイアログ用）
  const updateConflicts = useMemo(
    () => convertDetectedChangesToConflicts(detectedChanges),
    [detectedChanges]
  );

  // 大会が選択されていない場合
  if (needsTournamentSelection) {
    return (
      <MainLayout activeTab="match-setup">
        <InfoDisplay
          variant="warning"
          title="大会が選択されていません"
          message="ヘッダーの大会ドロップダウンから操作したい大会を選択してください。"
        />
      </MainLayout>
    );
  }

  if (isLoading) {
    return (
      <MainLayout activeTab="match-setup">
        <LoadingIndicator message="データを読み込み中..." size="lg" />
      </MainLayout>
    );
  }

  if (hasError) {
    return (
      <MainLayout activeTab="match-setup">
        <InfoDisplay
          variant="destructive"
          title="データの取得に失敗しました"
          message={hasError instanceof Error ? hasError.message : "データの取得に失敗しました"}
        />
      </MainLayout>
    );
  }

  // 大会情報が取得できない場合
  if (!tournament) {
    return (
      <MainLayout activeTab="match-setup">
        <InfoDisplay
          variant="warning"
          title="大会情報が見つかりません"
          message="大会情報が見つかりません。管理者に問い合わせるか、大会を作成してください。"
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout activeTab="match-setup">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            試合の組み合わせ設定
          </h1>
          {hasDetectedChanges && (
            <Button
              onClick={handleUpdateClick}
              variant="outline"
              className="bg-red-50 border-red-300 text-red-700 hover:bg-red-100"
            >
              他端末で変更あり - 確認する
            </Button>
          )}
        </div>

        <MatchSetupTable
          teams={teams}
          courts={tournament.courts}
          matches={mergedMatches}
          onSave={handleSave}
          isSaving={isSaving}
          detectedChanges={detectedChanges}
        />

        {/* 競合確認ダイアログ（保存時） */}
        <ConcurrentEditDialog
          open={conflictDialog.open}
          conflicts={conflictDialog.conflicts}
          onConfirm={handleConflictConfirm}
          onCancel={handleConflictCancel}
        />

        {/* 更新確認ダイアログ（更新ボタンクリック時） */}
        <ConcurrentEditDialog
          open={updateDialogOpen}
          conflicts={updateConflicts}
          onConfirm={handleFieldMerge}
          onCancel={handleFieldReject}
          mode="field"
        />
      </div>
    </MainLayout>
  );
}
