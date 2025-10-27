import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind CSSのクラス名を結合する関数
 * clsx + tailwind-merge の組み合わせ
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
