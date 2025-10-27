import { HANSOKU_LEVELS, type HansokuLevel } from "@/types/common";

/**
 * 反則カードの種類
 */
export type CardType = "yellow" | "red";

/**
 * 反則カード情報
 */
export interface PenaltyCard {
    type: CardType;
}

/**
 * 反則による得点自動計算
 * 赤反則時に相手の得点を+1する
 */
export function calculateScoreFromHansoku(
  currentScore: number,
  newHansoku: number,
  oldHansoku: number = 0
): number {
  let scoreChange = 0;

  // 赤反則になった場合（2: red, 4: red_red）
  if ((newHansoku === 2 || newHansoku === 4) && oldHansoku < 2) {
    scoreChange += 1;
  }

  // 赤+黄から赤+赤になった場合
  if (newHansoku === 4 && oldHansoku === 3) {
    scoreChange += 1;
  }

  // 反則が戻された場合
  if ((oldHansoku === 2 || oldHansoku === 4) && newHansoku < 2) {
    scoreChange -= 1;
  }

  if (oldHansoku === 4 && newHansoku === 3) {
    scoreChange -= 1;
  }

  return Math.max(0, Math.min(2, currentScore + scoreChange));
}

/**
 * 反則レベルに応じたカード配列を取得
 */
export const getPenaltyCards = (hansokuLevel: HansokuLevel): PenaltyCard[] => {
    switch (hansokuLevel) {
        case HANSOKU_LEVELS.NONE:
            return [];
        case HANSOKU_LEVELS.YELLOW:
            return [{ type: "yellow" }];
        case HANSOKU_LEVELS.RED:
            return [{ type: "red" }];
        case HANSOKU_LEVELS.RED_YELLOW:
            return [{ type: "red" }, { type: "yellow" }];
        case HANSOKU_LEVELS.RED_RED:
            return [{ type: "red" }, { type: "red" }];
        default:
            return [];
    }
};

/**
 * 反則レベルに応じた説明文を取得
 */
export const getHansokuDescription = (hansokuLevel: HansokuLevel): string => {
    switch (hansokuLevel) {
        case HANSOKU_LEVELS.NONE:
            return "反則なし";
        case HANSOKU_LEVELS.YELLOW:
            return "イエローカード";
        case HANSOKU_LEVELS.RED:
            return "レッドカード";
        case HANSOKU_LEVELS.RED_YELLOW:
            return "レッドカード + イエローカード";
        case HANSOKU_LEVELS.RED_RED:
            return "レッドカード2枚";
        default:
            return "不明";
    }
};

/**
 * カードタイプに応じたCSSクラスを取得
 */
export const getCardStyles = (cardType: CardType): string => {
    const baseStyles = "w-16 h-24 rounded-md border-2 border-white shadow-lg";
    const colorStyles = {
        yellow: "bg-yellow-400",
        red: "bg-red-600"
    };

    return `${baseStyles} ${colorStyles[cardType]}`;
};