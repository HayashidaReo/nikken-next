"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Check, Filter } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import {
    calculateDropdownHeight,
    shouldOpenAbove,
} from "./searchable-select.constants";

export interface MultiSelectOption {
    value: string;
    label: string;
}

interface MultiSelectDropdownProps {
    label: string;
    options: MultiSelectOption[];
    selectedValues: string[];
    onSelectionChange: (values: string[]) => void;
    className?: string;
}

export function MultiSelectDropdown({
    label,
    options,
    selectedValues,
    onSelectionChange,
    className,
}: MultiSelectDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownState, setDropdownState] = useState({
        top: 0,
        left: 0,
        width: 0,
        isAbove: false,
    });

    const wrapperRef = useRef<HTMLDivElement>(null);
    const portalRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    // ドロップダウンの位置計算
    const calculatePosition = useCallback(() => {
        if (!wrapperRef.current) return null;
        const rect = wrapperRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const dropdownHeight = calculateDropdownHeight(options.length);
        const isAbove = shouldOpenAbove(spaceBelow, spaceAbove, dropdownHeight);

        return {
            top: isAbove ? rect.top - dropdownHeight : rect.bottom,
            left: rect.left,
            width: Math.max(rect.width, 200), // 最小幅を確保
            isAbove,
        };
    }, [options.length]);

    // クリックハンドラ
    const handleToggle = () => {
        if (!isOpen) {
            const pos = calculatePosition();
            if (pos) setDropdownState(pos);
        }
        setIsOpen(!isOpen);
    };

    // 外部クリック検知
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

    // スクロール追従
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

    // 選択処理
    const handleSelect = (value: string) => {
        const newSelection = selectedValues.includes(value)
            ? selectedValues.filter((v) => v !== value)
            : [...selectedValues, value];
        onSelectionChange(newSelection);
    };

    const handleSelectAll = () => {
        if (selectedValues.length === options.length) {
            onSelectionChange([]);
        } else {
            onSelectionChange(options.map((o) => o.value));
        }
    };

    const isAllSelected = selectedValues.length === options.length && options.length > 0;
    const hasSelection = selectedValues.length > 0;

    const dropdownContent = isOpen && (
        <div
            ref={portalRef}
            className={cn(
                "fixed z-[9999] rounded-md border border-gray-200 bg-white shadow-lg",
                "animate-in fade-in-0 zoom-in-95"
            )}
            style={{
                top: `${dropdownState.top}px`,
                left: `${dropdownState.left}px`,
                width: `${dropdownState.width}px`,
                maxHeight: "300px",
            }}
        >
            <div className="p-2 border-b border-gray-100">
                <div
                    className="flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-gray-50 rounded"
                    onClick={handleSelectAll}
                >
                    <div className={cn(
                        "w-4 h-4 border rounded mr-2 flex items-center justify-center",
                        isAllSelected ? "bg-blue-500 border-blue-500" : "border-gray-300"
                    )}>
                        {isAllSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="font-medium">すべて選択</span>
                </div>
            </div>
            <div className="overflow-y-auto max-h-[200px] p-1">
                {options.map((option) => {
                    const isSelected = selectedValues.includes(option.value);
                    return (
                        <div
                            key={option.value}
                            className="flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-gray-50 rounded"
                            onClick={() => handleSelect(option.value)}
                        >
                            <div className={cn(
                                "w-4 h-4 border rounded mr-2 flex items-center justify-center",
                                isSelected ? "bg-blue-500 border-blue-500" : "border-gray-300"
                            )}>
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span>{option.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div ref={wrapperRef} className={cn("relative inline-block", className)}>
            <div
                ref={triggerRef}
                onClick={handleToggle}
                className={cn(
                    "flex items-center gap-1 cursor-pointer hover:text-gray-700 transition-colors",
                    hasSelection && "text-blue-600 font-medium"
                )}
            >
                <span>{label}</span>
                <Filter className={cn("w-3 h-3", hasSelection ? "fill-current" : "text-gray-400")} />
            </div>
            {typeof document !== "undefined" && createPortal(dropdownContent, document.body)}
        </div>
    );
}
