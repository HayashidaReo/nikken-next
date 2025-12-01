"use client";

import { useState, useRef, useEffect } from "react";
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
    const menuRef = useRef<HTMLDivElement>(null);

    // メニュー外クリックで閉じる
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () =>
                document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isOpen]);

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

    return (
        <div className={cn("relative", className)} ref={menuRef}>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="操作メニュー"
            >
                <MoreVertical className="h-4 w-4" />
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
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
            )}
        </div>
    );
}
