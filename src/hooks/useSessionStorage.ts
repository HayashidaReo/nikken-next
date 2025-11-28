"use client";

import { useState, useCallback } from "react";

/**
 * セッションストレージの値を型安全に管理するhook
 * @param key セッションストレージのキー
 * @param defaultValue デフォルト値
 * @param serializer カスタムシリアライザー（省略時はJSON.stringify/parse）
 */
export function useSessionStorage<T>(
    key: string,
    defaultValue: T,
    serializer?: {
        serialize: (value: T) => string;
        deserialize: (value: string) => T;
    }
) {
    const serialize = serializer?.serialize ?? JSON.stringify;
    const deserialize = serializer?.deserialize ?? JSON.parse;

    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === "undefined") {
            return defaultValue;
        }

        try {
            const item = window.sessionStorage.getItem(key);
            return item ? deserialize(item) : defaultValue;
        } catch (error) {
            console.error(`Error reading sessionStorage key "${key}":`, error);
            return defaultValue;
        }
    });

    const setValue = useCallback(
        (value: T | ((val: T) => T)) => {
            try {
                setStoredValue((prev) => {
                    const valueToStore = value instanceof Function ? value(prev) : value;

                    if (typeof window !== "undefined") {
                        window.sessionStorage.setItem(key, serialize(valueToStore));
                    }

                    return valueToStore;
                });
            } catch (error) {
                console.error(`Error setting sessionStorage key "${key}":`, error);
            }
        },
        [key, serialize]
    );

    const removeValue = useCallback(() => {
        try {
            setStoredValue(defaultValue);
            if (typeof window !== "undefined") {
                window.sessionStorage.removeItem(key);
            }
        } catch (error) {
            console.error(`Error removing sessionStorage key "${key}":`, error);
        }
    }, [key, defaultValue]);

    return [storedValue, setValue, removeValue] as const;
}
