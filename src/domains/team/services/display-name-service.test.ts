import { generateDisplayNames } from "./display-name-service";

describe("generateDisplayNames", () => {
    it("should return last name when there are no duplicates", () => {
        const players = [
            { lastName: "山田", firstName: "太郎", displayName: "" },
            { lastName: "鈴木", firstName: "次郎", displayName: "" },
        ];
        const result = generateDisplayNames(players);
        expect(result).toEqual([
            { index: 0, displayName: "山田" },
            { index: 1, displayName: "鈴木" },
        ]);
    });

    it("should return last name + first char when last names are duplicated", () => {
        const players = [
            { lastName: "山田", firstName: "太郎", displayName: "" },
            { lastName: "山田", firstName: "次郎", displayName: "" },
        ];
        const result = generateDisplayNames(players);
        expect(result).toEqual([
            { index: 0, displayName: "山田 太" },
            { index: 1, displayName: "山田 次" },
        ]);
    });

    it("should return full name when last name and first char are duplicated", () => {
        const players = [
            { lastName: "山田", firstName: "太郎", displayName: "" },
            { lastName: "山田", firstName: "太一", displayName: "" },
        ];
        const result = generateDisplayNames(players);
        expect(result).toEqual([
            { index: 0, displayName: "山田 太郎" },
            { index: 1, displayName: "山田 太一" },
        ]);
    });

    it("should handle mixed cases correctly", () => {
        const players = [
            { lastName: "山田", firstName: "太郎", displayName: "" }, // 重複なし
            { lastName: "鈴木", firstName: "一郎", displayName: "" }, // 重複あり
            { lastName: "鈴木", firstName: "次郎", displayName: "" }, // 重複あり
            { lastName: "佐藤", firstName: "健", displayName: "" }, // 重複あり（1文字目も同じ）
            { lastName: "佐藤", firstName: "健太", displayName: "" }, // 重複あり（1文字目も同じ）
        ];
        const result = generateDisplayNames(players);

        // 順不同で検証するためにソートするか、個別にチェック
        // 今回はインデックス順に期待値を設定
        const expected = [
            { index: 0, displayName: "山田" },
            { index: 1, displayName: "鈴木 一" },
            { index: 2, displayName: "鈴木 次" },
            { index: 3, displayName: "佐藤 健" },
            { index: 4, displayName: "佐藤 健太" },
        ];

        expect(result).toEqual(expect.arrayContaining(expected));
        expect(result).toHaveLength(5);
    });

    it("should not return update if displayName is already correct", () => {
        const players = [
            { lastName: "山田", firstName: "太郎", displayName: "山田" },
        ];
        const result = generateDisplayNames(players);
        expect(result).toEqual([]);
    });

    it("should handle empty input", () => {
        const result = generateDisplayNames([]);
        expect(result).toEqual([]);
    });

    it("should handle missing first name gracefully", () => {
        const players = [
            { lastName: "山田", firstName: "", displayName: "" },
            { lastName: "山田", firstName: "次郎", displayName: "" },
        ];
        // 山田 (名なし) -> 山田 
        // 山田 次郎 -> 山田 次
        const result = generateDisplayNames(players);
        expect(result).toEqual([
            { index: 0, displayName: "山田 " }, // 空文字の1文字目は空文字
            { index: 1, displayName: "山田 次" },
        ]);
    });
});
