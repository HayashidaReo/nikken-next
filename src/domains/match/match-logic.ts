/**
 * 試合ドメインロジック
 * スコア・反則計算などの試合ルールに関する純粋関数を定義
 */

import { HANSOKU_CONSTANTS, SCORE_CONSTANTS } from "../../lib/constants";

/**
 * 反則数の変化から相手に付与される得点を計算
 *
 * ルール:
 * - 赤1つ（hansoku 2）で相手に1点
 * - 赤2つ（hansoku 4）で相手に2点（試合終了）
 * - 得点は最大2点まで
 *
 * @param currentHansoku - 現在の反則数（0-4）
 * @param newHansoku - 新しい反則数（0-4）
 * @returns 相手に付与される得点の変化分（0-2）
 */
export function calculateOpponentScoreChange(
    currentHansoku: number,
    newHansoku: number
): number {
    // 現在の赤の数を計算（2つで赤1つ）
    const currentReds = Math.floor(currentHansoku / HANSOKU_CONSTANTS.HANSOKU_UNIT);
    // 新しい赤の数を計算
    const newReds = Math.floor(newHansoku / HANSOKU_CONSTANTS.HANSOKU_UNIT);

    // 追加された赤の数が相手への得点
    return Math.max(0, newReds - currentReds);
}

/**
 * 相手の得点を更新（最大2点で制限）
 *
 * @param currentScore - 相手の現在スコア
 * @param scoreChange - スコア変化分
 * @returns 更新後のスコア（0-2に制限）
 */
export function updateOpponentScore(
    currentScore: number,
    scoreChange: number
): number {
    return Math.min(SCORE_CONSTANTS.MAX_SCORE, Math.max(SCORE_CONSTANTS.MIN_SCORE, currentScore + scoreChange));
}

/**
 * 試合終了条件を判定
 *
 * 終了条件:
 * - 反則が4以上（赤2つ）
 * - スコアが2以上（2点先取）
 *
 * @param hansoku - 反則数
 * @param score - スコア
 * @returns 試合終了フラグ
 */
export function isMatchEnded(hansoku: number, score: number): boolean {
    return hansoku >= HANSOKU_CONSTANTS.MAX_HANSOKU || score >= SCORE_CONSTANTS.MAX_SCORE;
}

/**
 * スコア・反則情報から試合状態を判定
 *
 * @param playerAScore - 選手Aのスコア
 * @param playerAHansoku - 選手Aの反則数
 * @param playerBScore - 選手Bのスコア
 * @param playerBHansoku - 選手Bの反則数
 * @returns 試合が終了しているかどうか
 */
export function hasMatchEnded(
    playerAScore: number,
    playerAHansoku: number,
    playerBScore: number,
    playerBHansoku: number
): boolean {
    return isMatchEnded(playerAHansoku, playerAScore) || isMatchEnded(playerBHansoku, playerBScore);
}

export type Winner = "playerA" | "playerB" | "draw" | "none";

/**
 * スコアから勝者を判定
 *
 * @param playerAScore - 選手Aのスコア
 * @param playerBScore - 選手Bのスコア
 * @param isCompleted - 試合が完了しているかどうか（完了していて同点なら引き分け）
 * @returns 勝者
 */
export function determineWinner(
    playerAScore: number,
    playerBScore: number,
    isCompleted: boolean = true
): Winner {
    if (playerAScore > playerBScore) return "playerA";
    if (playerBScore > playerAScore) return "playerB";
    if (isCompleted) return "draw";
    return "none";
}

/**
 * 反則更新時の影響を計算する
 * 
 * @param currentHansoku - 現在の反則数
 * @param newHansoku - 新しい反則数
 * @param opponentScore - 相手の現在のスコア
 * @returns 更新後の相手スコアと試合終了フラグ
 */
export function calculateHansokuEffects(
    currentHansoku: number,
    newHansoku: number,
    opponentScore: number
): { newOpponentScore: number; isMatchEnded: boolean } {
    const scoreChange = calculateOpponentScoreChange(currentHansoku, newHansoku);
    const newOpponentScore = updateOpponentScore(opponentScore, scoreChange);
    const matchEnded = isMatchEnded(newHansoku, newOpponentScore);
    return { newOpponentScore, isMatchEnded: matchEnded };
}
