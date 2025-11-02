"use client";

import * as React from "react";
import { Button } from "@/components/atoms/button";

interface FormActionsProps {
    onSave: () => void;
    saveButtonText: string;
    className?: string;
}

/**
 * フォームアクションコンポーネント
 * 保存ボタンなどのアクションボタンを含む
 */
export function FormActions({
    onSave,
    saveButtonText,
    className = ""
}: FormActionsProps) {
    return (
        <div className={`flex justify-end pt-4 ${className}`}>
            <Button onClick={onSave} className="px-8">
                {saveButtonText}
            </Button>
        </div>
    );
}