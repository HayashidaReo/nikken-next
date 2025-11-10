"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search } from "lucide-react";

import { cn } from "@/lib/utils/utils";

export interface SearchableSelectOption {
    value: string;
    label: string;
}

interface SearchableSelectProps {
    value?: string;
    onValueChange: (value: string) => void;
    options: SearchableSelectOption[];
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    searchPlaceholder?: string;
    'data-field-key'?: string;
}

export function SearchableSelect({
    value,
    onValueChange,
    options,
    placeholder = '選択してください',
    disabled = false,
    className,
    searchPlaceholder = '検索...',
    'data-field-key': dataFieldKey,
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const [isKeyboardNavigating, setIsKeyboardNavigating] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({
        top: 0,
        left: 0,
        width: 0,
    });

    // --- Refs ---
    const wrapperRef = useRef<HTMLDivElement>(null); // コンポーネント全体のラッパー
    const triggerAreaRef = useRef<HTMLDivElement>(null); // クリック領域 (表示部分)
    const portalRef = useRef<HTMLDivElement>(null); // Portalで描画されるコンテナ
    const listRef = useRef<HTMLDivElement>(null); // オプションのリスト (スクロール用)
    const searchInputRef = useRef<HTMLInputElement>(null); // 検索入力
    const pointerDownRef = useRef(false); // マウス押下中フラグ

    // --- Callbacks (Moved up) ---
    const resetNavigationState = useCallback(() => {
        setFocusedIndex(-1);
        setIsKeyboardNavigating(false);
        setSearchQuery('');
    }, []);

    const handleSelect = useCallback(
        (option: SearchableSelectOption) => {
            onValueChange(option.value);
            setIsOpen(false);
            resetNavigationState();
        },
        [onValueChange, resetNavigationState],
    );

    const handleSearchChange = (newQuery: string) => {
        setSearchQuery(newQuery);
        setFocusedIndex(0); // 検索クエリ変更時はリストの先頭にフォーカス (ハイライトのみ)
        // キーボードナビゲーション状態は変更しない（検索窓にフォーカスを維持）
    };

    const handleMouseEnter = (index: number) => {
        setIsKeyboardNavigating(false); // マウスが乗ったらキーボード操作解除
        setFocusedIndex(index);
    };

    // --- Memos ---
    // 検索クエリに基づいてオプションをフィルタリング
    const filteredOptions = useMemo(() => {
        if (!searchQuery) return options;
        const query = searchQuery.toLowerCase();
        return options.filter((opt) => opt.label.toLowerCase().includes(query));
    }, [options, searchQuery]);

    // 選択中の値の表示ラベル
    const selectedLabel = useMemo(() => {
        const selected = options.find((opt) => opt.value === value);
        return selected?.label || placeholder;
    }, [value, options, placeholder]);

    // --- Effects ---

    // 1. ドロップダウンが開いたときの処理 (位置計算 / 初期フォーカス)
    useEffect(() => {
        if (isOpen) {
            // ドロップダウンの位置を計算
            if (wrapperRef.current) {
                const rect = wrapperRef.current.getBoundingClientRect();
                setDropdownPosition({
                    top: rect.bottom + window.scrollY,
                    left: rect.left + window.scrollX,
                    width: rect.width,
                });
            }

            // 選択中のアイテムにフォーカスを合わせる（初期表示時のみ）
            const selectedIndex = value
                ? options.findIndex((opt) => opt.value === value)
                : -1;

            const initialIndex = selectedIndex > -1 ? selectedIndex : 0;
            setFocusedIndex(initialIndex);

            // キーボードナビゲーション状態を有効にして、選択項目にフォーカスを当てる
            setIsKeyboardNavigating(true);
        } else {
            // 閉じたときはキーボードナビゲーション状態をリセット
            setIsKeyboardNavigating(false);
        }
    }, [isOpen, value, options]);

    // 2. 外部クリック検知 (Portal対応)
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
                resetNavigationState();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, resetNavigationState]);

    // 3. スクロール/リサイズ時の位置更新 (Portal対応)
    useEffect(() => {
        if (!isOpen) return;
        const updatePosition = () => {
            if (wrapperRef.current) {
                const rect = wrapperRef.current.getBoundingClientRect();
                setDropdownPosition({
                    top: rect.bottom + window.scrollY,
                    left: rect.left + window.scrollX,
                    width: rect.width,
                });
            }
        };

        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);
        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen]);

    // 4. グローバルなキーボード操作 (ドロップダウン開時)
    useEffect(() => {
        if (!isOpen) return;

        const handleGlobalKeyDown = (event: KeyboardEvent) => {
            // このコンポーネント内部以外でのキー押下は無視
            const target = event.target as Node;
            if (
                !wrapperRef.current?.contains(target) &&
                !portalRef.current?.contains(target)
            ) {
                return;
            }

            const targetEl = event.target as HTMLElement | null;
            const isSearchInput = targetEl === searchInputRef.current;

            // 検索窓での通常の文字入力（テキスト入力、削除など）は処理しない
            if (isSearchInput) {
                const isNavigationKey = ['ArrowDown', 'ArrowUp', 'Enter', 'Escape', 'Tab'].includes(event.key);
                if (!isNavigationKey) {
                    // 通常の文字入力なので、このハンドラーでは何もしない
                    return;
                }
            }

            const moveFocusFromSearch = (nextIndex?: number) => {
                event.preventDefault();
                event.stopPropagation();
                // searchInputRef.current?.blur(); // 明示的なblur()は削除

                requestAnimationFrame(() => {
                    // wrapperRefにフォーカスを戻す
                    wrapperRef.current?.focus();
                    setIsKeyboardNavigating(true);
                    // nextIndex が number の場合のみ、focusedIndex を更新
                    if (typeof nextIndex === 'number') {
                        setFocusedIndex(nextIndex);
                    }
                });
            };

            if (isSearchInput && event.key === 'Enter') {
                // 検索窓でEnterを押した場合は、検索文字の決定として扱う
                event.preventDefault();
                event.stopPropagation();
                return;
            }
            if (isSearchInput && event.key === 'ArrowDown') {
                // 検索窓から(isSearchInput)の下キー(ArrowDown)の場合は、
                // 強制的にリストの先頭(0)にフォーカスする
                moveFocusFromSearch(0);
                return;
            }

            switch (event.key) {
                case 'ArrowDown':
                    event.preventDefault();
                    event.stopPropagation();
                    setIsKeyboardNavigating(true);
                    setFocusedIndex((prev) =>
                        prev < filteredOptions.length - 1 ? prev + 1 : prev,
                    );
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    event.stopPropagation();
                    if (focusedIndex <= 0) {
                        setFocusedIndex(-1);
                        setIsKeyboardNavigating(false); // 検索に戻るのでキー操作解除
                        searchInputRef.current?.focus();
                        return;
                    }
                    setIsKeyboardNavigating(true);
                    setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
                    break;
                case 'Enter': {
                    event.preventDefault();
                    event.stopPropagation();
                    const categoryToSelect =
                        focusedIndex >= 0 ? filteredOptions[focusedIndex] : undefined;
                    if (categoryToSelect) {
                        handleSelect(categoryToSelect);
                    }
                    break;
                }
                case 'Escape':
                    event.preventDefault();
                    event.stopPropagation();
                    setIsOpen(false);
                    resetNavigationState();
                    break;
            }
        };

        document.addEventListener('keydown', handleGlobalKeyDown);
        return () => document.removeEventListener('keydown', handleGlobalKeyDown);
    }, [
        isOpen,
        filteredOptions,
        focusedIndex,
        handleSelect, // 依存配列に追加
        resetNavigationState, // 依存配列に追加
        value, // 依存配列に追加 (削除 - valueはfilteredOptionsの計算に使われるため不要)
    ]);

    // 5. フォーカス位置へのスクロール
    useEffect(() => {
        if (!isOpen || focusedIndex < 0 || !listRef.current) return;
        const list = listRef.current;
        const item = list.children[focusedIndex] as HTMLElement | undefined;
        if (item) {
            item.scrollIntoView({ block: 'nearest' });
        }
    }, [focusedIndex, isOpen]);

    // --- Handlers ---

    const isInTriggerArea = (target: EventTarget | null) => {
        if (!(target instanceof Node)) return false;
        return triggerAreaRef.current?.contains(target) ?? false;
    };

    // --- ラッパーのイベントハンドラ ---
    const handleWrapperFocus = (event: React.FocusEvent<HTMLDivElement>) => {
        if (event.target !== event.currentTarget || disabled) return;
        if (!pointerDownRef.current) {
            // 既に開いている場合はリセットしない
            if (!isOpen) {
                resetNavigationState(); // 開くときにリセット
            }
            setIsOpen(true);
        }
    };

    const handleWrapperBlur = (event: React.FocusEvent<HTMLDivElement>) => {
        if (disabled) return;
        const nextTarget = event.relatedTarget as Node | null;
        // Portal内部にフォーカスが移った場合は閉じない
        if (nextTarget && portalRef.current?.contains(nextTarget)) {
            return;
        }
        pointerDownRef.current = false;
        setIsOpen(false);
        resetNavigationState();
    };

    const handleWrapperClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (disabled || !isInTriggerArea(event.target)) return;
        const willOpen = !isOpen; // これから開くかどうか
        setIsOpen(willOpen);
        if (willOpen) {
            resetNavigationState(); // 開くときにリセット
        }
    };

    const handleWrapperKeyDown = (
        event: React.KeyboardEvent<HTMLDivElement>,
    ) => {
        if (disabled) return;
        // 開いている間のナビゲーションキーはGlobalKeyDownが処理するので、
        // ここでは伝播を止めない (stopPropagationしない)
        if (
            isOpen &&
            (event.key === 'ArrowDown' ||
                event.key === 'ArrowUp' ||
                event.key === 'Enter' ||
                event.key === 'Escape')
        ) {
            event.preventDefault();
            // event.stopPropagation(); // 削除: GlobalKeyDownにイベントを届ける
            return;
        }

        // 閉じてる時にEnterか矢印キーで開く
        if (!isOpen && (event.key === 'Enter' || event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
            event.preventDefault();
            event.stopPropagation();
            resetNavigationState(); // 開くときにリセット
            setIsOpen(true);
            return;
        }

        if (event.key === 'Tab') {
            setIsOpen(false);
            resetNavigationState();
        }
    };

    const handleWrapperMouseDown = (
        event: React.MouseEvent<HTMLDivElement>,
    ) => {
        if (disabled) return;
        pointerDownRef.current = isInTriggerArea(event.target);
    };

    const handleWrapperMouseUp = () => {
        pointerDownRef.current = false;
    };

    // --- Render ---

    // ドロップダウンのコンテンツ (Portalで描画)
    const dropdownContent = isOpen && (
        <div
            ref={portalRef}
            className={cn(
                'fixed z-[9999] rounded-md border border-gray-200 bg-white shadow-lg',
                'animate-in fade-in-0 zoom-in-95',
            )}
            style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                width: `${Math.max(dropdownPosition.width, 240)}px`,
                minWidth: '240px',
            }}
        >
            {/* Search Input */}
            <div className="p-2 border-b border-gray-200">
                <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="w-full h-8 pl-8 pr-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onFocus={(e) => {
                            e.stopPropagation();
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    />
                </div>
            </div>

            {/* Options List */}
            <div
                ref={listRef}
                id="searchable-select-listbox"
                className="max-h-60 overflow-y-auto py-1"
                role="listbox"
                onMouseDown={(e) => e.preventDefault()}
            >
                {filteredOptions.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500 text-center">
                        {searchQuery
                            ? '該当する項目がありません'
                            : '項目がありません'}
                    </div>
                ) : (
                    filteredOptions.map((option, index) => {
                        const isSelected = option.value === value;
                        const isHighlighted = index === focusedIndex;

                        const itemClasses = cn(
                            'relative flex items-center justify-between px-3 py-2 text-sm cursor-pointer',
                            'transition-colors',
                            isHighlighted && 'bg-blue-100', // キーボードフォーカス
                            !isHighlighted && isSelected && 'bg-blue-50', // 選択済み
                            isSelected && 'font-medium',
                        );

                        return (
                            <div
                                key={option.value}
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => handleSelect(option)}
                                onMouseEnter={() => handleMouseEnter(index)}
                                className={itemClasses}
                            >
                                <span className="truncate">{option.label}</span>
                                {isSelected && <Check className="h-4 w-4 flex-shrink-0 ml-2" />}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );

    // トリガー（表示部分）の動的クラス
    const triggerClasses = [
        'flex h-8 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-1 text-sm',
        'cursor-pointer outline-none',
        // キーボードナビゲーション中はフォーカスリングを表示しない
        !isKeyboardNavigating && 'focus:ring-2 focus:ring-blue-500',
        disabled
            ? 'bg-gray-50 cursor-not-allowed opacity-50'
            : 'border-gray-300 hover:border-gray-400',
        !value ? 'text-gray-500' : 'text-gray-900',
    ];

    return (
        <div
            ref={wrapperRef}
            className={cn('relative', className)}
            data-field-key={dataFieldKey}
            tabIndex={disabled ? -1 : 0}
            role="combobox"
            aria-controls="searchable-select-listbox"
            aria-expanded={!disabled && isOpen}
            aria-disabled={disabled || undefined}
            data-disabled={disabled ? 'true' : undefined}
            onFocus={handleWrapperFocus}
            onBlur={handleWrapperBlur}
            onClick={handleWrapperClick}
            onKeyDown={handleWrapperKeyDown}
            onMouseDown={handleWrapperMouseDown}
            onMouseUp={handleWrapperMouseUp}
        >
            {/* Main Input Display (Trigger) */}
            <div
                ref={triggerAreaRef}
                className={cn(...triggerClasses)}
            >
                <span className="truncate">{selectedLabel}</span>
                <ChevronDown
                    className={cn(
                        "h-4 w-4 text-gray-500 transition-transform",
                        isOpen && "rotate-180"
                    )}
                />
            </div>

            {/* Dropdown Portal */}
            {typeof document !== 'undefined' &&
                createPortal(dropdownContent, document.body)}
        </div>
    );
}