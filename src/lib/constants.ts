/**
 * アプリケーション共通定数定義
 */

// ⏰ 時間関連定数
export const TIME_CONSTANTS = {
  /** 秒から分への変換基準 */
  SECONDS_PER_MINUTE: 60,
  /** 分から時間への変換基準 */
  MINUTES_PER_HOUR: 60,
} as const;

// 🔔 通知関連定数
export const NOTIFICATION_CONSTANTS = {
  /** デフォルト通知表示時間（ミリ秒） */
  DEFAULT_DURATION: 5000,
  /** 成功通知表示時間（ミリ秒） */
  SUCCESS_DURATION: 3000,
  /** エラー通知表示時間（ミリ秒） */
  ERROR_DURATION: 7000,
} as const;

// 🎨 UIレイアウト関連定数
export const UI_CONSTANTS = {
  /** スコア表示フォントサイズ */
  SCORE_FONT_SIZE: "text-[12rem]",
  /** スコア表示幅 */
  SCORE_WIDTH: "w-80",
  /** フォーム最大幅 */
  FORM_MAX_WIDTH: "max-w-4xl",
  /** コンテナ最大幅 */
  CONTAINER_MAX_WIDTH: "max-w-6xl",
} as const;

// 📝 フォーム関連定数
export const FORM_CONSTANTS = {
  /** 時間入力の最小値 */
  TIME_INPUT_MIN: 0,
  /** 時間入力の最大値（分・秒） */
  TIME_INPUT_MAX: 59,
  /** 最小コート数 */
  MIN_COURTS: 1,
} as const;

// 🥋 ペナルティ関連定数
export const PENALTY_CONSTANTS = {
  /** ペナルティカードサイズ */
  CARD_SIZE: {
    width: "w-16",
    height: "h-24",
  },
  /** ペナルティ背景サイズ */
  BACKGROUND_SIZE: {
    width: "w-66",
    height: "h-40",
  },
} as const;

// 🏆 スコア関連定数
export const SCORE_CONSTANTS = {
  /** 最小スコア */
  MIN_SCORE: 0,
  /** 最大スコア */
  MAX_SCORE: 2,
  /** 反則による得点計算の除数（赤反則判定） */
  RED_HANSOKU_DIVISOR: 2,
} as const;

// 🔴 反則ルール関連定数
export const HANSOKU_CONSTANTS = {
  /** 最小反則数 */
  MIN_HANSOKU: 0,
  /** 最大反則数（赤2つ）*/
  MAX_HANSOKU: 4,
  /** 赤1つの反則数 */
  RED_ONE: 2,
  /** 反則の計算単位（2つで赤1つ） */
  HANSOKU_UNIT: 2,
} as const;

// 🗃️ Firestore関連定数
export const FIRESTORE_COLLECTIONS = {
  /** 組織コレクション */
  ORGANIZATIONS: "organizations",
  /** 大会コレクション */
  TOURNAMENTS: "tournaments",
  /** チームコレクション */
  TEAMS: "teams",
  /** 試合コレクション */
  MATCHES: "matches",
  /** ユーザーコレクション */
  USERS: "users",
} as const;

// 🌐 APIエンドポイント定数
export const API_ENDPOINTS = {
  /** 試合結果更新エンドポイント（matchId を動的に指定）*/
  MATCH_UPDATE: (matchId: string) => `/api/matches/${matchId}`,
} as const;
