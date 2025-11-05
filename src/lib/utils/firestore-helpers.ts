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
 */

/**
 * MatchDocs を Query ドキュメントスナップショットのリストから
 * ドメインエンティティの Match[] に変換
 *
 * @param docs - Firestore のクエリドキュメントスナップショット配列
 * @returns ドメインエンティティ Match[]
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
 * 用途: listByPlayerId, listByTeamId など、複数条件クエリの結果集約
 *
 * @param querySnapshots - Firestore QuerySnapshot 配列
 * @returns 重複排除・ソート済みの Match[]
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
 * @param docs - Firestore のクエリドキュメントスナップショット配列
 * @returns ドメインエンティティ Team[]
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
 * @param docs - Firestore のクエリドキュメントスナップショット配列
 * @returns ドメインエンティティ Tournament[]
 */
export function tournamentDocsToTournaments(
    docs: QueryDocumentSnapshot<DocumentData>[]
): Tournament[] {
    return docs.map((snap) => {
        const data = snap.data() as FirestoreTournamentDoc;
        return TournamentMapper.toDomain({ ...data, id: snap.id });
    });
}
