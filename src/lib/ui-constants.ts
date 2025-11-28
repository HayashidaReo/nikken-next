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
 * - 試合一覧画面用
 * - 合計は 100% になるように設計
 */
export const MATCH_TABLE_COLUMN_WIDTHS = {
    courtName: 16,      // コート名（短いテキスト想定）
    round: 20,         // ラウンド（例: 1回戦、準決勝など）
    playerATeam: 13,   // 選手A所属（チーム名）
    playerAName: 10,   // 選手A名
    score: 10,         // 得点（スコア表示 + 反則カード）
    playerBTeam: 13,   // 選手B所属（チーム名）
    playerBName: 10,   // 選手B名
    action: 8,        // 操作ボタン
} as const;

/**
 * MatchSetupTable の列幅の割合（%）
 * - 組み合わせ設定画面用
 * - 合計は 100% になるように設計
 */
export const MATCH_SETUP_TABLE_COLUMN_WIDTHS = {
    drag: 3,           // ドラッグハンドル
    courtName: 16,      // コート名
    round: 20,         // ラウンド
    playerATeam: 17,   // 選手A所属
    playerAName: 12,   // 選手A名
    playerBTeam: 17,   // 選手B所属
    playerBName: 12,   // 選手B名
    action: 6,        // 操作ボタン（変更・削除など）
} as const;

/**
 * MatchGroupSetupTable の列幅の割合（%）
 * - 団体戦組み合わせ設定画面用
 * - 合計は 100% になるように設計
 */
export const MATCH_GROUP_SETUP_TABLE_COLUMN_WIDTHS = {
    drag: 3,           // ドラッグハンドル
    courtName: 20,      // コート名
    round: 18,         // ラウンド
    teamA: 24,         // チームA
    teamB: 24,         // チームB
    action: 11,        // 操作ボタン
} as const;

/**
 * TeamMatchSetupTable の列幅の割合（%）
 * - 団体戦対戦カード内試合設定画面用
 * - 合計は 100% になるように設計
 */
export const TEAM_MATCH_SETUP_TABLE_COLUMN_WIDTHS = {
    drag: 3,           // ドラッグハンドル
    round: 18,         // ラウンド（ポジション）
    playerA: 33,       // 選手A
    vs: 3,             // VS表示
    playerB: 33,       // 選手B
    action: 7,         // 操作ボタン
} as const;

/**
 * TeamMatchListTable の列幅の割合（%）
 * - 団体戦試合一覧（ダッシュボード等）用
 * - コート名なし
 */
export const TEAM_MATCH_LIST_TABLE_COLUMN_WIDTHS = {
    round: 15,
    playerAName: 16,
    score: 30,
    playerBName: 16,
    winReason: 10,
    action: 9,
    edit: 4,
} as const;

const UI_CONSTANTS = {
    SCORE_COLORS,
    MATCH_TABLE_COLUMN_WIDTHS,
};

export default UI_CONSTANTS;
