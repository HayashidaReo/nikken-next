/**
 * 大会操作ユーティリティ
 * 純粋な関数として大会データの操作ロジックを集約
 */

import type { Tournament, TournamentFormData } from "@/types/tournament.schema";
import { validateTournamentForm } from "./tournament-validation";

/**
 * 空の大会フォームデータを作成
 * @returns 初期化されたTournamentFormData
 */
export function createEmptyTournamentFormData(): TournamentFormData {
    return {
        tournamentId: "",
        tournamentName: "",
        tournamentDate: null,
        location: "",
        tournamentDetail: "",
        defaultMatchTime: 180, // 3分 = 180秒
        courts: [],
    };
}

/**
 * Tournament をフォームデータに変換
 * @param tournament 変換元の大会データ
 * @returns フォーム用に整形されたデータ
 */
export function mapTournamentToFormData(
    tournament: Tournament & { tournamentId?: string }
): TournamentFormData {
    return {
        tournamentId: tournament.tournamentId || "",
        tournamentName: tournament.tournamentName,
        tournamentDate: tournament.tournamentDate,
        location: tournament.location,
        tournamentDetail: tournament.tournamentDetail || "",
        defaultMatchTime: tournament.defaultMatchTime,
        courts: tournament.courts,
        createdAt: tournament.createdAt,
        updatedAt: tournament.updatedAt,
    };
}

/**
 * フォームデータから保存用データを準備
 * 不要なフィールド（createdAt, updatedAt）を削除
 * @param formData 保存対象のフォームデータ
 * @returns 保存用に加工されたデータ
 */
export function prepareTournamentDataForSave(
    formData: TournamentFormData
): Omit<TournamentFormData, "createdAt" | "updatedAt"> {
    const {
        createdAt: _createdAt,
        updatedAt: _updatedAt,
        ...dataWithoutDates
    } = formData;

    // ESLint の no-unused-vars を回避するため一度参照
    void _createdAt;
    void _updatedAt;

    return {
        ...dataWithoutDates,
        tournamentDate: formData.tournamentDate as Date,
    };
}

/**
 * フォームデータの保存前バリデーション
 * @param formData 検証するフォームデータ
 * @returns バリデーション結果
 */
export function validateFormBeforeSave(formData: Partial<TournamentFormData>) {
    return validateTournamentForm(formData);
}

/**
 * 大会データが新規作成か編集か判定
 * @param selectedTournamentId 選択中の大会ID
 * @returns true: 新規作成, false: 編集
 */
export function isNewTournament(selectedTournamentId: string | null): boolean {
    return !selectedTournamentId;
}

/**
 * 大会フォームデータの変更があるかチェック
 * @param original 元のデータ
 * @param current 現在のデータ
 * @returns true: 変更あり, false: 変更なし
 */
export function hasTournamentFormDataChanged(
    original: TournamentFormData,
    current: TournamentFormData
): boolean {
    return (
        original.tournamentName !== current.tournamentName ||
        original.tournamentDate?.getTime() !== current.tournamentDate?.getTime() ||
        original.location !== current.location ||
        original.tournamentDetail !== current.tournamentDetail ||
        original.defaultMatchTime !== current.defaultMatchTime ||
        JSON.stringify(original.courts) !== JSON.stringify(current.courts)
    );
}

/**
 * 大会データをマージ（サーバー最新を保持）
 * @param formData ユーザーが編集したフォームデータ
 * @param serverData サーバーの最新データ
 * @returns マージされたデータ
 */
export function mergeTournamentData(
    formData: TournamentFormData,
    serverData: Tournament & { tournamentId?: string }
): TournamentFormData {
    return {
        tournamentId: formData.tournamentId,
        tournamentName: formData.tournamentName,
        tournamentDate: formData.tournamentDate,
        location: formData.location,
        tournamentDetail: formData.tournamentDetail,
        defaultMatchTime: formData.defaultMatchTime,
        courts: formData.courts,
        createdAt: serverData.createdAt,
        updatedAt: serverData.updatedAt,
    };
}

/**
 * コート情報から表示用の文字列を生成
 * @param courts コート配列
 * @returns 表示用の文字列 例: "コートA, コートB"
 */
export function formatCourtsDisplay(
    courts: { courtId: string; courtName: string }[]
): string {
    if (!courts || courts.length === 0) {
        return "未設定";
    }
    return courts.map(c => c.courtName).join(", ");
}

/**
 * デフォルト試合時間を表示用にフォーマット
 * @param seconds 秒数
 * @returns 表示用の文字列 例: "3分 0秒"
 */
export function formatDefaultMatchTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes === 0) {
        return `${remainingSeconds}秒`;
    }

    if (remainingSeconds === 0) {
        return `${minutes}分`;
    }

    return `${minutes}分 ${remainingSeconds}秒`;
}
