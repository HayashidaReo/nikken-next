import { cn } from "@/lib/utils/utils";

interface ShortcutBadgeProps {
    shortcut: string;
    className?: string;
}

/**
 * 小さなバッジでキーボードショートカットを表示するコンポーネント
 * 例: "A", "Double S", "Space"
 */
export function ShortcutBadge({ shortcut, className }: ShortcutBadgeProps) {
    return (
        <span
            className={cn(
                "inline-block",
                "px-2 py-1",
                "text-xs font-mono",
                "bg-gray-100 text-gray-600",
                "border border-gray-200",
                "rounded",
                className
            )}
        >
            {shortcut}
        </span>
    );
}
