"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search, HelpCircle } from "lucide-react";

import { cn } from "@/lib/utils/utils";
import {
    calculateDropdownHeight,
    calculateListMaxHeight,
    shouldOpenAbove,
} from "./searchable-select.constants";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/atoms/tooltip";

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
    hasError?: boolean;
    hint?: string;
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
    hasError = false,
    hint,
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const [isKeyboardNavigating, setIsKeyboardNavigating] = useState(false);
    const [dropdownState, setDropdownState] = useState({
        top: 0,
        left: 0,
        width: 0,
        isAbove: false,
    });

    // --- Refs ---
    const wrapperRef = useRef<HTMLDivElement>(null); // コンポーネント全体のラッパー
    const triggerAreaRef = useRef<HTMLDivElement>(null); // クリック領域 (表示部分)
    const portalRef = useRef<HTMLDivElement>(null); // Portalで描画されるコンテナ
    const listRef = useRef<HTMLDivElement>(null); // オプションのリスト (スクロール用)
    const searchInputRef = useRef<HTMLInputElement>(null); // 検索入力
    const pointerDownRef = useRef(false); // マウス押下中フラグ
    const isInitialOpenRef = useRef(true); // 初回開いた時かどうかのフラグ
    const moveFromSearchOnceRef = useRef(false); // 検索→リストへの初回移動フラグ

    // --- Callbacks (Moved up) ---
    const resetNavigationState = useCallback(() => {
        setFocusedIndex(-1);
        setIsKeyboardNavigating(false);
        setSearchQuery('');
    }, []);

    const handleSearchChange = (newQuery: string) => {
        setSearchQuery(newQuery);
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

    // ドロップダウンの位置を計算する関数
    const calculateDropdownPosition = useCallback(() => {
        if (!wrapperRef.current) return null;

        const rect = wrapperRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const dropdownHeight = calculateDropdownHeight(filteredOptions.length);
        const isAbove = shouldOpenAbove(spaceBelow, spaceAbove, dropdownHeight);

        return {
            top: isAbove ? rect.top - dropdownHeight : rect.bottom,
            left: rect.left,
            width: rect.width,
            isAbove,
        };
    }, [filteredOptions.length]);

    const handleSelect = useCallback(
        (option: SearchableSelectOption) => {
            onValueChange(option.value);
            setIsOpen(false);
            resetNavigationState();
        },
        [onValueChange, resetNavigationState],
    );

    // --- Effects ---

    // 1. ドロップダウンが開いたときの処理 (初期フォーカス処理のみ)
    useEffect(() => {
        if (isOpen) {
            // オープン時に検索→リスト移動済みフラグをリセット
            moveFromSearchOnceRef.current = false;

            if (isInitialOpenRef.current) {
                const selectedIndex = value
                    ? options.findIndex((opt) => opt.value === value)
                    : -1;

                // 選択状態は保持するが、選択がなければfocusedIndexは-1にして検索優先にする
                // microTaskで状態更新を遅延させる
                Promise.resolve().then(() => {
                    setFocusedIndex(selectedIndex > -1 ? selectedIndex : -1);
                    setIsKeyboardNavigating(false);
                });

                // 検索入力にフォーカス
                requestAnimationFrame(() => {
                    searchInputRef.current?.focus();
                });

                isInitialOpenRef.current = false;
            }
        } else {
            // 閉じたときはキーボードナビゲーション状態をリセットし、次回開いた時は初回扱いにする
            Promise.resolve().then(() => {
                setIsKeyboardNavigating(false);
            });
            isInitialOpenRef.current = true;
        }
    }, [isOpen, value, options, filteredOptions.length]);

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
                const spaceBelow = window.innerHeight - rect.bottom;
                const spaceAbove = rect.top;
                const dropdownHeight = calculateDropdownHeight(filteredOptions.length);
                const isAbove = shouldOpenAbove(spaceBelow, spaceAbove, dropdownHeight);

                setDropdownState({
                    top: isAbove ? rect.top - dropdownHeight : rect.bottom,
                    left: rect.left,
                    width: rect.width,
                    isAbove,
                });
            }
        };

        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);
        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen, filteredOptions.length]);

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

            // キーボードナビゲーション中（リスト選択中）は検索窓判定を無視
            const isInSearchMode = isSearchInput && !isKeyboardNavigating;

            // 検索窓での通常の文字入力（テキスト入力、削除など）は処理しない
            if (isInSearchMode) {
                const isNavigationKey = ['ArrowDown', 'ArrowUp', 'Enter', 'Escape', 'Tab'].includes(event.key);
                if (!isNavigationKey) {
                    // 通常の文字入力なので、このハンドラーでは何もしない
                    return;
                }
            }

            const moveFocusFromSearch = (nextIndex?: number) => {
                event.preventDefault();
                event.stopPropagation();
                // キーボードナビゲーション状態を有効にする
                setIsKeyboardNavigating(true);

                if (typeof nextIndex === 'number') {
                    // 明示的なインデックス指定がある場合はそれを使う
                    setFocusedIndex(nextIndex);
                    return;
                }

                // nextIndexが指定されていない場合は初回移動かどうかで挙動を変える
                if (!moveFromSearchOnceRef.current) {
                    // 初回は現在の選択（value）位置の次の要素に移動する
                    const selectedIndexInFiltered = value
                        ? filteredOptions.findIndex((opt) => opt.value === value)
                        : -1;

                    let targetIndex = 0;
                    if (selectedIndexInFiltered >= 0) {
                        targetIndex = Math.min(selectedIndexInFiltered + 1, filteredOptions.length - 1);
                    } else {
                        targetIndex = 0;
                    }

                    setFocusedIndex(targetIndex);
                    moveFromSearchOnceRef.current = true;
                    return;
                }

                // 2回目以降はリストの先頭に移動
                setFocusedIndex(0);
            };

            if (isInSearchMode && event.key === 'Enter') {
                // 検索窓でEnterを押した場合は、検索文字の決定として扱う
                event.preventDefault();
                event.stopPropagation();
                return;
            }
            if (isInSearchMode && event.key === 'ArrowDown') {
                // 検索窓から(isInSearchMode)の下キー(ArrowDown)の場合は、
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
        isKeyboardNavigating,
        handleSelect,
        resetNavigationState,
        value,
    ]);

    // 5. フォーカス位置へのスクロール
    // マウス移動でフォーカスが変わった時に勝手にスクロールされないよう、
    // キーボードでナビゲーション中（isKeyboardNavigating === true）の場合のみ自動スクロールする。
    useEffect(() => {
        if (!isOpen || focusedIndex < 0 || !listRef.current) return;
        if (!isKeyboardNavigating) return; // マウスホバーなどによるfocusedIndex変更ではスクロールしない

        const list = listRef.current;
        const item = list.children[focusedIndex] as HTMLElement | undefined;
        if (item) {
            item.scrollIntoView({ block: 'nearest' });
        }
    }, [focusedIndex, isOpen, isKeyboardNavigating]);

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

                // requestAnimationFrameで次のフレームで位置を計算し、その後isOpenをtrueにする
                requestAnimationFrame(() => {
                    const newPosition = calculateDropdownPosition();
                    if (newPosition) {
                        setDropdownState(newPosition);
                    }
                    setIsOpen(true);
                });
            }
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

        if (willOpen) {
            // 開く際に、先に位置を計算して、その後isOpenを更新する
            resetNavigationState(); // 開くときにリセット

            // requestAnimationFrameで次のフレームで位置を計算し、その後isOpenをtrueにする
            requestAnimationFrame(() => {
                const newPosition = calculateDropdownPosition();
                if (newPosition) {
                    setDropdownState(newPosition);
                }
                setIsOpen(true);
            });
        } else {
            setIsOpen(willOpen);
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

            // requestAnimationFrameで次のフレームで位置を計算し、その後isOpenをtrueにする
            requestAnimationFrame(() => {
                const newPosition = calculateDropdownPosition();
                if (newPosition) {
                    setDropdownState(newPosition);
                }
                setIsOpen(true);
            });
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

    // リストの最大高さを動的に決定
    const listMaxHeight = calculateListMaxHeight(filteredOptions.length);

    // ドロップダウンのコンテンツ (Portalで描画)
    const dropdownContent = isOpen && (
        <div
            ref={portalRef}
            className={cn(
                'fixed z-[9999] rounded-md border border-gray-200 bg-white shadow-lg',
                'animate-in fade-in-0 zoom-in-95'
            )}
            style={{
                // 明示的に背景色を指定して、上表示時に透明になる問題を防ぐ
                backgroundColor: '#ffffff',
                top: `${dropdownState.top}px`,
                left: `${dropdownState.left}px`,
                width: `${Math.max(dropdownState.width, 240)}px`,
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
                className="overflow-y-auto py-1"
                style={{ maxHeight: filteredOptions.length > 0 ? `${listMaxHeight}px` : undefined }}
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
                                onMouseDown={(e) => {
                                    e.preventDefault(); // フォーカス移動を防ぐ
                                    handleSelect(option);
                                }}
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
        'flex w-full items-center justify-between rounded-md border bg-white px-3 text-sm',
        'cursor-pointer outline-none',
        // キーボードナビゲーション中はフォーカスリングを表示しない
        !isKeyboardNavigating && 'focus:ring-2 focus:ring-blue-500',
        disabled
            ? 'bg-gray-50 cursor-not-allowed opacity-50 border-gray-300'
            : hasError
                ? 'border-red-500 hover:border-red-600'
                : 'border-gray-300 hover:border-gray-400',
        !value ? 'text-gray-500' : 'text-gray-900',
        // classNameから高さクラスを抽出（h-8, h-10, h-12など）
        className?.match(/h-\d+/) ? className.match(/h-\d+/)![0] : 'h-8',
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
                {hint && (
                    <div
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{hint}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                )}
                <span className="pl-1 flex-1 truncate text-left">{selectedLabel}</span>
                <div className="flex items-center">
                    <ChevronDown
                        className={cn(
                            "h-4 w-4 text-gray-500 transition-transform",
                            isOpen && "rotate-180"
                        )}
                    />
                </div>
            </div>

            {/* Dropdown Portal */}
            {typeof document !== 'undefined' &&
                createPortal(dropdownContent, document.body)}
        </div>
    );
}