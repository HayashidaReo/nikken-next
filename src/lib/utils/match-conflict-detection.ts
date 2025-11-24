import type { Match } from "@/types/match.schema";
import type { Team } from "@/types/team.schema";
import type { Round } from "@/types/tournament.schema";

/**
 * 試合設定画面で使用するデータ型
 */
export type MatchSetupData = {
    id: string;
    courtId: string;
    roundId: string;
    roundName: string;
    playerATeamId: string;
    playerAId: string;
    playerBTeamId: string;
    playerBId: string;
    sortOrder: number;
};

/**
 * 競合の詳細情報
 */
export type ConflictDetails = {
    matchId: string;
    directConflicts: {
        courtId?: { draft: string; server: string };
        round?: { draft: string; server: string };
        playerA?: { draft: string; server: string };
        playerB?: { draft: string; server: string };
        sortOrder?: { draft: number; server: number };
    };
    serverOnlyChanges: {
        courtId?: { initial: string; server: string };
        round?: { initial: string; server: string };
        playerA?: { initial: string; server: string };
        playerB?: { initial: string; server: string };
        sortOrder?: { initial: number; server: number };
    };
};

/**
 * 選手情報の検索結果
 */
export type PlayerInfo = {
    displayName: string;
    playerId: string;
    teamId: string;
    teamName: string;
};

/**
 * リアルタイム監視で検出された変更の型
 */
export type DetectedChanges = {
    /** 既存試合のフィールド変更: matchId -> フィールド名 -> { initial, server } */
    fieldChanges: Record<string, Record<string, { initial: string; server: string }>>;
    /** 他端末で追加された試合 */
    addedMatches: Match[];
    /** 他端末で削除された試合 */
    deletedMatches: Match[];
};

/**
 * チームデータから選手情報を検索する
 * 
 * @param teamId - チームID
 * @param playerId - 選手ID
 * @param teams - チームデータの配列
 * @returns 選手情報、見つからない場合は null
 */
export function findPlayerInfo(
    teamId: string,
    playerId: string,
    teams: Team[]
): PlayerInfo | null {
    const team = teams.find(t => t.teamId === teamId);
    if (!team) return null;

    const player = team.players.find(p => p.playerId === playerId);
    if (!player) return null;

    return {
        displayName: player.displayName,
        playerId: player.playerId,
        teamId: team.teamId,
        teamName: team.teamName,
    };
}

/**
 * 試合データの競合を検出する
 * 
 * 3点比較（初期状態、ユーザーの編集、サーバーの最新状態）を行い、
 * 以下を検出する：
 * 1. directConflicts: 両方が同じフィールドを異なる値に変更した場合
 * 2. serverOnlyChanges: 他端末のみが変更した場合（ユーザーは変更していない）
 * 3. serverDeletedMatches: 他端末で削除された試合（ユーザーは編集している）
 * 
 * @param draftData - ユーザーが編集した試合データ
 * @param initialState - ページを開いた時点の初期状態
 * @param serverData - サーバーの最新状態（リアルタイム購読）
 * @param teams - チームデータ（選手名の取得に使用）
 * @param rejectedChanges - 却下済みの変更（matchId -> フィールド名 -> サーバー値）
 * @returns 検出された競合の配列
 */
