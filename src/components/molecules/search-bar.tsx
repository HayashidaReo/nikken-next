"use client";

import { Input } from "@/components/atoms/input";
import { Search, X } from "lucide-react";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

/**
 * チーム名やその他のテキスト検索に使用する検索バーコンポーネント
 * 
 * @description
 * - 検索アイコン（先頭）を常に表示
 * - クリアボタン（後尾）は入力時のみ表示
 * - アクセシビリティ対応（クリアボタンにaria-label付与）
 * 
 * @example
 * ```tsx
 * const [query, setQuery] = useState("");
 * <SearchBar 
 *   value={query} 
 *   onChange={setQuery} 
 *   placeholder="チーム名を検索..." 
 * />
 * ```
 */

export const SearchBar = ({ value, onChange, placeholder = "検索...", className }: SearchBarProps) => {
    return (
        <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={className}
            leadingIcon={<Search className="h-4 w-4" />}
            trailingIcon={value ? <X className="h-4 w-4" /> : undefined}
            onTrailingIconClick={() => onChange("")}
            trailingIconLabel="検索をクリア"
        />
    );
};
