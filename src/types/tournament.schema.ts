import { z } from "zod";

/**
 * コート情報のZodスキーマ
 */
export const courtSchema = z.object({
  courtId: z.string().min(1, "コートIDは必須です"),
  courtName: z.string().min(1, "コート名は必須です"),
});

/**
 * 大会エンティティのZodスキーマ（データベース保存用）
 * デフォルト大会作成時は空の値を許可
 */
export const tournamentSchema = z.object({
  tournamentId: z.string().optional(), // Firestoreで自動生成
  tournamentName: z.string(), // 空文字許可（デフォルト大会用）
  tournamentDate: z.string(), // 空文字許可（デフォルト大会用）
  location: z.string(), // 空文字許可（デフォルト大会用）
  defaultMatchTime: z.number().min(1, "デフォルト試合時間は1秒以上である必要があります"),
  courts: z.array(courtSchema), // 空配列許可（デフォルト大会用）
  createdAt: z.date().optional(), // Firestoreで自動設定
  updatedAt: z.date().optional(), // Firestoreで自動設定
});

/**
 * 大会設定フォーム用のZodスキーマ（フォーム入力時は必須項目を強制）
 */
export const tournamentFormSchema = z.object({
  tournamentId: z.string().optional(),
  tournamentName: z.string().min(1, "大会名は必須です"),
  tournamentDate: z.string().min(1, "開催日は必須です"),
  location: z.string().min(1, "開催場所は必須です"),
  defaultMatchTime: z.number().min(1, "デフォルト試合時間は1秒以上である必要があります"),
  courts: z.array(courtSchema).min(1, "最低1つのコートを設定してください"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

/**
 * 大会作成用のスキーマ
 */
export const tournamentCreateSchema = tournamentSchema.omit({
  tournamentId: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * 大会設定画面用のスキーマ（デフォルト試合時間を分:秒形式で扱う）
 */
export const tournamentSettingsSchema = tournamentSchema
  .omit({
    defaultMatchTime: true,
  })
  .extend({
    defaultMatchTimeMinutes: z.number().min(0).max(59),
    defaultMatchTimeSeconds: z.number().min(0).max(59),
  });

// TypeScriptの型を自動導出
export type Court = z.infer<typeof courtSchema>;
export type Tournament = z.infer<typeof tournamentSchema>;
export type TournamentForm = z.infer<typeof tournamentFormSchema>;
export type TournamentCreate = z.infer<typeof tournamentCreateSchema>;
export type TournamentSettings = z.infer<typeof tournamentSettingsSchema>;

/**
 * 大会操作の状態を表す型
 */
export type TournamentOperationMode = 'view' | 'create' | 'edit';

/**
 * 大会設定フォームの操作結果型
 */
export interface TournamentFormResult {
  success: boolean;
  data?: Tournament;
  error?: string;
}

/**
 * 大会一覧表示用の拡張型（IDを必須にした型）
 */
export type TournamentWithId = Tournament & {
  tournamentId: string;
};

/**
 * 大会設定ページで使用する型安全なハンドラー関数の型定義
 */
export interface TournamentFormHandlers {
  onSave: () => Promise<TournamentFormResult>;
  onChange: <K extends keyof Tournament>(field: K, value: Tournament[K]) => void;
  onCancel?: () => void;
  onDelete?: (tournamentId: string) => Promise<void>;
}

/**
 * 大会設定ページの状態管理型
 */
export interface TournamentSettingsState {
  mode: TournamentOperationMode;
  selectedTournamentId: string | null;
  formData: Tournament;
  isLoading: boolean;
  errors: Partial<Record<keyof Tournament, string>>;
}
