"use client";

import { useState, useRef, useEffect } from "react";
import { Share2, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils/utils";
import { useToast } from "@/components/providers/notification-provider";

interface ShareMenuProps {
    /**
     * 共有対象のアイテム名（チーム名、選手名等）
     */
    itemName: string;
    /**
     * 遷移先のパス（例: `/teams/${teamId}`）
     */
    sharePath: string;
    /**
     * 無効時のメッセージ（設定されている場合、アクション前に警告を表示）
     */
    disabledMessage?: string;
    /**
     * カスタムクラス
     */
    className?: string;
}

export function ShareMenu({
    itemName,
    sharePath,
    disabledMessage,
    className,
}: ShareMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { showSuccess, showError } = useToast();

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
     * URLをクリップボードにコピー
     */
    const handleCopy = async () => {
        if (disabledMessage) {
            showError(disabledMessage);
            setIsOpen(false);
            return;
        }

        try {
            const baseUrl =
                typeof window !== "undefined" ? window.location.origin : "";
            const fullUrl = `${baseUrl}${sharePath}`;
            await navigator.clipboard.writeText(fullUrl);
            showSuccess(`${itemName}のリンクをコピーしました`);
            setIsOpen(false);
        } catch (error) {
            showError("リンクのコピーに失敗しました");
            console.error("Failed to copy URL:", error);
        }
    };

    /**
     * リンク先へ遷移
     */
    const handleNavigate = () => {
        if (disabledMessage) {
            showError(disabledMessage);
            setIsOpen(false);
            return;
        }

        setIsOpen(false);
        // 新しいタブで開く
        window.open(sharePath, "_blank");
    };

    return (
        <div className={cn("relative", className)} ref={menuRef}>
            <Button
                variant="outline"
                size="sm"
                onClick={() => {
                    if (disabledMessage) {
                        showError(disabledMessage);
                        return;
                    }
                    setIsOpen(!isOpen);
                }}
                aria-label="共有メニュー"
            >
                <Share2 className="w-4 h-4" />
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <button
                        onClick={handleCopy}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
                    >
                        <Copy className="w-4 h-4 text-gray-600" />
                        <span>リンクをコピー</span>
                    </button>

                    <button
                        onClick={handleNavigate}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 border-t border-gray-100 flex items-center gap-2 transition-colors"
                    >
                        <ExternalLink className="w-4 h-4 text-gray-600" />
                        <span>新しいタブで開く</span>
                    </button>
                </div>
            )}
        </div>
    );
}
