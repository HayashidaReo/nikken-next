/**
 * アプリケーション共通定数定義
 */

import type { WinReason } from "@/types/match.schema";

// 🏆 決着理由ラベル定数
export const WIN_REASON_LABELS: Record<WinReason, string> = {
  ippon: "一本",
  hantei: "判定",
  hansoku: "反則",
  fusen: "不戦",
  none: "なし",
} as const;

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
  /** スコア表示フォントサイズ（拡大） */
  SCORE_FONT_SIZE: "text-[20rem]",
  /** スコア表示幅（フォントに合わせて拡張） */
  SCORE_WIDTH: "w-[22rem]",
  /** フォーム最大幅 */
  FORM_MAX_WIDTH: "max-w-4xl",
  /** コンテナ最大幅 */
  CONTAINER_MAX_WIDTH: "max-w-6xl",
} as const;

// 📺 モニター表示関連定数（基準解像度）
export const MONITOR_CONSTANTS = {
  /** モニター用の基準幅（px） */
  BASE_WIDTH: 1920,
  /** モニター用の基準高さ（px） */
  BASE_HEIGHT: 1080,
} as const;

// 選手表示関連定数
export const RESPONSIVE_FONT_CONSTANTS = {
  /** 選手表示部分のレスポンシブフォント設定 */
  PLAYER: {
    /** ベースフォントサイズ（rem） */
    BASE_FONT_SIZE: 16,
    /** 最小フォントサイズ（rem） */
    MIN_FONT_SIZE: 4,
    /** 自動調整の最大横幅（px） */
    MAX_WIDTH: 950,
    /** 選手名領域の高さ（px） */
    HEIGHT: 250,
  },
  /** チーム名表示部分のレスポンシブフォント設定 */
  TEAM: {
    /** ベースフォントサイズ（rem） -  */
    BASE_FONT_SIZE: 6,
    /** 最小フォントサイズ（rem） */
    MIN_FONT_SIZE: 2,
    /** 自動調整の最大横幅（px） */
    MAX_WIDTH: 900,
    /** チーム名領域の高さ（px） */
    HEIGHT: 100,
  },
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

// 📏 文字数制限関連定数
export const TEXT_LENGTH_LIMITS = {
  /** 大会名の最大文字数 */
  TOURNAMENT_NAME_MAX: 15,
  /** コート名の最大文字数 */
  COURT_NAME_MAX: 8,
  /** 開催場所の最大文字数 */
  LOCATION_MAX: 10,
  /** ラウンド名の最大文字数 */
  ROUND_NAME_MAX: 11,
  /** 大会概要の最大文字数 */
  TOURNAMENT_DETAIL_MAX: 1000,
} as const;

// 団体戦ラウンド順 (Team match role names)
export const TEAM_MATCH_ROUNDS = [
  { id: "1", label: "先鋒" },
  { id: "2", label: "次鋒" },
  { id: "3", label: "中堅" },
  { id: "4", label: "副将" },
  { id: "5", label: "大将" },
  { id: "6", label: "代表戦" },
] as const;

export const TEAM_MATCH_ROUND_OPTIONS = TEAM_MATCH_ROUNDS.map(round => ({
  value: round.id,
  label: round.label,
}));

export function getTeamMatchRoundLabelById(roundId?: string | null): string {
  if (!roundId) return "";
  const round = TEAM_MATCH_ROUNDS.find(r => r.id === roundId);
  return round ? round.label : "";
}

export function getTeamMatchRoundIdByIndex(index: number): string {
  return TEAM_MATCH_ROUNDS[index]?.id ?? "";
}

// 団体戦関連の汎用定数
export const TEAM_MATCH_CONSTANTS = {
  /** 団体戦の通常試合（代表戦を除く）の最終試合順序 */
  LAST_REGULAR_MATCH_ORDER: 4,
  /** 団体戦の通常試合（代表戦を除く）の最終ラウンドID */
  LAST_REGULAR_MATCH_ROUND_ID: '5',
  /** 代表戦のラウンドID */
  REP_MATCH_ROUND_ID: '6',
} as const;

// 🥋 ペナルティ関連定数
export const PENALTY_CONSTANTS = {
  /** ペナルティカードサイズ */
  CARD_SIZE: {
    width: "w-36",
    height: "h-52",
  },
  /** ペナルティ背景サイズ */
  BACKGROUND_SIZE: {
    width: "w-[33rem]",
    height: "h-[18rem]",
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

export const SCORE_OPTIONS = [
  { value: 0, label: "0" },
  { value: 1, label: "1" },
  { value: 2, label: "2" },
];

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
  /** 団体戦グループコレクション */
  MATCH_GROUPS: "matchGroups",
  /** 団体戦試合コレクション */
  TEAM_MATCHES: "teamMatches",
} as const;

// 🌐 APIエンドポイント定数
export const API_ENDPOINTS = {
  /** 試合結果更新エンドポイント（matchId を動的に指定）*/
  MATCH_UPDATE: (matchId: string) => `/api/matches/${matchId}`,
} as const;

// 🔐 認証 / ログアウト関連定数
export const AUTH_CONSTANTS = {
  /** ログアウト後にリダイレクトするまでの待機時間（ミリ秒） */
  LOGOUT_REDIRECT_DELAY: 500,
} as const;

// 💾 ストレージ関連定数
export const STORAGE_KEYS = {
  /** Presentation Connection ID のストレージキー */
  PRESENTATION_CONNECTION_ID: "presentation_connection_id",
  /** 手動モニター操作画面の状態保存キー */
  MANUAL_MONITOR_STATE: "nikken-manual-monitor-state",
} as const;

// 🛣️ ルートパス定数
export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  TOURNAMENT_SETTINGS: "/tournament-settings",
} as const;

// 💬 テキストメッセージ定数（ユーザーに表示するメッセージ）
export const TEXT_MESSAGES = {
  /** メールアドレスの形式が正しくない */
  INVALID_EMAIL: "メールアドレスを正しい形式で入力してください",
  /** ユーザーが無効化されている */
  USER_DISABLED: "このアカウントは無効化されています",
  /** メールアドレスまたはパスワードが間違っている（セキュリティ上、ユーザーなしとパスワード誤りを同じメッセージ） */
  INVALID_CREDENTIALS: "メールアドレスまたはパスワードが間違っています",
  /** ログイン試行回数が多すぎる */
  TOO_MANY_REQUESTS: "ログイン試行回数が上限に達しました。しばらく待ってからお試しください",
  /** 予期しないエラー */
  UNEXPECTED_ERROR: "予期しないエラーが発生しました",
  /** ネットワークエラー */
  NETWORK_ERROR: "ネットワークエラーが発生しました。接続を確認してください",
  /** パスワードリセットメール送信エラー */
  PASSWORD_RESET_EMAIL_ERROR: "パスワード再設定メールの送信に失敗しました",
} as const;

// 🔄 同期処理関連定数
export const SYNC_CONSTANTS = {
  /** デフォルトの同期タイムアウト時間（ミリ秒） */
  DEFAULT_SYNC_TIMEOUT: 10000,
} as const;

// 📱 アプリケーション情報定数
export const APP_INFO = {
  /** アプリケーションバージョン */
  VERSION: process.env.NEXT_PUBLIC_APP_VERSION || "0.0.0",
} as const;

// 🖥️ モニター表示モード定数
export const MONITOR_VIEW_MODES = {
  SCOREBOARD: "scoreboard",
  MATCH_RESULT: "match_result",
} as const;

// 🏆 大会種別定数
export const TOURNAMENT_TYPES = {
  INDIVIDUAL: "individual",
  TEAM: "team",
} as const;

// 👤 プレイヤーキー定数
export const PLAYER_KEYS = {
  PLAYER_A: "playerA",
  PLAYER_B: "playerB",
} as const;

// 🏅 勝者タイプ定数
export const WINNER_TYPES = {
  PLAYER_A: "playerA",
  PLAYER_B: "playerB",
  DRAW: "draw",
  NONE: "none",
} as const;
