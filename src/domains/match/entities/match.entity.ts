import type { Match, MatchPlayer } from "@/types/match.schema";
import { numberToHansokuState } from "@/types/match.schema";

/**
 * Matchドメインエンティティ
 * 試合に関するビジネスルールをカプセル化
 */
export class MatchEntity {
    constructor(private readonly data: Match) { }

    get id(): string | undefined {
        return this.data.matchId;
    }

    get courtId(): string {
        return this.data.courtId;
    }

    get round(): string {
        return this.data.round;
    }

    get playerA(): MatchPlayer {
        return this.data.players.playerA;
    }

    get playerB(): MatchPlayer {
        return this.data.players.playerB;
    }

    get createdAt(): Date | undefined {
        return this.data.createdAt;
    }

    get updatedAt(): Date | undefined {
        return this.data.updatedAt;
    }

    /**
     * 試合が終了しているかチェック
     * 2点先取または赤+赤で試合終了
     */
    get isFinished(): boolean {
        const { playerA, playerB } = this.data.players;

        // 2点先取で勝利
        if (playerA.score >= 2 || playerB.score >= 2) {
            return true;
        }

        // 赤+赤（hansoku: 4）で相手に2点入り試合終了
        if (playerA.hansoku >= 4 || playerB.hansoku >= 4) {
            return true;
        }

        return false;
    }

    /**
     * 勝者を取得（試合終了時のみ）
     */
    get winner(): 'playerA' | 'playerB' | 'draw' | null {
        if (!this.isFinished) {
            return null;
        }

        const { playerA, playerB } = this.data.players;

        if (playerA.score > playerB.score) {
            return 'playerA';
        } else if (playerB.score > playerA.score) {
            return 'playerB';
        } else {
            return 'draw';
        }
    }

    /**
     * 選手Aの反則状態を文字列で取得
     */
    get playerAHansokuState(): string {
        return numberToHansokuState[this.data.players.playerA.hansoku as keyof typeof numberToHansokuState] || 'none';
    }

    /**
     * 選手Bの反則状態を文字列で取得
     */
    get playerBHansokuState(): string {
        return numberToHansokuState[this.data.players.playerB.hansoku as keyof typeof numberToHansokuState] || 'none';
    }

    /**
     * 試合の進行状況を文字列で取得
     */
    get status(): string {
        if (this.isFinished) {
            const winner = this.winner;
            if (winner === 'draw') {
                return '引き分け';
            } else if (winner === 'playerA') {
                return `${this.playerA.displayName} 勝利`;
            } else if (winner === 'playerB') {
                return `${this.playerB.displayName} 勝利`;
            }
        }

        return '進行中';
    }

    /**
     * 試合データを取得（イミューダブル）
     */
    toData(): Match {
        return { ...this.data };
    }

    /**
     * 新しい得点で試合データを更新（イミューダブル）
     */
    withScore(player: 'playerA' | 'playerB', newScore: number): MatchEntity {
        const newData = { ...this.data };
        newData.players = { ...newData.players };

        if (player === 'playerA') {
            newData.players.playerA = { ...newData.players.playerA, score: newScore };
        } else {
            newData.players.playerB = { ...newData.players.playerB, score: newScore };
        }

        return new MatchEntity(newData);
    }

    /**
     * 新しい反則状態で試合データを更新（イミューダブル）
     */
    withHansoku(player: 'playerA' | 'playerB', newHansoku: number): MatchEntity {
        const newData = { ...this.data };
        newData.players = { ...newData.players };

        if (player === 'playerA') {
            newData.players.playerA = { ...newData.players.playerA, hansoku: newHansoku };
        } else {
            newData.players.playerB = { ...newData.players.playerB, hansoku: newHansoku };
        }

        return new MatchEntity(newData);
    }
}