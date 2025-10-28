import type { Team, Player } from "@/types/team.schema";

/**
 * Teamドメインエンティティ
 * ビジネスルールとドメイン知識をカプセル化
 */
export class TeamEntity {
    constructor(private readonly data: Team) { }

    get id(): string | undefined {
        return this.data.teamId;
    }

    get name(): string {
        return this.data.teamName;
    }

    get representativeName(): string {
        return this.data.representativeName;
    }

    get representativeEmail(): string {
        return this.data.representativeEmail;
    }

    get representativePhone(): string {
        return this.data.representativePhone;
    }

    get players(): Player[] {
        return this.data.players;
    }

    get remarks(): string {
        return this.data.remarks;
    }

    get isApproved(): boolean {
        return this.data.isApproved;
    }

    get createdAt(): Date | undefined {
        return this.data.createdAt;
    }

    get updatedAt(): Date | undefined {
        return this.data.updatedAt;
    }

    /**
     * チームの選手数を取得
     */
    get playerCount(): number {
        return this.data.players.length;
    }

    /**
     * 指定された選手IDの選手を取得
     */
    getPlayerById(playerId: string): Player | undefined {
        return this.data.players.find(player => player.playerId === playerId);
    }

    /**
     * 姓による選手の検索
     */
    getPlayersByLastName(lastName: string): Player[] {
        return this.data.players.filter(player => player.lastName === lastName);
    }

    /**
     * 同姓の選手が存在するかチェック
     */
    hasDuplicateLastNames(): boolean {
        const lastNames = this.data.players.map(player => player.lastName);
        const uniqueLastNames = new Set(lastNames);
        return lastNames.length !== uniqueLastNames.size;
    }

    /**
     * 承認可能かどうかを判定
     */
    canBeApproved(): boolean {
        // 最低1人の選手が登録されている
        if (this.data.players.length === 0) {
            return false;
        }

        // 全ての選手にdisplayNameが設定されている
        return this.data.players.every(player => player.displayName.trim().length > 0);
    }

    /**
     * Team データを取得（イミューダブル）
     */
    toData(): Team {
        return { ...this.data };
    }
}