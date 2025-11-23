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
    MIN_FONT_SIZE: 8,
    /** 自動調整の最大横幅（px） */
    MAX_WIDTH: 1000,
    /** 選手名領域の高さ（px） */
    HEIGHT: 250,
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
