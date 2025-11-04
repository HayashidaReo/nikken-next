/**
 * 選手名に関するユーティリティ関数
 */

export interface SplitNameResult {
  lastName: string;
  firstName: string;
  isValid: boolean;
}

/**
 * フルネームを姓名に分割する統一関数
 * @param fullName 「姓 名」形式の文字列
 * @returns 分割結果と有効性フラグ
 */
export function splitPlayerName(fullName: string): SplitNameResult {
  const trimmed = fullName.trim();

  if (!trimmed) {
    return {
      lastName: "",
      firstName: "",
      isValid: false,
    };
  }

  const parts = trimmed.split(/\s+/);

  // 2つ以上の部分があり、すべて空でない場合のみ有効
  if (parts.length >= 2 && parts.every(part => part.length > 0)) {
    return {
      lastName: parts[0],
      firstName: parts.slice(1).join(" "), // 複数の名前の部分を結合
      isValid: true,
    };
  }

  // 無効な場合はフォールバック（表示用）
  return {
    lastName: trimmed,
    firstName: "",
    isValid: false,
  };
}

/**
 * 選手名のフォーマットが正しいかバリデーション
 * @param fullName 検証する選手名
 * @returns バリデーション結果
 */
export function validatePlayerName(fullName: string): boolean {
  return splitPlayerName(fullName).isValid;
}

/**
 * 複数の選手名をバリデーション
 * @param playerNames 検証する選手名の配列
 * @returns 無効な選手名のインデックス配列
 */
export function validatePlayerNames(playerNames: string[]): number[] {
  return playerNames
    .map((name, index) => ({ name, index }))
    .filter(({ name }) => !validatePlayerName(name))
    .map(({ index }) => index);
}
