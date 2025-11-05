/**
 * 大会フォーム検証ユーティリティ
 * 大会情報のバリデーション関数を集約
 */

import type { TournamentFormData } from "@/types/tournament.schema";

/**
 * バリデーション結果の型定義
 */
export interface ValidationResult {
    isValid: boolean;
    errors: Partial<Record<keyof TournamentFormData, string>>;
}

/**
 * 大会名を検証
 */
export function validateTournamentName(name: string | undefined): string | null {
    if (!name) {
        return "大会名を入力してください";
    }
    if (name.trim().length === 0) {
        return "大会名は空白のみでは入力できません";
    }
    if (name.length > 100) {
        return "大会名は100文字以内で入力してください";
    }
    return null;
}

/**
 * 開催日を検証
 */
export function validateTournamentDate(date: Date | null): string | null {
    if (!date) {
        return "開催日を入力してください";
    }
    // 過去の日付はチェックしない（試合結果入力など対応するため）
    return null;
}

/**
 * 開催場所を検証
 */
export function validateLocation(location: string | undefined): string | null {
    if (!location) {
        return "開催場所を入力してください";
    }
    if (location.trim().length === 0) {
        return "開催場所は空白のみでは入力できません";
    }
    if (location.length > 100) {
        return "開催場所は100文字以内で入力してください";
    }
    return null;
}

/**
 * デフォルト試合時間を検証
 */
export function validateDefaultMatchTime(seconds: number | undefined): string | null {
    if (seconds === undefined || seconds === null) {
        return null; // オプショナルフィールド
    }
    if (seconds < 60) {
        return "試合時間は60秒以上である必要があります";
    }
    if (seconds > 3600) {
        return "試合時間は3600秒以内である必要があります";
    }
    return null;
}

/**
 * 大会概要を検証
 */
export function validateTournamentDetail(detail: string | undefined): string | null {
    if (!detail) {
        return null; // オプショナルフィールド
    }
    if (detail.length > 1000) {
        return "大会概要は1000文字以内で入力してください";
    }
    return null;
}

/**
 * フォーム全体を検証
 * @param formData 検証するフォームデータ
 * @returns バリデーション結果 { isValid: boolean, errors: Record<fieldName, errorMessage> }
 */
export function validateTournamentForm(
    formData: Partial<TournamentFormData>
): ValidationResult {
    const errors: Partial<Record<keyof TournamentFormData, string>> = {};

    // 必須項目の検証
    const tournamentNameError = validateTournamentName(formData.tournamentName);
    if (tournamentNameError) {
        errors.tournamentName = tournamentNameError;
    }

    const tournamentDateError = validateTournamentDate(formData.tournamentDate ?? null);
    if (tournamentDateError) {
        errors.tournamentDate = tournamentDateError;
    }

    const locationError = validateLocation(formData.location);
    if (locationError) {
        errors.location = locationError;
    }

    // オプショナル項目の検証
    const matchTimeError = validateDefaultMatchTime(formData.defaultMatchTime);
    if (matchTimeError) {
        errors.defaultMatchTime = matchTimeError;
    }

    const detailError = validateTournamentDetail(formData.tournamentDetail);
    if (detailError) {
        errors.tournamentDetail = detailError;
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
}

/**
 * 特定のフィールドを検証（リアルタイムバリデーション用）
 * @param field フィールド名
 * @param value フィールド値
 * @returns エラーメッセージ、またはnull
 */
export function validateField(
    field: keyof TournamentFormData,
    value: unknown
): string | null {
    switch (field) {
        case "tournamentName":
            return validateTournamentName(value as string);
        case "tournamentDate":
            return validateTournamentDate(value as Date | null);
        case "location":
            return validateLocation(value as string);
        case "defaultMatchTime":
            return validateDefaultMatchTime(value as number);
        case "tournamentDetail":
            return validateTournamentDetail(value as string);
        default:
            return null;
    }
}
