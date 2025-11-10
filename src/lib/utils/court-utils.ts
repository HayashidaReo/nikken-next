/**
 * コート関連のユーティリティ関数
 */

interface Court {
    courtId: string;
    courtName: string;
}

/**
 * コートIDからコート名を取得する
 * 
 * @param courtId - 検索対象のコートID
 * @param courts - コート配列（オプション）
 * @returns コート名が見つかった場合はそれを返し、見つからない場合はコートIDをフォールバック表示
 * 
 * @example
 * const courtName = findCourtName("court-1", courts);
 * // => "Aコート" または "court-1"
 */
export function findCourtName(
    courtId: string,
    courts?: Court[] | null
): string {
    if (!courts || courts.length === 0) {
        return courtId;
    }

    const court = courts.find((c) => c.courtId === courtId);
    return court ? court.courtName : courtId;
}

/**
 * コート配列をバリデーションして、空でない場合のみ返す
 * 
 * @param courts - コート配列（オプション）
 * @returns 有効なコート配列、またはデフォルト空配列
 */
export function getValidCourts(courts?: Court[] | null): Court[] {
    return courts && Array.isArray(courts) && courts.length > 0 ? courts : [];
}
