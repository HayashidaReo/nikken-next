"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { MoreVertical, Edit2, Monitor } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils/utils";

interface MatchActionMenuProps {
    /**
     * 編集ボタンクリック時のハンドラー
     */
    onEdit: () => void;
    /**
     * モニターボタンクリック時のハンドラー
     */
    onMonitor?: () => void;
    /**
     * カスタムクラス
     */
    className?: string;
}

export function MatchActionMenu({
    onEdit,
    onMonitor,
    className,
}: MatchActionMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownState, setDropdownState] = useState({
        top: 0,
        left: 0,
        isAbove: false,
    });

    const wrapperRef = useRef<HTMLDivElement>(null);
    const portalRef = useRef<HTMLDivElement>(null);

    // メニューの位置を計算
    const calculatePosition = useCallback(() => {
        if (!wrapperRef.current) return null;

        const rect = wrapperRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const menuHeight = onMonitor ? 88 : 48; // 推定高さ (44px per item + padding)
        const menuWidth = 192; // w-48 = 192px

        // 下に十分なスペースがない場合は上に表示
        const isAbove = spaceBelow < menuHeight && rect.top >= menuHeight;

        return {
            top: isAbove ? rect.top - menuHeight - 4 : rect.bottom + 4,
            left: rect.right - menuWidth, // ボタンの右端に合わせる
            isAbove,
        };
    }, [onMonitor]);

    // メニュー外クリックで閉じる
    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(target) &&
                portalRef.current &&
                !portalRef.current.contains(target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    // スクロール/リサイズ時の位置更新
    useEffect(() => {
        if (!isOpen) return;
        const updatePosition = () => {
            const pos = calculatePosition();
            if (pos) setDropdownState(pos);
        };

        window.addEventListener("scroll", updatePosition, true);
        window.addEventListener("resize", updatePosition);

        return () => {
            window.removeEventListener("scroll", updatePosition, true);
            window.removeEventListener("resize", updatePosition);
        };
    }, [isOpen, calculatePosition]);

    const handleToggle = () => {
        if (!isOpen) {
            // 開くときに位置計算
            const pos = calculatePosition();
            if (pos) setDropdownState(pos);
        }
        setIsOpen(!isOpen);
    };

    /**
     * 編集メニューのクリックハンドラー
     */
    const handleEditClick = () => {
        setIsOpen(false);
        onEdit();
    };

    /**
     * モニターメニューのクリックハンドラー
     */
    const handleMonitorClick = () => {
        setIsOpen(false);
        if (onMonitor) {
            onMonitor();
        }
    };

    const menuContent = isOpen && (
        <div
            ref={portalRef}
            className="fixed z-[9999] w-48 bg-white border border-gray-200 rounded-md shadow-lg"
            style={{
                top: `${dropdownState.top}px`,
                left: `${dropdownState.left}px`,
            }}
        >
            {onMonitor && (
                <button
                    onClick={handleMonitorClick}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors border-b border-gray-100"
                >
                    <Monitor className="w-4 h-4 text-gray-600" />
                    <span>モニター操作へ</span>
                </button>
            )}
            <button
                onClick={handleEditClick}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
                <Edit2 className="w-4 h-4 text-gray-600" />
                <span>編集</span>
            </button>
        </div>
    );

    return (
        <div className={cn("relative", className)} ref={wrapperRef}>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleToggle}
                aria-label="操作メニュー"
            >
                <MoreVertical className="h-4 w-4" />
            </Button>

            {typeof document !== "undefined" && createPortal(menuContent, document.body)}
        </div>
    );
}
