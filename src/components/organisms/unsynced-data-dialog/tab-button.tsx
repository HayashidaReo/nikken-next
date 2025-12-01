import { cn } from "@/lib/utils/utils";

interface TabButtonProps {
    value: "matches" | "groups" | "teams" | "tournaments";
    label: string;
    count: number;
    isActive: boolean;
    onClick: (value: "matches" | "groups" | "teams" | "tournaments") => void;
}

export const TabButton = ({ value, label, count, isActive, onClick }: TabButtonProps) => (
    <button
        onClick={() => onClick(value)}
        className={cn(
            "flex-1 py-2 text-sm font-medium border-b-2 transition-colors",
            isActive
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
        )}
    >
        {label} ({count})
    </button>
);