export function detectMatchConflicts(
    draftData: MatchSetupData[],
    initialState: Match[],
    serverData: Match[],
    teams: Team[],
    rounds: Round[],
    rejectedChanges: Record<string, Record<string, string>> = {}
): ConflictDetails[] {
    const conflicts: ConflictDetails[] = [];
    const roundIdToName = new Map(rounds.map(round => [round.roundId, round.roundName]));
    const resolveRoundName = (roundId?: string, fallback?: string) =>
        (roundId ? roundIdToName.get(roundId) || roundId : fallback || "");

    draftData.forEach(draft => {
        // 新規作成（id が "match-" で始まる or 空）の場合はスキップ
        if (!draft.id || draft.id.startsWith("match-")) return;

        const initialMatch = initialState.find(m => m.matchId === draft.id);
        const serverMatch = serverData.find(m => m.matchId === draft.id);

        // サーバー側で削除されている場合の競合検出
        if (initialMatch && !serverMatch) {
            // 却下済みの削除はスキップ
            const rejected = rejectedChanges[draft.id] || {};
            if (rejected._deleted) {
                return;
            }

            // ユーザーがこの試合を編集しようとしているが、他端末で削除された
            conflicts.push({
                matchId: draft.id,
                directConflicts: {
                    // 削除競合を特殊なケースとして表現
                    courtId: { draft: draft.courtId, server: "[削除済み]" },
                },
                serverOnlyChanges: {},
            });
            return;
        }

        // 初期状態かサーバーデータがない場合はスキップ
        if (!initialMatch || !serverMatch) return;

        const directConflicts: ConflictDetails['directConflicts'] = {};
        const serverOnlyChanges: ConflictDetails['serverOnlyChanges'] = {};
        let hasAnyConflict = false;

        // この試合の却下済み変更を取得
        const rejectedForMatch = rejectedChanges[draft.id] || {};

        // === courtId のチェック ===
        const userChangedCourtId = draft.courtId !== initialMatch.courtId;
        const serverChangedCourtId = serverMatch.courtId !== initialMatch.courtId;
        const isCourtIdRejected = rejectedForMatch.courtId === serverMatch.courtId;

        if (userChangedCourtId && serverChangedCourtId && draft.courtId !== serverMatch.courtId && !isCourtIdRejected) {
            // 直接競合: 両方が異なる値に変更（却下済みでない場合のみ）
            directConflicts.courtId = { draft: draft.courtId, server: serverMatch.courtId };
            hasAnyConflict = true;
        } else if (!userChangedCourtId && serverChangedCourtId && !isCourtIdRejected) {
            // 間接競合: 他端末のみが変更（却下済みでない場合のみ）
            serverOnlyChanges.courtId = { initial: initialMatch.courtId, server: serverMatch.courtId };
            hasAnyConflict = true;
        }

        // === round のチェック ===
        const userChangedRound = draft.roundId !== initialMatch.roundId;
        const serverChangedRound = serverMatch.roundId !== initialMatch.roundId;
        const isRoundRejected =
            rejectedForMatch.round === serverMatch.roundId ||
            rejectedForMatch.round === resolveRoundName(serverMatch.roundId);

        if (userChangedRound && serverChangedRound && draft.roundId !== serverMatch.roundId && !isRoundRejected) {
            directConflicts.round = {
                draft: draft.roundName,
                server: resolveRoundName(serverMatch.roundId),
            };
            hasAnyConflict = true;
        } else if (!userChangedRound && serverChangedRound && !isRoundRejected) {
            serverOnlyChanges.round = {
                initial: resolveRoundName(initialMatch.roundId, draft.roundName),
                server: resolveRoundName(serverMatch.roundId),
            };
            hasAnyConflict = true;
        }

        // === 選手A のチェック ===
        const userChangedPlayerA = draft.playerAId !== initialMatch.players.playerA.playerId;
        const serverChangedPlayerA = serverMatch.players.playerA.playerId !== initialMatch.players.playerA.playerId;
        const isPlayerARejected = rejectedForMatch.playerA === serverMatch.players.playerA.playerId;

        if (userChangedPlayerA && serverChangedPlayerA && draft.playerAId !== serverMatch.players.playerA.playerId && !isPlayerARejected) {
            const draftPlayerAName = findPlayerInfo(draft.playerATeamId, draft.playerAId, teams)?.displayName || "";
            const serverPlayerAName = serverMatch.players.playerA.displayName;
            directConflicts.playerA = { draft: draftPlayerAName, server: serverPlayerAName };
            hasAnyConflict = true;
        } else if (!userChangedPlayerA && serverChangedPlayerA && !isPlayerARejected) {
            const initialPlayerAName = initialMatch.players.playerA.displayName;
            const serverPlayerAName = serverMatch.players.playerA.displayName;
            serverOnlyChanges.playerA = { initial: initialPlayerAName, server: serverPlayerAName };
            hasAnyConflict = true;
        }

        // === 選手B のチェック ===
        const userChangedPlayerB = draft.playerBId !== initialMatch.players.playerB.playerId;
        const serverChangedPlayerB = serverMatch.players.playerB.playerId !== initialMatch.players.playerB.playerId;
        const isPlayerBRejected = rejectedForMatch.playerB === serverMatch.players.playerB.playerId;

        if (userChangedPlayerB && serverChangedPlayerB && draft.playerBId !== serverMatch.players.playerB.playerId && !isPlayerBRejected) {
            const draftPlayerBName = findPlayerInfo(draft.playerBTeamId, draft.playerBId, teams)?.displayName || "";
            const serverPlayerBName = serverMatch.players.playerB.displayName;
            directConflicts.playerB = { draft: draftPlayerBName, server: serverPlayerBName };
            hasAnyConflict = true;
        } else if (!userChangedPlayerB && serverChangedPlayerB && !isPlayerBRejected) {
            const initialPlayerBName = initialMatch.players.playerB.displayName;
            const serverPlayerBName = serverMatch.players.playerB.displayName;
            serverOnlyChanges.playerB = { initial: initialPlayerBName, server: serverPlayerBName };
            hasAnyConflict = true;
        }

        // === sortOrder のチェック ===
        const userChangedSortOrder = draft.sortOrder !== initialMatch.sortOrder;
        const serverChangedSortOrder = serverMatch.sortOrder !== initialMatch.sortOrder;
        const isSortOrderRejected = rejectedForMatch.sortOrder === String(serverMatch.sortOrder);

        if (userChangedSortOrder && serverChangedSortOrder && draft.sortOrder !== serverMatch.sortOrder && !isSortOrderRejected) {
            // 直接競合: 両方が異なる値に変更（却下済みでない場合のみ）
            directConflicts.sortOrder = { draft: draft.sortOrder, server: serverMatch.sortOrder };
            hasAnyConflict = true;
        } else if (!userChangedSortOrder && serverChangedSortOrder && !isSortOrderRejected) {
            // 間接競合: 他端末のみが変更（却下済みでない場合のみ）
            serverOnlyChanges.sortOrder = { initial: initialMatch.sortOrder, server: serverMatch.sortOrder };
            hasAnyConflict = true;
        }

        // score/hansoku は競合として扱わない（自動マージ）

        if (hasAnyConflict) {
            conflicts.push({
                matchId: draft.id,
                directConflicts,
                serverOnlyChanges,
            });
        }
    });

    return conflicts;
}

/**
 * detectedChanges を ConflictDetails 形式に変換する
 * 
 * @param detectedChanges - リアルタイム監視で検出された変更
 * @returns ConflictDetails の配列
 */
export function convertDetectedChangesToConflicts(
    detectedChanges: DetectedChanges
): ConflictDetails[] {
    const conflicts: ConflictDetails[] = [];

    // フィールド変更を変換
    Object.entries(detectedChanges.fieldChanges).forEach(([matchId, changes]) => {
        const serverOnlyChanges: ConflictDetails['serverOnlyChanges'] = {};

        Object.entries(changes).forEach(([fieldName, change]) => {
            if (fieldName === "courtId" || fieldName === "round" || fieldName === "playerA" || fieldName === "playerB") {
                serverOnlyChanges[fieldName] = change;
            } else if (fieldName === "sortOrder") {
                // sortOrderは数値型なので型変換
                serverOnlyChanges.sortOrder = {
                    initial: Number(change.initial),
                    server: Number(change.server)
                };
            }
        });

        if (Object.keys(serverOnlyChanges).length > 0) {
            conflicts.push({
                matchId,
                directConflicts: {},
                serverOnlyChanges,
            });
        }
    });

    return conflicts;
}
