import {
    generateDisplayNames,
    calculateScoreFromHansoku,
    cn,
} from "./utils";

describe("Utils Functions", () => {
    describe("cn (className merger)", () => {
        it("クラス名を正しく結合できる", () => {
            const result = cn("bg-red-500", "text-white");
            expect(result).toContain("bg-red-500");
            expect(result).toContain("text-white");
        });

        it("条件付きクラス名を処理できる", () => {
            const isActive = true;
            const result = cn("base-class", isActive && "active-class");
            expect(result).toContain("base-class");
            expect(result).toContain("active-class");
        });

        it("Tailwindの重複クラスをマージできる", () => {
            const result = cn("p-4", "p-2");
            expect(result).toBe("p-2");
        });
    });

    describe("generateDisplayNames", () => {
        it("同姓がない場合は姓のみを返す", () => {
            const players = [
                { lastName: "山田", firstName: "太郎" },
                { lastName: "鈴木", firstName: "一郎" },
            ];
            const result = generateDisplayNames(players);

            expect(result[0].displayName).toBe("山田");
            expect(result[1].displayName).toBe("鈴木");
        });

        it("同姓がある場合は名の一部を含める", () => {
            const players = [
                { lastName: "山田", firstName: "太郎" },
                { lastName: "山田", firstName: "健太" },
                { lastName: "鈴木", firstName: "一郎" },
            ];
            const result = generateDisplayNames(players);

            expect(result[0].displayName).toBe("山田 太");
            expect(result[1].displayName).toBe("山田 健");
            expect(result[2].displayName).toBe("鈴木");
        });

        it("名の最初の文字も重複する場合はフルネームにする", () => {
            const players = [
                { lastName: "山田", firstName: "太郎" },
                { lastName: "山田", firstName: "太一" },
                { lastName: "山田", firstName: "健太" },
            ];
            const result = generateDisplayNames(players);

            expect(result[0].displayName).toBe("山田 太郎");
            expect(result[1].displayName).toBe("山田 太一");
            expect(result[2].displayName).toBe("山田 健");
        });

        it("空の配列を処理できる", () => {
            const result = generateDisplayNames([]);
            expect(result).toEqual([]);
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
