import type { Tournament, Court } from "@/types/tournament.schema";

/**
 * Tournamentドメインエンティティ
 * 大会に関するビジネスルールをカプセル化
 */
export class TournamentEntity {
    constructor(private readonly data: Tournament) { }

    get id(): string | undefined {
        return this.data.tournamentId;
    }

    get name(): string {
        return this.data.tournamentName;
    }

    get date(): Date {
        return this.data.tournamentDate;
    }

    get dateString(): string {
        return this.data.tournamentDate.toISOString().split('T')[0];
    }

    get location(): string {
        return this.data.location;
    }

    get defaultMatchTime(): number {
        return this.data.defaultMatchTime;
    }

    get courts(): Court[] {
        return this.data.courts;
    }

    get createdAt(): Date | undefined {
        return this.data.createdAt;
    }

    get updatedAt(): Date | undefined {
        return this.data.updatedAt;
    }

    /**
     * デフォルト試合時間を分:秒形式で取得
     */
    get defaultMatchTimeFormatted(): string {
        const totalSeconds = this.data.defaultMatchTime;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * デフォルト試合時間の分数部分を取得
     */
    get defaultMatchTimeMinutes(): number {
        return Math.floor(this.data.defaultMatchTime / 60);
    }

    /**
     * デフォルト試合時間の秒数部分を取得
     */
    get defaultMatchTimeSeconds(): number {
        return this.data.defaultMatchTime % 60;
    }

    /**
     * 指定されたIDのコートを取得
     */
    getCourtById(courtId: string): Court | undefined {
        return this.data.courts.find(court => court.courtId === courtId);
    }

    /**
     * 指定された名前のコートを取得
     */
    getCourtByName(courtName: string): Court | undefined {
        return this.data.courts.find(court => court.courtName === courtName);
    }

    /**
     * コート数を取得
     */
    get courtCount(): number {
        return this.data.courts.length;
    }

    /**
     * 有効な大会データかチェック
     */
    get isValid(): boolean {
        return (
            this.data.tournamentName.trim().length > 0 &&
            this.data.tournamentDate instanceof Date && !isNaN(this.data.tournamentDate.getTime()) &&
            this.data.location.trim().length > 0 &&
            this.data.defaultMatchTime > 0 &&
            this.data.courts.length > 0 &&
            this.data.courts.every(court =>
                court.courtId.trim().length > 0 &&
                court.courtName.trim().length > 0
            )
        );
    }

    /**
     * Tournament データを取得（イミューダブル）
     */
    toData(): Tournament {
        return { ...this.data };
    }

    /**
     * 新しいコート情報で更新したTournamentEntityを作成
     */
    withCourts(newCourts: Court[]): TournamentEntity {
        return new TournamentEntity({
            ...this.data,
            courts: [...newCourts],
        });
    }

    /**
     * 新しいデフォルト試合時間で更新したTournamentEntityを作成
     */
    withDefaultMatchTime(minutes: number, seconds: number): TournamentEntity {
        const totalSeconds = minutes * 60 + seconds;
        return new TournamentEntity({
            ...this.data,
            defaultMatchTime: totalSeconds,
        });
    }
}