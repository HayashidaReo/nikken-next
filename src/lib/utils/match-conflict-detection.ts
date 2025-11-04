import type { Match } from "@/types/match.schema";
import type { Team } from "@/types/team.schema";

/**
 * 試合設定画面で使用するデータ型
 */
export type MatchSetupData = {
    id: string;
    courtId: string;
    round: string;
    playerATeamId: string;
    playerAId: string;
    playerBTeamId: string;
    playerBId: string;
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
    };
    serverOnlyChanges: {
        courtId?: { initial: string; server: string };
        round?: { initial: string; server: string };
        playerA?: { initial: string; server: string };
        playerB?: { initial: string; server: string };
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
 * matchId -> フィールド名 -> { initial, server } のマップ
 */
export type DetectedChanges = Record<
    string,
    Record<string, { initial: string; server: string }>
>;

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
 * 2種類の競合を検出する：
 * 1. directConflicts: 両方が同じフィールドを異なる値に変更した場合
 * 2. serverOnlyChanges: 他端末のみが変更した場合（ユーザーは変更していない）
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
    rejectedChanges: Record<string, Record<string, string>> = {}
): ConflictDetails[] {
    const conflicts: ConflictDetails[] = [];

    draftData.forEach(draft => {
        // 新規作成（id が "match-" で始まる or 空）の場合はスキップ
        if (!draft.id || draft.id.startsWith("match-")) return;

        const initialMatch = initialState.find(m => m.matchId === draft.id);
        const serverMatch = serverData.find(m => m.matchId === draft.id);

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
        const userChangedRound = draft.round !== initialMatch.round;
        const serverChangedRound = serverMatch.round !== initialMatch.round;
        const isRoundRejected = rejectedForMatch.round === serverMatch.round;

        if (userChangedRound && serverChangedRound && draft.round !== serverMatch.round && !isRoundRejected) {
            directConflicts.round = { draft: draft.round, server: serverMatch.round };
            hasAnyConflict = true;
        } else if (!userChangedRound && serverChangedRound && !isRoundRejected) {
            serverOnlyChanges.round = { initial: initialMatch.round, server: serverMatch.round };
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
    detectedChanges: Record<string, Record<string, { initial: string; server: string }>>
): ConflictDetails[] {
    const conflicts: ConflictDetails[] = [];

    Object.entries(detectedChanges).forEach(([matchId, changes]) => {
        const serverOnlyChanges: ConflictDetails['serverOnlyChanges'] = {};

        Object.entries(changes).forEach(([fieldName, change]) => {
            if (fieldName === "courtId" || fieldName === "round" || fieldName === "playerA" || fieldName === "playerB") {
                serverOnlyChanges[fieldName] = change;
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
