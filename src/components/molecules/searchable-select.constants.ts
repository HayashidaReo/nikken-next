/**
 * SearchableSelect コンポーネントのレイアウト定数とユーティリティ
 */

// ===== Layout Constants =====
export const SEARCHABLE_SELECT_LAYOUT = {
    // 各リスト項目の高さ (Tailwindの py-2 相当: 0.5rem * 2 + line-height)
    ITEM_HEIGHT: 40,

    // 検索入力領域の高さのおおよその値 (検索入力 h-8 + padding p-2)
    SEARCH_AREA_HEIGHT: 50,

    // リストが6個以上の時の固定ドロップダウン高さ
    DROPDOWN_MAX_FIXED: 280,

    // リストのパディング (py-1)
    LIST_PADDING_VERTICAL: 8,
} as const;

// ===== Dropdown Height Calculation =====
/**
 * ドロップダウンの高さを計算する
 * @param filteredOptionsLength フィルタ後のオプション数
 * @returns ドロップダウンの高さ (px)
 */
export function calculateDropdownHeight(filteredOptionsLength: number): number {
    if (filteredOptionsLength >= 6) {
        return SEARCHABLE_SELECT_LAYOUT.DROPDOWN_MAX_FIXED;
    }

    return (
        SEARCHABLE_SELECT_LAYOUT.SEARCH_AREA_HEIGHT +
        filteredOptionsLength * SEARCHABLE_SELECT_LAYOUT.ITEM_HEIGHT +
        SEARCHABLE_SELECT_LAYOUT.LIST_PADDING_VERTICAL
    );
}

// ===== List Max Height Calculation =====
/**
 * リストのmax-heightを計算する
 * @param filteredOptionsLength フィルタ後のオプション数
 * @returns リストのmax-height (px)
 */
export function calculateListMaxHeight(filteredOptionsLength: number): number | undefined {
    if (filteredOptionsLength === 0) {
        return undefined;
    }

    if (filteredOptionsLength >= 6) {
        return (
            SEARCHABLE_SELECT_LAYOUT.DROPDOWN_MAX_FIXED -
            SEARCHABLE_SELECT_LAYOUT.SEARCH_AREA_HEIGHT -
            SEARCHABLE_SELECT_LAYOUT.LIST_PADDING_VERTICAL
        );
    }

    return filteredOptionsLength * SEARCHABLE_SELECT_LAYOUT.ITEM_HEIGHT;
}

// ===== Positioning Logic =====
/**
 * ドロップダウンを上に表示するかを判定する
 * @param spaceBelow 下のスペース (px)
 * @param spaceAbove 上のスペース (px)
 * @param dropdownHeight ドロップダウンの高さ (px)
 * @returns true なら上に表示、false なら下に表示
 */
export function shouldOpenAbove(
    spaceBelow: number,
    spaceAbove: number,
    dropdownHeight: number
): boolean {
    // 下に十分なスペースがない場合、かつ上に十分なスペースがある場合は上に表示
    return spaceBelow < dropdownHeight && spaceAbove >= dropdownHeight;
}
