"use client";

import { useCallback, useState } from "react";

export interface ValidationRule<T = unknown> {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: T) => string | null;
    email?: boolean;
    number?: boolean;
}

export interface FieldError {
    message: string;
    type: string;
}

/**
 * フォームバリデーションの共通管理hook
 */
export function useFormValidation<T extends Record<string, unknown>>(
    initialValues: T,
    rules: Partial<Record<keyof T, ValidationRule>> = {}
) {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T, FieldError>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

    const validateField = useCallback((name: keyof T, value: unknown): FieldError | null => {
        const rule = rules[name];
        if (!rule) return null;

        // Required check
        if (rule.required && (!value || (typeof value === "string" && value.trim() === ""))) {
            return { message: "この項目は必須です", type: "required" };
        }

        // Skip other validations if value is empty and not required
        if (!value && !rule.required) return null;

        const stringValue = String(value);

        // Min length check
        if (rule.minLength && stringValue.length < rule.minLength) {
            return {
                message: `${rule.minLength}文字以上で入力してください`,
                type: "minLength"
            };
        }

        // Max length check
        if (rule.maxLength && stringValue.length > rule.maxLength) {
            return {
                message: `${rule.maxLength}文字以内で入力してください`,
                type: "maxLength"
            };
        }

        // Email check
        if (rule.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(stringValue)) {
                return { message: "有効なメールアドレスを入力してください", type: "email" };
            }
        }

        // Number check
        if (rule.number) {
            if (isNaN(Number(stringValue))) {
                return { message: "数値を入力してください", type: "number" };
            }
        }

        // Pattern check
        if (rule.pattern && !rule.pattern.test(stringValue)) {
            return { message: "入力形式が正しくありません", type: "pattern" };
        }

        // Custom validation
        if (rule.custom) {
            const customError = rule.custom(value);
            if (customError) {
                return { message: customError, type: "custom" };
            }
        }

        return null;
    }, [rules]);

    const validateAll = useCallback((): boolean => {
        const newErrors: Partial<Record<keyof T, FieldError>> = {};
        let isValid = true;

        Object.keys(values).forEach((key) => {
            const fieldName = key as keyof T;
            const error = validateField(fieldName, values[fieldName]);
            if (error) {
                newErrors[fieldName] = error;
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    }, [values, validateField]);

    const setValue = useCallback((name: keyof T, value: unknown) => {
        setValues(prev => ({ ...prev, [name]: value }));

        // Clear error when value changes
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    }, [errors]);

    const setFieldTouched = useCallback((name: keyof T, isTouched: boolean = true) => {
        setTouched(prev => ({ ...prev, [name]: isTouched }));

        if (isTouched) {
            const error = validateField(name, values[name]);
            setErrors(prev => ({
                ...prev,
                [name]: error || undefined
            }));
        }
    }, [validateField, values]);

    const resetForm = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
    }, [initialValues]);

    const isFieldValid = useCallback((name: keyof T): boolean => {
        return !errors[name];
    }, [errors]);

    const hasErrors = Object.keys(errors).length > 0;

    return {
        values,
        errors,
        touched,
        setValue,
        setFieldTouched,
        validateField,
        validateAll,
        resetForm,
        isFieldValid,
        hasErrors,
        isValid: !hasErrors,
    };
}