"use client";

import * as React from "react";
import { DialogOverlay } from "./dialog-overlay";
import { Card } from "@/components/atoms/card";
import { cn } from "@/lib/utils/utils";

interface ModalDialogProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
}

/**
 * 汎用モーダルダイアログコンポーネント
 * 
 * @description
 * DialogOverlayとCardを組み合わせた標準的なモーダル実装を提供します。
 * 内部でCardHeader, CardContent, CardFooterなどを使用してください。
 */
export function ModalDialog({
    isOpen,
    onClose,
    children,
    className,
}: ModalDialogProps) {
    return (
        <DialogOverlay isOpen={isOpen} onClose={onClose}>
            <Card className={cn("w-full mx-4 bg-white shadow-xl max-h-[90vh] overflow-y-auto", className)}>
                {children}
            </Card>
        </DialogOverlay>
    );
}
