/**
 * 日付関連のユーティリティ関数
 */

/**
 * Date型をYYYY-MM-DD形式の文字列に変換（HTML input[type="date"]用）
 * @param date 変換するDate型またはstring型の日付
 * @param allowEmpty 空文字列を許可するかどうか（新規作成時用）
 * @returns YYYY-MM-DD形式の文字列、無効な場合は空文字列
 */
export function formatDateToInputValue(date: Date | string | null | undefined, allowEmpty: boolean = false): string {
    if (!date) {
        return "";
    }

    let dateObj: Date;

    if (date instanceof Date) {
        dateObj = date;
    } else if (typeof date === 'string') {
        // ISO形式の場合はUTC時間を現地時間に変換してから日付を取得
        if (date.includes('T') && date.includes('Z')) {
            // UTC時間として解釈してから現地時間の日付を取得
            const utcDate = new Date(date);
            const year = utcDate.getFullYear();
            const month = utcDate.getMonth();
            const day = utcDate.getDate();
            dateObj = new Date(year, month, day, 0, 0, 0, 0); // 現地時間の0時として設定
        } else {
            dateObj = new Date(date);
        }
    } else {
        console.warn('formatDateToInputValue: Invalid date format', date);
        return "";
    }

    // 有効なDateかチェック
    if (isNaN(dateObj.getTime())) {
        console.warn('formatDateToInputValue: Invalid date', date);
        return "";
    }



    // タイムゾーンを考慮してローカル時間の年月日を取得
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // 月は0ベースなので+1
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * HTML input[type="date"]の値をDate型に変換（タイムゾーン考慮）
 * @param dateString YYYY-MM-DD形式の文字列
 * @returns Date型の日付、空文字列の場合はnull
 */
export function parseInputValueToDate(dateString: string): Date | null {
    if (!dateString) {
        return null;
    }

    // YYYY-MM-DD形式の文字列を現地時間の00:00:00として解釈
    // new Date("2025-11-06")だとUTCベースになるため、明示的に現地時間として設定
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day, 0, 0, 0, 0); // monthは0ベースなので-1
}

/**
 * 日付を表示用の文字列に変換
 * @param date 変換するDate型
 * @param locale ロケール（デフォルト: 'ja-JP'）
 * @returns 表示用の日付文字列（例: "2024年3月15日"）
 */
export function formatDateForDisplay(date: Date, locale: string = 'ja-JP'): string {
    if (!date || isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * 2つの日付が同じ日かどうかを判定
 * @param date1 比較する日付1
 * @param date2 比較する日付2
 * @returns 同じ日の場合true
 */
export function isSameDate(date1: Date, date2: Date): boolean {
    if (!date1 || !date2) return false;

    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}