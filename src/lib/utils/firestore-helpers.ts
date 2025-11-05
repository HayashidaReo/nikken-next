import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import type { Match } from "@/types/match.schema";
import type { Team } from "@/types/team.schema";
import type { Tournament } from "@/types/tournament.schema";
import { MatchMapper, type FirestoreMatchDoc } from "@/data/mappers/match-mapper";
import { TeamMapper, type FirestoreTeamDoc } from "@/data/mappers/team-mapper";
import { TournamentMapper, type FirestoreTournamentDoc } from "@/data/mappers/tournament-mapper";

/**
 * Firestore ユーティリティ関数群
 * QuerySnapshot → ドメインエンティティ変換、重複排除、ソート等の共通処理を提供
 *
 * このモジュールの目的：
 * - Repository の map 処理を統一（コード重複排除）
 * - Mapper 呼び出しの一元化（バグ修正時の対応範囲を限定）
 * - 型安全性の確保（QueryDocumentSnapshot の扱いを正規化）
 *
 * @example
 * // Team一覧取得時の使用例
 * const q = query(teamsCollection, orderBy("createdAt", "desc"));
 * const snaps = await getDocs(q);
 * const teams = teamDocsToTeams(snaps.docs);  // この関数を使う
 *
 * @example
 * // 複数クエリ結果の集約＋重複排除
 * const [playerAQuery, playerBQuery] = await Promise.all([...]);
 * const matches = aggregateAndDedupMatches([playerAQuery, playerBQuery]);
 */

/**
 * MatchDocs を Query ドキュメントスナップショットのリストから
 * ドメインエンティティの Match[] に変換
 *
 * 内部で MatchMapper.toDomain() を呼び出す際の共通処理を担当
 *
 * @param docs - Firestore のクエリドキュメントスナップショット配列
 * @returns ドメインエンティティ Match[]（Mapper でバリデーション済み）
 *
 * @throws Mapper でバリデーション失敗時に Error をスロー（例：ID 不在）
 *
 * @example
 * const q = query(collectionRef, orderBy("createdAt", "asc"));
 * const snaps = await getDocs(q);
 * const matches = matchDocsToMatches(snaps.docs);
 */
export function matchDocsToMatches(
    docs: QueryDocumentSnapshot<DocumentData>[]
): Match[] {
    return docs.map((snap) => {
        const data = snap.data() as FirestoreMatchDoc;
        return MatchMapper.toDomain({ ...data, id: snap.id });
    });
}

/**
 * 複数のクエリ結果（QuerySnapshot 配列）を集約し、
 * 重複排除＋ソート（createdAt 昇順）して Match[] を返す
 *
 * **用途**: listByPlayerId, listByTeamId など、複数条件（OR）クエリの結果を
 * 1つの配列に統合する場合に使用
 *
 * **処理フロー**:
 * 1. 各クエリ結果を matchDocsToMatches() で変換
 * 2. すべての結果を1つの配列に集約
 * 3. matchId でユニーク化（同じ試合が複数クエリに含まれる場合に対応）
 * 4. createdAt でソート（昇順）
 *
 * **パフォーマンス**:
 * - 重複排除は O(n²) の filter を使用（データ量 < 1000件想定）
 * - 大規模データの場合は Set / Map による最適化を検討
 *
 * @param querySnapshots - Firestore QuerySnapshot 配列（複数のクエリ結果）
 * @returns 重複排除・ソート済みの Match[]
 *
 * @example
 * // PlayerA または PlayerB に含まれる選手の試合を検索
 * const [playerAQuery, playerBQuery] = await Promise.all([
 *   getDocs(query(collectionRef, where("players.playerA.playerId", "==", playerId))),
 *   getDocs(query(collectionRef, where("players.playerB.playerId", "==", playerId))),
 * ]);
 * const matches = aggregateAndDedupMatches([playerAQuery, playerBQuery]);
 */
export function aggregateAndDedupMatches(
    querySnapshots: Array<{ docs: QueryDocumentSnapshot<DocumentData>[] }>
): Match[] {
    const allMatches: Match[] = [];

    // すべてのクエリ結果を集約
    querySnapshots.forEach((snapshot) => {
        const matches = matchDocsToMatches(snapshot.docs);
        allMatches.push(...matches);
    });

    // matchId でユニーク化（重複排除）
    const uniqueMatches = allMatches.filter(
        (match, index, self) =>
            index === self.findIndex((m) => m.matchId === match.matchId)
    );

    // createdAt でソート（昇順）
    return uniqueMatches.sort((a, b) =>
        (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0)
    );
}

/**
 * TeamDocs を Query ドキュメントスナップショットのリストから
 * ドメインエンティティの Team[] に変換
 *
 * 内部で TeamMapper.toDomain() を呼び出す際の共通処理を担当
 *
 * @param docs - Firestore のクエリドキュメントスナップショット配列
 * @returns ドメインエンティティ Team[]（Mapper でバリデーション済み）
 *
 * @throws Mapper でバリデーション失敗時に Error をスロー（例：ID 不在）
 *
 * @example
 * const q = query(teamsCollection, orderBy("createdAt", "desc"));
 * const snaps = await getDocs(q);
 * const teams = teamDocsToTeams(snaps.docs);
 */
export function teamDocsToTeams(
    docs: QueryDocumentSnapshot<DocumentData>[]
): Team[] {
    return docs.map((snap) => {
        const data = snap.data() as FirestoreTeamDoc;
        return TeamMapper.toDomain({ ...data, id: snap.id });
    });
}

/**
 * TournamentDocs を Query ドキュメントスナップショットのリストから
 * ドメインエンティティの Tournament[] に変換
 *
 * 内部で TournamentMapper.toDomain() を呼び出す際の共通処理を担当
 *
 * @param docs - Firestore のクエリドキュメントスナップショット配列
 * @returns ドメインエンティティ Tournament[]（Mapper でバリデーション済み）
 *
 * @throws Mapper でバリデーション失敗時に Error をスロー（例：ID 不在）
 *
 * @example
 * const q = query(tournamentsCollection, orderBy("createdAt", "desc"));
 * const snaps = await getDocs(q);
 * const tournaments = tournamentDocsToTournaments(snaps.docs);
 */
export function tournamentDocsToTournaments(
    docs: QueryDocumentSnapshot<DocumentData>[]
): Tournament[] {
    return docs.map((snap) => {
        const data = snap.data() as FirestoreTournamentDoc;
        return TournamentMapper.toDomain({ ...data, id: snap.id });
    });
}
