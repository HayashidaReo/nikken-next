/**
 * モニター表示に関するユーティリティ関数
 */

/**
 * 試合結果に応じた選手の不透明度クラスを取得する
 * @param isCompleted 試合完了フラグ
 * @param isWinner 勝者フラグ
 * @param isDraw 引き分けフラグ
 * @returns Tailwind CSSのクラス名
 */
export const getMonitorPlayerOpacity = (
    isCompleted: boolean,
    isWinner: boolean,
    isDraw: boolean
) => {
    if (!isCompleted) return "opacity-100";
    if (isDraw) return "opacity-100";
    if (isWinner) return "opacity-100 font-bold";
    return "opacity-100";
};
