import {
    calculateOpponentScoreChange,
    updateOpponentScore,
    isMatchEnded,
    hasMatchEnded,
} from "./match-logic";

describe("match-logic", () => {
    describe("calculateOpponentScoreChange", () => {
        it("赤が増えない場合はスコア変化なし", () => {
            expect(calculateOpponentScoreChange(0, 0)).toBe(0);
            expect(calculateOpponentScoreChange(1, 1)).toBe(0);
        });

        it("赤1つ追加で相手に1点", () => {
            // hansoku 0 (赤0個) -> 2 (赤1個)
            expect(calculateOpponentScoreChange(0, 2)).toBe(1);
            // hansoku 1 (黄1個) -> 3 (赤1個+黄1個)
            expect(calculateOpponentScoreChange(1, 3)).toBe(1);
        });

        it("赤2つで相手に2点", () => {
            // hansoku 0 (赤0個) -> 4 (赤2個)
            expect(calculateOpponentScoreChange(0, 4)).toBe(2);
        });

        it("複数段階での加算", () => {
            // hansoku 2 (赤1個) -> 4 (赤2個)
            expect(calculateOpponentScoreChange(2, 4)).toBe(1);
        });
    });

    describe("updateOpponentScore", () => {
        it("スコアは0未満にならない", () => {
            expect(updateOpponentScore(0, -1)).toBe(0);
            expect(updateOpponentScore(1, -5)).toBe(0);
        });

        it("スコアは2を超えない", () => {
            expect(updateOpponentScore(1, 2)).toBe(2);
            expect(updateOpponentScore(2, 1)).toBe(2);
        });

        it("正常なスコア更新", () => {
            expect(updateOpponentScore(0, 1)).toBe(1);
            expect(updateOpponentScore(1, 1)).toBe(2);
        });
    });

    describe("isMatchEnded", () => {
        it("反則4以上で試合終了", () => {
            expect(isMatchEnded(4, 0)).toBe(true);
            expect(isMatchEnded(4, 1)).toBe(true);
        });

        it("スコア2以上で試合終了", () => {
            expect(isMatchEnded(0, 2)).toBe(true);
            expect(isMatchEnded(1, 2)).toBe(true);
        });

        it("反則3、スコア1では試合継続", () => {
            expect(isMatchEnded(3, 1)).toBe(false);
        });

        it("反則0、スコア0では試合継続", () => {
            expect(isMatchEnded(0, 0)).toBe(false);
        });
    });

    describe("hasMatchEnded", () => {
        it("どちらかが試合終了条件を満たせば試合終了", () => {
            // 選手Aが赤2個
            expect(hasMatchEnded(0, 4, 0, 0)).toBe(true);
            // 選手Bが2点
            expect(hasMatchEnded(0, 0, 2, 0)).toBe(true);
        });

        it("どちらも試合継続条件なら試合継続", () => {
            expect(hasMatchEnded(1, 1, 1, 1)).toBe(false);
            expect(hasMatchEnded(0, 0, 0, 0)).toBe(false);
        });
    });
});
