import React from "react";
import { Input } from "@/components/atoms/input";
import { Search, X } from "lucide-react";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

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
