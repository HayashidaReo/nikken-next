import type { MatchPlayer } from "@/types/match.schema";

/**
 * 得点計算ドメインサービス
 * 要件定義書の「反則と得点の自動連動ロジック」を実装
 */
export class ScoreCalculationService {
    /**
     * 反則状態変更時の自動得点計算
     * 
     * ルール:
     * - 反則状態が `赤`(2) になった瞬間に、相手選手の得点が +1
     * - `赤` or `赤+黄`(3) → `赤+赤`(4) へ変更時も、相手選手の得点が +1
     * - 反則状態が戻された場合（例: `赤`(2) → `なし`(0)）は、相手選手の得点が -1
     * - `赤+赤`(4) の状態になると合計で相手に2点が加算され、試合終了
     * 
     * @param currentHansoku 現在の反則状態 (0-4)
     * @param newHansoku 新しい反則状態 (0-4)
     * @param opponentScore 相手の現在の得点
     * @returns 相手の新しい得点
     */
    static calculateScoreFromHansokuChange(
        currentHansoku: number,
        newHansoku: number,
        opponentScore: number
    ): number {
        const scoreChange = this.calculateScoreChange(currentHansoku, newHansoku);
        const newScore = Math.max(0, Math.min(2, opponentScore + scoreChange));

        return newScore;
    }

    /**
     * 反則変更による得点変化量を計算
     */
    private static calculateScoreChange(currentHansoku: number, newHansoku: number): number {
        const currentPenaltyPoints = this.getPenaltyPoints(currentHansoku);
        const newPenaltyPoints = this.getPenaltyPoints(newHansoku);

        return newPenaltyPoints - currentPenaltyPoints;
    }

    /**
     * 反則状態に応じた相手への得点を取得
     */
    private static getPenaltyPoints(hansokuLevel: number): number {
        switch (hansokuLevel) {
            case 0: // none
            case 1: // yellow
                return 0;
            case 2: // red
            case 3: // red_yellow
                return 1;
            case 4: // red_red
                return 2;
            default:
                return 0;
        }
    }

    /**
     * 試合結果を計算（両選手の情報から勝者を判定）
     */
    static calculateMatchResult(
        playerA: MatchPlayer,
        playerB: MatchPlayer
    ): {
        winner: 'playerA' | 'playerB' | 'draw' | null;
        isFinished: boolean;
        reason?: string;
    } {
        // 2点先取チェック
        if (playerA.score >= 2) {
            return {
                winner: 'playerA',
                isFinished: true,
                reason: '2点先取',
            };
        }

        if (playerB.score >= 2) {
            return {
                winner: 'playerB',
                isFinished: true,
                reason: '2点先取',
            };
        }

        // 赤+赤による試合終了チェック
        if (playerA.hansoku >= 4) {
            return {
                winner: 'playerB',
                isFinished: true,
                reason: '相手反則負け',
            };
        }

        if (playerB.hansoku >= 4) {
            return {
                winner: 'playerA',
                isFinished: true,
                reason: '相手反則負け',
            };
        }

        // 試合継続中
        if (playerA.score === playerB.score) {
            return {
                winner: null,
                isFinished: false,
            };
        }

        // 現在のリード状況（試合は継続中）
        return {
            winner: playerA.score > playerB.score ? 'playerA' : 'playerB',
            isFinished: false,
        };
    }

    /**
     * 選手の反則状態が有効かチェック
     */
    static isValidHansokuLevel(level: number): boolean {
        return Number.isInteger(level) && level >= 0 && level <= 4;
    }

    /**
     * 選手の得点が有効かチェック
     */
    static isValidScore(score: number): boolean {
        return Number.isInteger(score) && score >= 0 && score <= 2;
    }

    /**
     * 試合状態の整合性チェック
     */
    static validateMatchState(playerA: MatchPlayer, playerB: MatchPlayer): {
        isValid: boolean;
        errors: string[];
    } {
        const errors: string[] = [];

        if (!this.isValidScore(playerA.score)) {
            errors.push('選手Aの得点が無効です');
        }

        if (!this.isValidScore(playerB.score)) {
            errors.push('選手Bの得点が無効です');
        }

        if (!this.isValidHansokuLevel(playerA.hansoku)) {
            errors.push('選手Aの反則状態が無効です');
        }

        if (!this.isValidHansokuLevel(playerB.hansoku)) {
            errors.push('選手Bの反則状態が無効です');
        }

        // 反則による自動得点の整合性チェック
        const expectedScoreA = this.getPenaltyPoints(playerB.hansoku);
        const expectedScoreB = this.getPenaltyPoints(playerA.hansoku);

        if (playerA.score < expectedScoreA) {
            errors.push('選手Aの得点が反則による自動得点を下回っています');
        }

        if (playerB.score < expectedScoreB) {
            errors.push('選手Bの得点が反則による自動得点を下回っています');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }
}