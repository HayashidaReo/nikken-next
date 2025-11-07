/**
 * 大会フォーム検証ユーティリティ
 * Zodスキーマを使用したバリデーション関数
 */

import type { TournamentFormData } from "@/types/tournament.schema";
import { tournamentFormSchema } from "@/types/tournament.schema";
import { z } from "zod";

/**
 * バリデーション結果の型定義
 */
export interface ValidationResult {
    isValid: boolean;
    errors: Partial<Record<keyof TournamentFormData, string>>;
}

/**
 * フォーム全体を検証
 * Zodスキーマを使用してバリデーション
 */
export function validateTournamentForm(
    formData: Partial<TournamentFormData>
): ValidationResult {
    try {
        tournamentFormSchema.parse(formData);
        return {
            isValid: true,
            errors: {},
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors: Partial<Record<keyof TournamentFormData, string>> = {};
            error.issues.forEach((issue) => {
                const field = issue.path[0] as keyof TournamentFormData;
                if (field) {
                    errors[field] = issue.message;
                }
            });
            return {
                isValid: false,
                errors,
            };
        }
        return {
            isValid: false,
            errors: {},
        };
    }
}

/**
 * 特定のフィールドを検証（リアルタイムバリデーション用）
 * Zodスキーマの部分検証を使用
 */
export function validateField(
    field: keyof TournamentFormData,
    value: unknown
): string | null {
    // フィールドごとにZodスキーマの部分検証
    const fieldSchema = tournamentFormSchema.shape[field];
    if (!fieldSchema) {
        return null;
    }

    // 空文字は未入力扱いに正規化するかどうかを判定
    // - フィールドのスキーマが undefined を許容する（optional）場合のみ、空文字を undefined に正規化する
    // - required フィールド（min(1) など）については空文字のまま検証して、必須チェックが発動するようにする
    let normalizedValue: unknown = value;
    if (typeof value === "string" && value.trim() === "") {
        const allowsUndefined = fieldSchema.safeParse(undefined).success;
        normalizedValue = allowsUndefined ? undefined : value;
    }

    const result = fieldSchema.safeParse(normalizedValue);
    if (result.success) return null;

    // safeParse の結果から最初のエラーメッセージを返す
    return result.error.issues[0]?.message || "入力エラー";
}
