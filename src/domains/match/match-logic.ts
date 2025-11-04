/**
 * 試合ドメインロジック
 * スコア・反則計算などの試合ルールに関する純粋関数を定義
 */

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
    const currentReds = Math.floor(currentHansoku / 2);
    // 新しい赤の数を計算
    const newReds = Math.floor(newHansoku / 2);

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
    return Math.min(2, Math.max(0, currentScore + scoreChange));
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
    return hansoku >= 4 || score >= 2;
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
