import { cn } from "@/lib/utils/utils";
import { Keyboard, CornerDownLeft } from "lucide-react";

interface ShortcutBadgeProps {
    shortcut: string;
    className?: string;
}

/**
 * キーボードショートカットをアイコンとテキストで表示
 */
function ShortcutContent({ shortcut }: { shortcut: string }) {
    const lowerShortcut = shortcut.toLowerCase();

    // Enterキー
    if (lowerShortcut === "enter") {
        return (
            <span className="flex items-center gap-1">
                <CornerDownLeft className="w-3 h-3" />
            </span>
        );
    }

    // Spaceキー（ダブルスペース含む）
    if (lowerShortcut === "space" || lowerShortcut === "double space") {
        const count = lowerShortcut === "double space" ? 2 : 1;
        return (
            <span className="flex items-center gap-0.5">
                {Array.from({ length: count }).map((_, i) => (
                    <Keyboard key={i} className="w-3 h-3" />
                ))}
            </span>
        );
    }

    // その他の文字キー
    return <span className="font-bold">{shortcut}</span>;
}

/**
 * 小さなバッジでキーボードショートカットを表示するコンポーネント
 * 例: "A", "Enter" → アイコン, "Space" → キーボードアイコン
 */
export function ShortcutBadge({ shortcut, className }: ShortcutBadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center justify-center",
                "px-2 py-1",
                "text-xs font-mono",
                "bg-gray-100 text-gray-600",
                "border border-gray-200",
                "rounded",
                className
            )}
        >
            <ShortcutContent shortcut={shortcut} />
        </span>
    );
}
