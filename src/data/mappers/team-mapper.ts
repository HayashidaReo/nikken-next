import { Timestamp } from "firebase/firestore";
import type { Team, Player } from "@/types/team.schema";
import { teamSchema, playerSchema } from "@/types/team.schema";

/**
 * Firestore ドキュメント型（新規作成用）
 */
export interface FirestoreTeamCreateDoc {
    teamName: string;
    representativeName: string;
    representativePhone: string;
    representativeEmail: string;
    players: FirestorePlayerDoc[];
    remarks: string;
    isApproved: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

/**
 * Firestore ドキュメント型（取得時・更新時）
 */
export interface FirestoreTeamDoc extends FirestoreTeamCreateDoc {
    teamId?: string; // ドキュメントIDとして別途取得
}

export interface FirestorePlayerDoc {
    playerId: string;
    lastName: string;
    firstName: string;
    displayName: string;
}

/**
 * Teamマッパークラス
 * ドメインエンティティ ↔ Firestoreドキュメント間の変換を担当
 */
export class TeamMapper {
    /**
     * FirestoreドキュメントからドメインエンティティTeamに変換
     */
    static toDomain(doc: FirestoreTeamDoc & { id?: string }): Team {
        // 必須フィールドの存在チェック
        const teamId = doc.id || doc.teamId;
        if (!teamId) {
            throw new Error("Team ID is required for domain conversion");
        }

        if (!doc.createdAt || !doc.updatedAt) {
            throw new Error("CreatedAt and UpdatedAt timestamps are required for domain conversion");
        }

        const team = {
            teamId,
            teamName: doc.teamName,
            representativeName: doc.representativeName,
            representativePhone: doc.representativePhone,
            representativeEmail: doc.representativeEmail,
            players: doc.players.map(player => this.playerToDomain(player)),
            remarks: doc.remarks || "",
            isApproved: doc.isApproved,
            createdAt: doc.createdAt.toDate(),
            updatedAt: doc.updatedAt.toDate(),
        };

        // Zodスキーマでバリデーション
        return teamSchema.parse(team);
    }

    /**
     * ドメインエンティティTeamからFirestoreドキュメントに変換
     */
    static toFirestore(team: Team): Omit<FirestoreTeamDoc, 'teamId'> {
        return {
            teamName: team.teamName,
            representativeName: team.representativeName,
            representativePhone: team.representativePhone,
            representativeEmail: team.representativeEmail,
            players: team.players.map(player => this.playerToFirestore(player)),
            remarks: team.remarks,
            isApproved: team.isApproved,
            createdAt: Timestamp.fromDate(team.createdAt),
            updatedAt: Timestamp.fromDate(team.updatedAt),
        };
    }

    /**
     * 新規作成用のFirestoreドキュメントに変換（タイムスタンプを自動設定）
     */
    static toFirestoreForCreate(team: Partial<Team>): FirestoreTeamCreateDoc {
        const now = Timestamp.now();

        return {
            teamName: team.teamName!,
            representativeName: team.representativeName!,
            representativePhone: team.representativePhone!,
            representativeEmail: team.representativeEmail!,
            players: (team.players || []).map(player => this.playerToFirestore(player)),
            remarks: team.remarks || "",
            isApproved: team.isApproved || false,
            createdAt: now,
            updatedAt: now,
        };
    }

    /**
     * 更新用のFirestoreドキュメントに変換（updatedAtのみ更新）
     */
    static toFirestoreForUpdate(
        team: Partial<Team>,
        preserveTimestamps = false
    ): Partial<FirestoreTeamCreateDoc> {
        const updateData: Partial<FirestoreTeamCreateDoc> = {};

        if (team.teamName !== undefined) updateData.teamName = team.teamName;
        if (team.representativeName !== undefined) updateData.representativeName = team.representativeName;
        if (team.representativePhone !== undefined) updateData.representativePhone = team.representativePhone;
        if (team.representativeEmail !== undefined) updateData.representativeEmail = team.representativeEmail;
        if (team.players !== undefined) {
            updateData.players = team.players.map(player => this.playerToFirestore(player));
        }
        if (team.remarks !== undefined) updateData.remarks = team.remarks;
        if (team.isApproved !== undefined) updateData.isApproved = team.isApproved;

        if (!preserveTimestamps) {
            updateData.updatedAt = Timestamp.now();
        }

        return updateData;
    }

    /**
     * FirestoreプレイヤードキュメントからドメインPlayerに変換
     */
    private static playerToDomain(doc: FirestorePlayerDoc): Player {
        const player = {
            playerId: doc.playerId,
            lastName: doc.lastName,
            firstName: doc.firstName,
            displayName: doc.displayName,
        };

        return playerSchema.parse(player);
    }

    /**
     * ドメインPlayerからFirestoreプレイヤードキュメントに変換
     */
    private static playerToFirestore(player: Player): FirestorePlayerDoc {
        return {
            playerId: player.playerId,
            lastName: player.lastName,
            firstName: player.firstName,
            displayName: player.displayName,
        };
    }

    /**
     * 複数のFirestoreドキュメントからドメインエンティティ配列に変換
     */
    static toDomainsFromQuerySnapshot(docs: Array<{ id: string; data(): FirestoreTeamDoc }>): Team[] {
        return docs.map(doc => {
            const data = doc.data();
            return this.toDomain({ ...data, id: doc.id });
        });
    }

    /**
     * バリデーションエラーをハンドリング
     */
    static validateAndConvert(doc: FirestoreTeamDoc & { id?: string }): { success: true; data: Team } | { success: false; error: string } {
        try {
            const team = this.toDomain(doc);
            return { success: true, data: team };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown validation error"
            };
        }
    }
}