/**
 * 日付関連のユーティリティ関数
 */

/**
 * 入力が有効な日付かどうかを判定する型ガード
 */
function isValidDate(date: unknown): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * ISO形式の文字列かどうかを判定
 */
function isISOString(str: string): boolean {
  return str.includes("T") && str.includes("Z");
}

/**
 * UTC時間のISO文字列を現地時間のDateオブジェクトに変換
 */
function convertUTCStringToLocalDate(isoString: string): Date {
  const utcDate = new Date(isoString);
  const year = utcDate.getFullYear();
  const month = utcDate.getMonth();
  const day = utcDate.getDate();
  return new Date(year, month, day, 0, 0, 0, 0);
}

/**
 * 任意の日付入力を安全にDateオブジェクトに変換
 */
function parseToDate(input: Date | string | null | undefined): Date | null {
  if (!input) {
    return null;
  }

  let dateObj: Date;

  if (input instanceof Date) {
    dateObj = input;
  } else if (typeof input === "string") {
    if (isISOString(input)) {
      dateObj = convertUTCStringToLocalDate(input);
    } else {
      dateObj = new Date(input);
    }
  } else {
    return null;
  }

  return isValidDate(dateObj) ? dateObj : null;
}

/**
 * DateオブジェクトをYYYY-MM-DD形式の文字列に変換
 */
function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Date型をYYYY-MM-DD形式の文字列に変換（HTML input[type="date"]用）
 * @param date 変換するDate型またはstring型の日付
 * @returns YYYY-MM-DD形式の文字列、無効な場合は空文字列
 */
export function formatDateToInputValue(
  date: Date | string | null | undefined
): string {
  const dateObj = parseToDate(date);

  if (!dateObj) {
    return "";
  }

  return formatDateToString(dateObj);
}
/**
 * YYYY-MM-DD形式の文字列を現地時間の00:00:00のDateオブジェクトに変換
 */
function parseYMDStringToDate(dateString: string): Date | null {
  const parts = dateString.split("-");
  if (parts.length !== 3) return null;

  const [year, month, day] = parts.map(Number);

  // 基本的な範囲チェック
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  if (year < 1900 || year > 2100) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;

  const date = new Date(year, month - 1, day, 0, 0, 0, 0);

  // 実際の日付として有効かチェック（例：2024-02-30は無効）
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
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

  try {
    return parseYMDStringToDate(dateString);
  } catch {
    return null;
  }
}

/**
 * 日付を表示用の文字列に変換
 * @param date 変換するDate型
 * @param locale ロケール（デフォルト: 'ja-JP'）
 * @returns 表示用の日付文字列（例: "2024年3月15日"）
 */
export function formatDateForDisplay(
  date: Date | null | undefined,
  locale: string = "ja-JP"
): string {
  const dateObj = parseToDate(date);

  if (!dateObj) {
    return "";
  }

  return dateObj.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * 2つの日付が同じ日かどうかを判定
 * @param date1 比較する日付1
 * @param date2 比較する日付2
 * @returns 同じ日の場合true
 */
export function isSameDate(
  date1: Date | null | undefined,
  date2: Date | null | undefined
): boolean {
  if (!isValidDate(date1) || !isValidDate(date2)) {
    return false;
  }

  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
