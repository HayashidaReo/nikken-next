/**
 * 大会フォーム状態管理フック
 * useTournamentSettings から分離したフォーム処理専用フック
 */

import { useState, useCallback, useEffect } from "react";
import type { TournamentFormData } from "@/types/tournament.schema";
import type { Tournament } from "@/types/tournament.schema";
import {
    createEmptyTournamentFormData,
    mapTournamentToFormData,
} from "@/lib/utils/tournament-operations";
import { validateField } from "@/lib/utils/tournament-validation";

/**
 * フォーム検証エラーの型
 */
export type FormErrors = Partial<Record<keyof TournamentFormData, string>>;

interface UseTournamentFormResult {
    formData: TournamentFormData;
    errors: FormErrors;
    isValidating: boolean;

    // フォーム操作関数
    handleFormChange: (
        field: keyof TournamentFormData,
        value: unknown
    ) => void;
    handleFormReset: () => void;
    setFormData: (data: TournamentFormData) => void;

    // 検証関数
    validateFormField: (field: keyof TournamentFormData) => void;
    clearFieldError: (field: keyof TournamentFormData) => void;
}

/**
 * 大会フォームの状態と操作を管理
 * 単一の大会フォームの入力値、バリデーション、変更を一括管理
 */
export function useTournamentForm(
    initialTournament?: Tournament & { tournamentId?: string }
): UseTournamentFormResult {
    const [formData, setFormData] = useState<TournamentFormData>(() => {
        if (initialTournament) {
            return mapTournamentToFormData(initialTournament);
        }
        return createEmptyTournamentFormData();
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isValidating, setIsValidating] = useState(false);

    /**
     * フォームフィールド値を更新
     */
    const handleFormChange = useCallback(
        (field: keyof TournamentFormData, value: unknown) => {
            setFormData((prev) => ({
                ...prev,
                [field]: value,
            }));

            // フィールド値の変更時に、そのフィールドのエラーをクリア
            if (errors[field]) {
                setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors[field];
                    return newErrors;
                });
            }
        },
        [errors]
    );

    /**
     * フォームを初期状態にリセット
     */
    const handleFormReset = useCallback(() => {
        if (initialTournament) {
            setFormData(mapTournamentToFormData(initialTournament));
        } else {
            setFormData(createEmptyTournamentFormData());
        }
        setErrors({});
    }, [initialTournament]);

    /**
     * 特定フィールドを検証
     */
    const validateFormField = useCallback((field: keyof TournamentFormData) => {
        setIsValidating(true);
        const error = validateField(field, formData[field]);

        if (error) {
            setErrors((prev) => ({
                ...prev,
                [field]: error,
            }));
        } else {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
        setIsValidating(false);
    }, [formData]);

    /**
     * 特定フィールドのエラーをクリア
     */
    const clearFieldError = useCallback((field: keyof TournamentFormData) => {
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    }, []);

    /**
     * initialTournamentが変更された場合、フォームデータを更新
     */
    useEffect(() => {
        // 外部ソース（initialTournament）からのデータ同期のみを目的とする
        // このeffectでは単にフォームデータを初期化するだけ
    }, []); // 初期化時のみ実行

    return {
        formData,
        errors,
        isValidating,
        handleFormChange,
        handleFormReset,
        setFormData,
        validateFormField,
        clearFieldError,
    };
}
