// Visual constants for UI color classes and other shared UI tokens
// Keep as plain strings of Tailwind utility classes so components can compose them directly.

export const SCORE_COLORS = {
    // 勝ち: オレンジ（赤に近づけて目立つように、太字）
    win: "font-bold text-orange-600",
    // 負け: 薄めの青（目立たないように）
    loss: "text-blue-400",
    // 引き分け: 水色（控えめなトーン）
    draw: "text-blue-700",
    // 0-0 未試合: 両方灰色
    unplayed: "text-gray-500",
} as const;

/**
 * MatchListTable の列幅の割合（%）
 * - 合計は 100% になるように設計
 * - 得点列は広めに確保（スコア + 反則カード表示のため）
 */
export const MATCH_TABLE_COLUMN_WIDTHS = {
    courtName: 16,      // コート名（短いテキスト想定）
    round: 20,         // ラウンド（例: 1回戦、準決勝など）
    playerATeam: 12,   // 選手A所属（チーム名）
    playerAName: 10,   // 選手A名
    score: 10,         // 得点（スコア表示 + 反則カード）
    playerBTeam: 12,   // 選手B所属（チーム名）
    playerBName: 10,   // 選手B名
    action: 10,        // 操作ボタン
} as const;

const UI_CONSTANTS = {
    SCORE_COLORS,
    MATCH_TABLE_COLUMN_WIDTHS,
};

export default UI_CONSTANTS;
