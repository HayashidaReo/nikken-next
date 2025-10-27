import {
  getPlayerVariantStyles,
  getPlayerDisplayName,
  getPlayerPositionClass,
  generateDisplayNames
} from "./player-utils";

describe("player-utils", () => {
  describe("getPlayerVariantStyles", () => {
    it("赤選手バリアントの場合は適切なスタイルを返す", () => {
      const result = getPlayerVariantStyles("red");
      
      expect(result).toEqual({
        background: "bg-gradient-to-br from-red-600 to-red-800",
        text: "text-white",
        accent: "text-red-100"
      });
    });

    it("白選手バリアントの場合は適切なスタイルを返す", () => {
      const result = getPlayerVariantStyles("white");
      
      expect(result).toEqual({
        background: "bg-gradient-to-br from-gray-300 to-gray-400",
        text: "text-black",
        accent: "text-gray-700"
      });
    });

    it("返されるスタイルオブジェクトに必要なプロパティが含まれている", () => {
      const redStyles = getPlayerVariantStyles("red");
      const whiteStyles = getPlayerVariantStyles("white");

      // 両方のバリアントでプロパティが存在することを確認
      expect(redStyles).toHaveProperty("background");
      expect(redStyles).toHaveProperty("text");
      expect(redStyles).toHaveProperty("accent");

      expect(whiteStyles).toHaveProperty("background");
      expect(whiteStyles).toHaveProperty("text");
      expect(whiteStyles).toHaveProperty("accent");
    });
  });

  describe("getPlayerDisplayName", () => {
    it("赤選手バリアントで選手名が指定されている場合、その名前を返す", () => {
      const result = getPlayerDisplayName("red", "山田");
      expect(result).toBe("山田");
    });

    it("白選手バリアントで選手名が指定されている場合、その名前を返す", () => {
      const result = getPlayerDisplayName("white", "鈴木");
      expect(result).toBe("鈴木");
    });

    it("赤選手バリアントで選手名が指定されていない場合、デフォルト名を返す", () => {
      const result = getPlayerDisplayName("red");
      expect(result).toBe("選手A");
    });

    it("白選手バリアントで選手名が指定されていない場合、デフォルト名を返す", () => {
      const result = getPlayerDisplayName("white");
      expect(result).toBe("選手B");
    });

    it("選手名が空文字列の場合、デフォルト名を返す", () => {
      const redResult = getPlayerDisplayName("red", "");
      const whiteResult = getPlayerDisplayName("white", "");
      
      expect(redResult).toBe("選手A");
      expect(whiteResult).toBe("選手B");
    });

    it("選手名がundefinedの場合、デフォルト名を返す", () => {
      const redResult = getPlayerDisplayName("red", undefined);
      const whiteResult = getPlayerDisplayName("white", undefined);
      
      expect(redResult).toBe("選手A");
      expect(whiteResult).toBe("選手B");
    });
  });

  describe("getPlayerPositionClass", () => {
    it("赤選手バリアントの場合は上部の位置クラスを返す", () => {
      const result = getPlayerPositionClass("red");
      expect(result).toBe("absolute top-5 right-16");
    });

    it("白選手バリアントの場合は下部の位置クラスを返す", () => {
      const result = getPlayerPositionClass("white");
      expect(result).toBe("absolute bottom-5 right-16");
    });

    it("返されるクラス名にabsoluteポジショニングが含まれている", () => {
      const redResult = getPlayerPositionClass("red");
      const whiteResult = getPlayerPositionClass("white");

      expect(redResult).toContain("absolute");
      expect(whiteResult).toContain("absolute");
    });

    it("返されるクラス名にright-16が含まれている", () => {
      const redResult = getPlayerPositionClass("red");
      const whiteResult = getPlayerPositionClass("white");

      expect(redResult).toContain("right-16");
      expect(whiteResult).toContain("right-16");
    });

    it("赤選手と白選手で異なる垂直位置クラスを返す", () => {
      const redResult = getPlayerPositionClass("red");
      const whiteResult = getPlayerPositionClass("white");

      expect(redResult).toContain("top-5");
      expect(whiteResult).toContain("bottom-5");
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

    it("元のオブジェクトの属性が保持される", () => {
      const players = [
        { lastName: "山田", firstName: "太郎" },
        { lastName: "鈴木", firstName: "一郎" },
      ];
      const result = generateDisplayNames(players);

      expect(result[0]).toHaveProperty("lastName", "山田");
      expect(result[0]).toHaveProperty("firstName", "太郎");
      expect(result[0]).toHaveProperty("displayName", "山田");
      
      expect(result[1]).toHaveProperty("lastName", "鈴木");
      expect(result[1]).toHaveProperty("firstName", "一郎");
      expect(result[1]).toHaveProperty("displayName", "鈴木");
    });
  });
});