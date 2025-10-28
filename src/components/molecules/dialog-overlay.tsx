"use client";

import * as React from "react";
import { DIALOG_OVERLAY_CLASSES, dialogOverlayStyle } from "@/lib/utils/dialog-styles";
import { cn } from "@/lib/utils/utils";

interface DialogOverlayProps {
    isOpen: boolean;
    onClose?: () => void;
    children: React.ReactNode;
    className?: string;
}

/**
 * ダイアログの共通オーバーレイコンポーネント
 * 背景のクリックでダイアログを閉じる機能付き
 */
export function DialogOverlay({
    isOpen,
    onClose,
    children,
    className,
}: DialogOverlayProps) {
    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent) => {
        // 背景をクリックした場合のみダイアログを閉じる
        if (e.target === e.currentTarget && onClose) {
            onClose();
        }
    };

    return (
        <div
            className={cn(DIALOG_OVERLAY_CLASSES, className)}
            style={dialogOverlayStyle}
            onClick={handleOverlayClick}
        >
            {children}
        </div>
    );
}