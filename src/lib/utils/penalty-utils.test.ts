import { HANSOKU_LEVELS } from "@/types/common";
import {
  getPenaltyCards,
  getHansokuDescription,
  getCardStyles,
  calculateScoreFromHansoku,
} from "./penalty-utils";

describe("penalty-utils", () => {
  describe("getPenaltyCards", () => {
    it("反則なしの場合は空配列を返す", () => {
      const result = getPenaltyCards(HANSOKU_LEVELS.NONE);
      expect(result).toEqual([]);
    });

    it("イエローカードの場合は黄色カード1枚を返す", () => {
      const result = getPenaltyCards(HANSOKU_LEVELS.YELLOW);
      expect(result).toEqual([{ type: "yellow" }]);
    });

    it("レッドカードの場合は赤カード1枚を返す", () => {
      const result = getPenaltyCards(HANSOKU_LEVELS.RED);
      expect(result).toEqual([{ type: "red" }]);
    });

    it("レッド+イエローの場合は赤カードと黄色カードを返す", () => {
      const result = getPenaltyCards(HANSOKU_LEVELS.RED_YELLOW);
      expect(result).toEqual([{ type: "red" }, { type: "yellow" }]);
    });

    it("レッド2枚の場合は赤カード2枚を返す", () => {
      const result = getPenaltyCards(HANSOKU_LEVELS.RED_RED);
      expect(result).toEqual([{ type: "red" }, { type: "red" }]);
    });

    it("無効な反則レベルの場合は空配列を返す", () => {
      // 存在しない反則レベルをテスト - TypeScriptの型チェックを迂回
      const invalidLevel = 999 as never;
      const result = getPenaltyCards(invalidLevel);
      expect(result).toEqual([]);
    });
  });

  describe("getHansokuDescription", () => {
    it("反則なしの場合は適切な説明を返す", () => {
      const result = getHansokuDescription(HANSOKU_LEVELS.NONE);
      expect(result).toBe("反則なし");
    });

    it("イエローカードの場合は適切な説明を返す", () => {
      const result = getHansokuDescription(HANSOKU_LEVELS.YELLOW);
      expect(result).toBe("イエローカード");
    });

    it("レッドカードの場合は適切な説明を返す", () => {
      const result = getHansokuDescription(HANSOKU_LEVELS.RED);
      expect(result).toBe("レッドカード");
    });

    it("レッド+イエローの場合は適切な説明を返す", () => {
      const result = getHansokuDescription(HANSOKU_LEVELS.RED_YELLOW);
      expect(result).toBe("レッドカード + イエローカード");
    });

    it("レッド2枚の場合は適切な説明を返す", () => {
      const result = getHansokuDescription(HANSOKU_LEVELS.RED_RED);
      expect(result).toBe("レッドカード2枚");
    });

    it("無効な反則レベルの場合は「不明」を返す", () => {
      // 存在しない反則レベルをテスト - TypeScriptの型チェックを迂回
      const invalidLevel = 999 as never;
      const result = getHansokuDescription(invalidLevel);
      expect(result).toBe("不明");
    });
  });

  describe("getCardStyles", () => {
    const baseStyles = "w-16 h-24 rounded-md border-2 border-white shadow-lg";

    it("イエローカードの場合は適切なスタイルを返す", () => {
      const result = getCardStyles("yellow");
      expect(result).toBe(`${baseStyles} bg-yellow-400`);
    });

    it("レッドカードの場合は適切なスタイルを返す", () => {
      const result = getCardStyles("red");
      expect(result).toBe(`${baseStyles} bg-red-600`);
    });

    it("返されるスタイルに基本スタイルが含まれている", () => {
      const yellowResult = getCardStyles("yellow");
      const redResult = getCardStyles("red");

      expect(yellowResult).toContain("w-16");
      expect(yellowResult).toContain("h-24");
      expect(yellowResult).toContain("rounded-md");
      expect(yellowResult).toContain("border-2");
      expect(yellowResult).toContain("border-white");
      expect(yellowResult).toContain("shadow-lg");

      expect(redResult).toContain("w-16");
      expect(redResult).toContain("h-24");
      expect(redResult).toContain("rounded-md");
      expect(redResult).toContain("border-2");
      expect(redResult).toContain("border-white");
      expect(redResult).toContain("shadow-lg");
    });
  });

  describe("calculateScoreFromHansoku", () => {
    it("赤反則時に得点が1増加する", () => {
      const result = calculateScoreFromHansoku(0, 2, 0); // none -> red
      expect(result).toBe(1);
    });

    it("赤+赤反則時に得点が1増加する", () => {
      const result = calculateScoreFromHansoku(1, 4, 0); // none -> red_red
      expect(result).toBe(2);
    });

    it("赤+黄から赤+赤になった時に得点が1増加する", () => {
      const result = calculateScoreFromHansoku(1, 4, 3); // red_yellow -> red_red
      expect(result).toBe(2);
    });

    it("赤反則から戻された時に得点が1減少する", () => {
      const result = calculateScoreFromHansoku(2, 1, 2); // red -> yellow
      expect(result).toBe(1);
    });

    it("赤+赤から赤+黄に戻された時に得点が1減少する", () => {
      const result = calculateScoreFromHansoku(2, 3, 4); // red_red -> red_yellow
      expect(result).toBe(1);
    });

    it("得点は0未満にならない", () => {
      const result = calculateScoreFromHansoku(0, 1, 2); // red -> yellow (score 0)
      expect(result).toBe(0);
    });

    it("得点は2を超えない", () => {
      const result = calculateScoreFromHansoku(2, 4, 0); // none -> red_red (score 2)
      expect(result).toBe(2);
    });

    it("黄反則の変更では得点は変わらない", () => {
      const result = calculateScoreFromHansoku(1, 1, 0); // none -> yellow
      expect(result).toBe(1);
    });
  });
});
