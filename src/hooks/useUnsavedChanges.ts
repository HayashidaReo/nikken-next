"use client";

import { useEffect } from "react";

/**
 * 未保存の変更がある場合にページ離脱時に確認ダイアログを表示するhook
 */
export function useUnsavedChanges(hasUnsavedChanges: boolean) {
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = "変更が保存されていません。このページを離れますか？";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [hasUnsavedChanges]);

    const confirmNavigation = (message?: string) => {
        if (hasUnsavedChanges) {
            return confirm(message || "変更が保存されていません。このページを離れますか？");
        }
        return true;
    };

    return { confirmNavigation };
}