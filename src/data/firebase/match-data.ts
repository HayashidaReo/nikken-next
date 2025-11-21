import {
    setDoc,
    updateDoc,
    deleteDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    onSnapshot,
    Unsubscribe,
    QueryConstraint,
    doc,
    serverTimestamp,
} from "firebase/firestore";
import { clientCollections, clientDocs } from "./collections";
import { MatchMapper, type FirestoreMatchDoc } from "../mappers/match-mapper";
import type { Match } from "@/types/match.schema";

/**
 * Match データアクセスクラス
 * Firestoreとの直接通信を担当
 */
export class MatchData {
    constructor(
        private readonly orgId: string,
        private readonly tournamentId: string
    ) { }

    /**
     * 新しい試合を作成
     */
    async createMatch(match: Partial<Match>): Promise<string> {
        const matchesCollection = clientCollections.matches(
            this.orgId,
            this.tournamentId
        );

        // ドキュメントIDを生成
        const matchDocRef = doc(matchesCollection);
        const matchId = matchDocRef.id;

        // ドキュメントIDをフィールドに含めて保存
        const firestoreData = MatchMapper.toFirestoreForCreate({
            ...match,
            id: matchId,
        });

        // Firestoreに保存（作成日時・更新日時はサーバーで自動設定）
        await setDoc(matchDocRef, {
            ...firestoreData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return matchId;
    }

    /**
     * 複数の試合を一括作成
     */
    async createMatches(matches: Partial<Match>[]): Promise<string[]> {
        const matchesCollection = clientCollections.matches(
            this.orgId,
            this.tournamentId
        );

        const matchIds: string[] = [];
        const batchPromises: Promise<void>[] = [];

        for (const match of matches) {
            // ドキュメントIDを生成
            const matchDocRef = doc(matchesCollection);
            const matchId = matchDocRef.id;
            matchIds.push(matchId);

            // ドキュメントIDをフィールドに含めて保存
            const firestoreData = MatchMapper.toFirestoreForCreate({
                ...match,
                id: matchId,
            });

            const promise = setDoc(matchDocRef, {
                ...firestoreData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            batchPromises.push(promise);
        }

        // 全ての作成処理を並列実行
        await Promise.all(batchPromises);
        return matchIds;
    }

    /**
     * 試合を更新
     */
    async updateMatch(matchId: string, updates: Partial<Match>): Promise<void> {
        const matchDocRef = clientDocs.match(this.orgId, this.tournamentId, matchId);

        const firestoreUpdates = MatchMapper.toFirestoreForUpdate(updates);

        await updateDoc(matchDocRef, {
            ...firestoreUpdates,
            updatedAt: serverTimestamp(),
        });
    }

    /**
     * 試合を削除
     */
    async deleteMatch(matchId: string): Promise<void> {
        const matchDocRef = clientDocs.match(this.orgId, this.tournamentId, matchId);
        await deleteDoc(matchDocRef);
    }

    /**
     * 複数の試合を一括削除
     */
    async deleteMatches(matchIds: string[]): Promise<void> {
        const deletePromises = matchIds.map((matchId) => this.deleteMatch(matchId));
        await Promise.all(deletePromises);
    }

    /**
     * 特定の試合を取得
     */
    async getMatch(matchId: string): Promise<Match | null> {
        const matchDocRef = clientDocs.match(this.orgId, this.tournamentId, matchId);
        const matchSnap = await getDoc(matchDocRef);

        if (!matchSnap.exists()) {
            return null;
        }

        const data = matchSnap.data() as FirestoreMatchDoc;
        return MatchMapper.toDomain({ ...data, id: matchSnap.id });
    }

    /**
     * 全ての試合を取得
     */
    async getAllMatches(): Promise<Match[]> {
        const matchesCollection = clientCollections.matches(
            this.orgId,
            this.tournamentId
        );

        const querySnap = await getDocs(
            query(matchesCollection, orderBy("createdAt", "asc"))
        );

        const matches: Match[] = [];
        querySnap.forEach((doc) => {
            const data = doc.data() as FirestoreMatchDoc;
            const match = MatchMapper.toDomain({ ...data, id: doc.id });
            matches.push(match);
        });

        return matches;
    }

    /**
     * 条件に基づいて試合を検索
     */
    async queryMatches(constraints: QueryConstraint[]): Promise<Match[]> {
        const matchesCollection = clientCollections.matches(
            this.orgId,
            this.tournamentId
        );

        const q = query(matchesCollection, ...constraints);
        const querySnap = await getDocs(q);

        const matches: Match[] = [];
        querySnap.forEach((doc) => {
            const data = doc.data() as FirestoreMatchDoc;
            const match = MatchMapper.toDomain({ ...data, id: doc.id });
            matches.push(match);
        });

        return matches;
    }

    /**
     * 特定のコートの試合を取得
     */
    async getMatchesByCourtId(courtId: string): Promise<Match[]> {
        return this.queryMatches([
            where("courtId", "==", courtId),
            orderBy("createdAt", "asc"),
        ]);
    }

    /**
     * 特定のラウンドの試合を取得
     */
    async getMatchesByRound(round: string): Promise<Match[]> {
        return this.queryMatches([
            where("round", "==", round),
            orderBy("createdAt", "asc"),
        ]);
    }

    /**
     * 特定の選手が関わる試合を取得
     */
    async getMatchesByPlayerId(playerId: string): Promise<Match[]> {
        // PlayerAまたはPlayerBのどちらかに該当する選手を検索
        const [playerAMatches, playerBMatches] = await Promise.all([
            this.queryMatches([
                where("players.playerA.playerId", "==", playerId),
                orderBy("createdAt", "asc"),
            ]),
            this.queryMatches([
                where("players.playerB.playerId", "==", playerId),
                orderBy("createdAt", "asc"),
            ]),
        ]);

        // 重複を排除してマージ
        const allMatches = [...playerAMatches, ...playerBMatches];
        const uniqueMatches = allMatches.filter(
            (match, index, self) =>
                index === self.findIndex((m) => m.matchId === match.matchId)
        );

        return uniqueMatches.sort((a, b) =>
            (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0)
        );
    }

    /**
     * 特定のチームが関わる試合を取得
     */
    async getMatchesByTeamId(teamId: string): Promise<Match[]> {
        // TeamAまたはTeamBのどちらかに該当するチームを検索
        const [teamAMatches, teamBMatches] = await Promise.all([
            this.queryMatches([
                where("players.playerA.teamId", "==", teamId),
                orderBy("createdAt", "asc"),
            ]),
            this.queryMatches([
                where("players.playerB.teamId", "==", teamId),
                orderBy("createdAt", "asc"),
            ]),
        ]);

        // 重複を排除してマージ
        const allMatches = [...teamAMatches, ...teamBMatches];
        const uniqueMatches = allMatches.filter(
            (match, index, self) =>
                index === self.findIndex((m) => m.matchId === match.matchId)
        );

        return uniqueMatches.sort((a, b) =>
            (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0)
        );
    }

    /**
     * 全ての試合をリアルタイムで監視
     */
    subscribeToAllMatches(
        callback: (matches: Match[]) => void,
        onError?: (error: Error) => void
    ): Unsubscribe {
        const matchesCollection = clientCollections.matches(
            this.orgId,
            this.tournamentId
        );

        return onSnapshot(
            query(matchesCollection, orderBy("createdAt", "asc")),
            (querySnap) => {
                try {
                    const matches: Match[] = [];
                    querySnap.forEach((doc) => {
                        const data = doc.data() as FirestoreMatchDoc;
                        const match = MatchMapper.toDomain({ ...data, id: doc.id });
                        matches.push(match);
                    });
                    callback(matches);
                } catch (error) {
                    if (onError) {
                        onError(
                            error instanceof Error ? error : new Error("Unknown error")
                        );
                    }
                }
            },
            (error) => {
                if (onError) {
                    onError(new Error(`Firestore subscription error: ${error.message}`));
                }
            }
        );
    }

    /**
     * 特定の試合をリアルタイムで監視
     */
    subscribeToMatch(
        matchId: string,
        callback: (match: Match | null) => void,
        onError?: (error: Error) => void
    ): Unsubscribe {
        const matchDocRef = clientDocs.match(this.orgId, this.tournamentId, matchId);

        return onSnapshot(
            matchDocRef,
            (docSnap) => {
                try {
                    if (docSnap.exists()) {
                        const data = docSnap.data() as FirestoreMatchDoc;
                        const match = MatchMapper.toDomain({ ...data, id: docSnap.id });
                        callback(match);
                    } else {
                        callback(null);
                    }
                } catch (error) {
                    if (onError) {
                        onError(
                            error instanceof Error ? error : new Error("Unknown error")
                        );
                    }
                }
            },
            (error) => {
                if (onError) {
                    onError(new Error(`Firestore subscription error: ${error.message}`));
                }
            }
        );
    }
}